// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
import "./EEDToken.sol";
import "./EnergyGovernor.sol";
import "./Sale.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Timers.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "hardhat/console.sol";



contract EnergyDao is Ownable {
    using SafeCast for uint256;

    enum ProposalState {
        Pending,
        Active,
        Ended,
        Rejected,
        Executed,
        Expired
    }

    enum Sector {
        Industrie,
        Residentiel,
        Tertiaire
    }

    struct VoteInfo {
        uint64 voteStart;
        uint64 voteEnd;
        uint64 voteExpire;
        bool executed;
        bool rejected;
    }

    struct Project {
        string name;
        address beneficiaryAddr;
        string description;
        uint32 department;
        Sector sector;
        string[] photos;
        string diagnostic;
        string plan;
        VoteInfo voteInfo;
        uint8 nbQuotations;
        address[] craftsmans;
        address choosedCraftsman;
    }

    struct Quotation {
        address craftsmanAddr;
        string description;
        string documentHash;
        uint price;
        uint128 nbCee;
        bool isValidated;
        bool isDeleted;
        uint256 proposalId;
        uint256 weightVote;
    }

    struct Craftsman {
        address craftsmanAddr;
        string name;
        string addressCompany;
        string certification;
        uint256 nbProjectsValidated;
        bool isValidated;
    }

    Project[] public projects;
    mapping(address => Craftsman) public craftsmans;
    mapping(uint256 => mapping(address => Quotation)) public quotations;
    mapping (uint => mapping(address => uint)) craftsmanVotes;
    mapping(address => mapping(uint => address)) voters;
    
    EnergyGovernor public governor;
    mapping (address => uint256) public locks;

    // Amount of tokens to mint
    uint256 public mintAmount;

    /// Amount of tokens to sale
    uint256 public saleAmount;

    Sale public sale;

    EEDToken public token;

    uint quotationPeriod;
    uint votingPeriod;
    uint voteExpire;
    uint256 nbTokenToLock;
    uint256 fees;
    uint amountToLock;

    event ProjectRegistered(
        address beneficiary,
        uint256 id,
        string name,
        Sector sector
    );

    event CraftsmanRegistered(address craftsmanAddress);
    event QuotationRegistred(uint256 indexed projectId, address craftsmanAddr);
    event Voted(address account, uint indexed projectId, address craftsmanAddr, uint weight);
    event QuotationAccepted(uint256 projectId, address craftsmanAddr);
    event QuotationRejected(uint256 projectId);

    modifier onlyValidatedCraftsman() {
        require(isCraftsmanValidated(msg.sender), "You are not a validated craftsman");
        _;
    }

    modifier onlyGovernor() {
        require(msg.sender == address(governor), "You are not the governor");
        _;
    }

    modifier onlyBeneficiary(uint _id) {
        require(msg.sender == projects[_id].beneficiaryAddr, "You are not the beneficiary");
        _;
    }

    constructor(
        uint _mintAmount, 
        uint _saleAmount,
        uint _saleRate,
        uint _saleClosingTime,
        uint _craftsmanVotingPeriod,
        uint _quotationPeriod,
        uint _votingPeriod,
        uint _voteExpire,
        uint _nbTokenToLock 
    ) {
        // todo ajouter REQUIRE
        require(_mintAmount >= _saleAmount, "Mint amount should be higher than sale amount");
        nbTokenToLock = _nbTokenToLock;
        token = new EEDToken(_mintAmount, nbTokenToLock);
        sale = new Sale(address(token), _saleRate, _saleClosingTime, address(this));
        token.approve(address(sale), _saleAmount);
        quotationPeriod = _quotationPeriod;
        voteExpire = _voteExpire;
        votingPeriod = _votingPeriod;
        governor = new EnergyGovernor(token, 0, _craftsmanVotingPeriod);
        fees = _calculateFees(nbTokenToLock);
        amountToLock = nbTokenToLock - fees;
    }

    function registerCraftsman(
        string calldata _name,
        string calldata _addressCompany,
        string calldata _certification
            ) external {
        require(
            craftsmans[msg.sender].craftsmanAddr == address(0),
            "Already registered as craftsman"
        );

        require(isNotEmptyString(_name)  && isNotEmptyString(_addressCompany) 
        && isNotEmptyString(_certification),"You must fill all fields");

        craftsmans[msg.sender].craftsmanAddr = msg.sender;
        craftsmans[msg.sender].name = _name;
        craftsmans[msg.sender].addressCompany = _addressCompany;
        craftsmans[msg.sender].certification = _certification;

        emit CraftsmanRegistered(msg.sender);
    }

    function isCraftsmanValidated(address _address) public view returns(bool) {
        return craftsmans[_address].isValidated;
    }

    function validateCraftsman(address _addr) public onlyGovernor {
        craftsmans[_addr].isValidated = true;
    }

    function isNotEmptyString(string calldata _str) internal pure returns(bool) {
        return keccak256(abi.encode(_str)) != keccak256(abi.encode(""));
    }

    function addProject(
        string calldata _name,
        string calldata _desc,
        uint8 _department,
        Sector _sector,
        string[] memory _photos,
        string calldata _diagnostic,
        string calldata _plan
    ) external {
        require(projects.length < 100000, "Project list is full");

        require(isNotEmptyString(_name)  && isNotEmptyString(_desc) && isNotEmptyString(_diagnostic)
        && isNotEmptyString(_plan) && _department != 0 && _photos.length > 0, "You must fill all fields");
        require( _photos.length < 5, "You can't upload more than 5 documents");

        Project memory  project;
        project.name = _name;
        project.beneficiaryAddr = msg.sender;
        project.description = _desc;
        project.department = _department;
        project.sector = _sector;
        project.photos = _photos;
        project.diagnostic = _diagnostic;
        project.plan = _plan;

        project.voteInfo.voteStart = block.number.toUint64() + quotationPeriod.toUint64();
        project.voteInfo.voteEnd = project.voteInfo.voteStart + votingPeriod.toUint64();
        project.voteInfo.voteExpire = project.voteInfo.voteEnd + voteExpire.toUint64();
        
        projects.push(project);

        lock();

        emit ProjectRegistered(msg.sender, projects.length - 1, _name, _sector);
    }

    // function cleanProjects() public onlyGovernor {

    // }

    function proposeQuotation(
        uint256 _id,
        string calldata _description,
        string calldata _docHash,
        uint _price,
        uint128 _nbCee
    ) external onlyValidatedCraftsman {
        require(isNotEmptyString(_description)  && isNotEmptyString(_docHash)
         && _price != 0 && _nbCee != 0, "You must fill all fields");
        require(_id < projects.length, "Project doesn't exists");
        require(
            projects[_id].nbQuotations <= 10,
            "Quotation list for this project is full"
        );
        require(
            projects[_id].beneficiaryAddr != msg.sender,
            "You can't propose quotation for your project"
        );
        require(
            quotations[_id][msg.sender].craftsmanAddr == address(0),
            "You already proposed a quotation for this project"
        );
        require(
            block.number <= projects[_id].voteInfo.voteStart, "Proposal session is close for this project"
        );

        Quotation storage quotation = quotations[_id][msg.sender];
        quotation.craftsmanAddr = msg.sender;
        quotation.documentHash = _docHash;
        quotation.price = _price;
        quotation.nbCee = _nbCee;
        quotation.description = _description;

        projects[_id].craftsmans.push(msg.sender);
        projects[_id].nbQuotations += 1;

        lock();

        emit QuotationRegistred(_id, msg.sender);
    }

    function removeQuotation(uint _projectId) external onlyValidatedCraftsman {
        quotations[_projectId][msg.sender].isDeleted = true;
    }


    function castVote(uint _projectId, address _account, address _craftsman) external {
        require(_state(_projectId, block.number) == ProposalState.Active, "Vote session is not active");
        require(!hasVoted(_projectId, _account), "Vote already cast");
        voters[_account][_projectId] = _craftsman;

        if (token.delegates(_account) == address(0)){
            token.delegate(_account);
        }

        uint weight = token.getVotes(_account);

        craftsmanVotes[_projectId][_craftsman] += weight;

        emit Voted(_account, _projectId, _craftsman, weight);
    }

    function getVoteProject(uint _projectId, address _craftsmanAddr) public view returns (uint) {
        return craftsmanVotes[_projectId][_craftsmanAddr];
    }

    function hasVoted(uint256 _projectId, address _account) public view returns (bool) {
        return voters[_account][_projectId] != address(0);
    }

    function getState(uint _projectId) external view returns(ProposalState) {
        return _state(_projectId, block.number + 1);
    }

    function _state(uint _projectId, uint _block) internal view returns(ProposalState) {
        Project memory project = projects[_projectId];

        if(project.voteInfo.executed){
            return ProposalState.Executed;
        }

        if(project.voteInfo.rejected){
            return ProposalState.Rejected;
        }

        uint voteStart = projects[_projectId].voteInfo.voteStart;

        if(voteStart >= _block) {
            return ProposalState.Pending;
        }

        uint voteEnd = projects[_projectId].voteInfo.voteEnd;
        if (voteEnd >= _block){
            return ProposalState.Active;
        }

        uint _voteExpire = projects[_projectId].voteInfo.voteExpire;
        if (_voteExpire >= _block) {
            return ProposalState.Ended;
        }

        return ProposalState.Expired;
    }

     function _computeProjectWinner(uint _projectId) internal view returns (address) {
        if (projects[_projectId].nbQuotations == 0){
            return address(0);
        }
        uint weight;
        address winner;

        for(uint i=0; i < projects[_projectId].craftsmans.length ; i++){ 
            address craftsman = projects[_projectId].craftsmans[i];
            uint vote = getVoteProject(_projectId, craftsman);
            if (vote > weight) {
                weight = vote;
                winner = craftsman;
            }
        }
        return winner;
    }

    function execute(uint _projectId) external onlyBeneficiary(_projectId){
        ProposalState status = _state(_projectId, block.number);
        require(status == ProposalState.Ended, "Vote session is not ended");
        
        address winner = _computeProjectWinner(_projectId);
        if (winner == address(0)) {
            projects[_projectId].voteInfo.rejected = true;
        }
        else {
            projects[_projectId].choosedCraftsman = winner;
            projects[_projectId].voteInfo.executed = true;
            craftsmans[winner].nbProjectsValidated += 1;
        }

        emit QuotationAccepted(_projectId, winner);
    }

    function reject(uint _projectId) external onlyBeneficiary(_projectId) {
        ProposalState status = _state(_projectId, block.number);
        require(status == ProposalState.Ended);
        
        projects[_projectId].voteInfo.rejected = true;

        emit QuotationRejected(_projectId);
    }

    function lock() internal {
        require(token.balanceOf(msg.sender) >= amountToLock + locks[msg.sender], "You don't have enough token in your account");
        token.transferFrom(msg.sender, address(this), fees);
        locks[msg.sender] += amountToLock;  
    }

    function unlock(address _addr) internal {
        require(token.balanceOf(_addr) >= amountToLock, "You can't unlock that much");
        locks[_addr] -= amountToLock;    
    }

    function _calculateFees(uint _amount) internal pure returns(uint) {
        return (1 * _amount) / 100;
    }


     /**
     * @dev Gets funds from `sale` into the contract
     */
    function getFunds() public onlyOwner {
        sale.withdrawFunds();
    }

    /**
     * @dev Sends funds to a given `_receiver`
     * @param _receiver Receiver address
     */
    function sendFunds(address _receiver) public onlyOwner {
        (bool sent, ) = _receiver.call{value: address(this).balance}("");
        require(sent, "Failed to send funds");
    }

    function transfer(address _receiver, uint amount) public onlyOwner {
        token.transfer(_receiver, amount);
    }

    fallback() external payable {}
    
    receive() external payable {}

}
