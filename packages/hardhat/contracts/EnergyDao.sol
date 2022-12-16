// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
import "./EEDToken.sol";
import "./EnergyGovernor.sol";
import "./Sale.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Timers.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

/**
 * @title Contract for EnergyDAO
 * @author Baptiste and Philippe
 * @notice Dao in order to find best project for energy economy
 */
contract EnergyDao is Ownable {
    using SafeCast for uint256;

    enum ProposalState {
        Pending,
        Active,
        Ended,
        Rejected,
        Accepted,
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
        bool accepted;
        bool rejected;
    }

    struct Project {
        string name;
        address beneficiaryAddr;
        string description;
        uint32 department;
        Sector sector;
        string photos;
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
    mapping(address => mapping(uint => address)) voters;
    
    EnergyGovernor public governor;
    mapping (address => uint) public locks;

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
    uint256 public fees;
    uint public amountToLock;
    uint numberProject;
    uint numberQuotation;

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
        uint _nbTokenToLock,
        uint _numberProject,
        uint _numberQuotation
    ) {
        require(_mintAmount > 0, "Mint amount should not be 0");
        require(_mintAmount >= _saleAmount, "Mint amount should be higher than sale amount");
        require(_saleRate > 0, "_saleRate should not be 0");
        require(_saleClosingTime > 0, "_saleClosingTime  should not be 0");
        require(_craftsmanVotingPeriod > 0, "_craftsmanVotingPeriod  should not be 0");
        require(_quotationPeriod > 0, "_quotationPeriod should  not be 0");
        require(_votingPeriod > 0, "_votingPeriod should  not be 0");
        require(_voteExpire > 0, "_voteExpire should  not be 0");
        require(_nbTokenToLock > 0, "_nbTokenToLock should  not be 0");
        require(_saleAmount > _nbTokenToLock, "sale amount should be greater dans _nbTokenToLock");
        require(_numberProject > 0, "_numberProject should  not be 0");
        require(_numberQuotation > 0, "_numberQuotation should  not be 0");
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
        numberProject = _numberProject;
        numberQuotation = _numberQuotation;
    }

    /**
     * @notice register a craftman 
     * @dev Can be called by anyone
     * @param _name  name craftman
     * @param _addressCompany  address of company
     * @param _certification  document for certification
     */
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

    /**
     * @notice check if craftman validated by quorum
     * @dev Can be called by anyone
     * @param _addr  address of craftsman 
     * @return boolean
     */
    function isCraftsmanValidated(address _addr) public view returns(bool) {
        return craftsmans[_addr].isValidated;
    }

    /**
     * @notice validate a craftman
     * @dev Can only be called by the governor
     * @param _addr  address of craftsman 
     */
    function validateCraftsman(address _addr) public onlyGovernor {
        craftsmans[_addr].isValidated = true;
    }

    /**
     * @notice remove a craftman
     * @dev Can only be called by the governor
     * @param _addr  address of craftsman 
     */
    function removeCraftsman(address _addr) public onlyGovernor {
        craftsmans[_addr].isValidated = false;
    }

    /**
     * @notice check if a string is empty
     * @dev Can be called by anyone
     * @param _str  string to check
     * @return boolean
     */
    function isNotEmptyString(string calldata _str) internal pure returns(bool) {
        return keccak256(abi.encode(_str)) != keccak256(abi.encode(""));
    }

    /**
     * @notice add a project 
     * @dev Can be called by anyone if enough token to lock
     * @param _name  name of project
     * @param _desc  description of project
     * @param _department  deparment of project
     * @param _sector  sector enum of project
     * @param _photos  photos document of project
     * @param _diagnostic  diagnostic document of project
     * @param _plan  plan document of project
     */
    function addProject(
        string calldata _name,
        string calldata _desc,
        uint8 _department,
        Sector _sector,
        string memory _photos,
        string calldata _diagnostic,
        string calldata _plan
    ) external payable {
        require(projects.length < numberProject, "Project list is full");
        require(isNotEmptyString(_name)  && isNotEmptyString(_desc) && isNotEmptyString(_diagnostic)
            && isNotEmptyString(_plan) && _department != 0, "You must fill all fields");
        require(token.balanceOf(msg.sender) >= amountToLock + locks[msg.sender], "You don't have enough token to lock");        

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

    /**
     * @notice add a quotation to a project
     * @dev Can only be called by a validated craftsman
     * @param _id  id of project
     * @param _description  description of quotation
     * @param _docHash  document of quotation
     * @param _price  price of quotation
     * @param _nbCee  number of CEE estimated
     */
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
            projects[_id].nbQuotations < numberQuotation,
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

    /**
     * @notice remove a quotation to a project
     * @dev Can only be called by a validated craftsman
     * @param _projectId  id of project
     */
    function removeQuotation(uint _projectId) external onlyValidatedCraftsman {
        require(_projectId < projects.length, "Project doesn't exists");
        require(quotations[_projectId][msg.sender].craftsmanAddr != address(0), "No quotation for this project");
        quotations[_projectId][msg.sender].isDeleted = true;
        projects[_projectId].nbQuotations -= 1;
    }

    /**
     * @notice place a vote to a quotation on a project
     * @dev Can be called by anyone
     * @param _projectId  id of project
     * @param _account  address of person to delegate the vote
     * @param _craftsman  craftman chosen for the vote
     */
    function castVote(uint _projectId, address _account, address _craftsman) external {
        require(_state(_projectId, block.number) == ProposalState.Active, "Vote session is not active");
        require(!hasVoted(_projectId, _account), "Vote already cast");
        voters[_account][_projectId] = _craftsman;

        if (token.delegates(_account) == address(0)){
            token.delegate(_account);
        }

        uint weight = token.getVotes(_account);

        quotations[_projectId][_craftsman].weightVote += weight;

        emit Voted(_account, _projectId, _craftsman, weight);
    }

    /**
     * @notice get weight votes for a quotation
     * @dev Can be called by anyone
     * @param _projectId  id of project
     * @param _craftsmanAddr  craftman chosen for the vote
     * @return uint weight of the vote
     */

    function getVoteProject(uint _projectId, address _craftsmanAddr) public view returns (uint) {
        return quotations[_projectId][_craftsmanAddr].weightVote;
    }

     /**
     * @notice check if an address voted for a project
     * @dev Can be called by anyone
     * @param _projectId  id of project
     * @param _account  craftman chosen for the vote
     * @return bool weight of the vote
     */
    function hasVoted(uint256 _projectId, address _account) public view returns (bool) {
        return voters[_account][_projectId] != address(0);
    }

     /**
     * @notice get state of the project
     * @dev Can be called by anyone
     * @param _projectId  id of project
     * @return ProposalState enum of state
     */
    function getState(uint _projectId) external view returns(ProposalState) {
        return _state(_projectId, block.number + 1);
    }
         
    /**
     * @notice get state of the project
     * @dev Called internally
     * @param _projectId  id of project
     * @param _block  currrent block number
     * @return ProposalState enum of state
     */
    function _state(uint _projectId, uint _block) internal view returns(ProposalState) {
        Project memory project = projects[_projectId];

        if(project.voteInfo.accepted){
            return ProposalState.Accepted;
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

    /**
     * @notice compute calculation of weight, 
     * @dev Called internally
     * @param _projectId  id of project
     * @return address address of wining craftsman
     */
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
            else if(vote == weight && vote > 0) {
                if(quotations[_projectId][craftsman].nbCee >= quotations[_projectId][winner].nbCee){
                    weight = vote;
                    winner = craftsman;
                }
            }
        }
        return winner;
    }

    /**
     * @notice beneficiary can accept the project
     * @dev Can only be called by the beneficiary
     * @param _projectId  id of project
     */
    function accept(uint _projectId) external onlyBeneficiary(_projectId){
        ProposalState status = _state(_projectId, block.number);
        require(status == ProposalState.Ended, "Vote session is not ended");
        
        address winner = _computeProjectWinner(_projectId);
        if (winner == address(0)) {
            projects[_projectId].voteInfo.rejected = true;
        }
        else {
            projects[_projectId].choosedCraftsman = winner;
            projects[_projectId].voteInfo.accepted = true;
            craftsmans[winner].nbProjectsValidated += 1;
        }
        
        emit QuotationAccepted(_projectId, winner);
    }

    /**
     * @notice beneficiary can reject the project
     * @dev Can only be called by the beneficiary
     * @param _projectId  id of project
     */
    function reject(uint _projectId) external onlyBeneficiary(_projectId) {
        ProposalState status = _state(_projectId, block.number);
        require(status == ProposalState.Ended, "Vote session is not ended");
        
        projects[_projectId].voteInfo.rejected = true;

        emit QuotationRejected(_projectId);
    }

    /**
     * @notice lock an amount of token
     * @dev Called internally
     */
    function lock() internal {
        locks[msg.sender] += amountToLock;
        token.transferFrom(msg.sender, address(this), fees);
    }

    /**
     * @notice unlock an amount of token
     * @dev Called internally
     */
    function unlock(address _addr) internal {
        require(token.balanceOf(_addr) >= amountToLock, "You can't unlock that much");
        locks[_addr] -= amountToLock;    
    }

    /**
     * @notice calculate the fees
     * @dev Called internally
     */
    function _calculateFees(uint _amount) internal pure returns(uint) {
        return (1 * _amount) / 100;
    }


     /**
     * @notice Gets funds from `sale` into the contract
     * @dev Can only be called by the owner
     */
    function getFunds() public onlyOwner {
        sale.withdrawFunds();
    }

    /**
     * @notice Sends funds to a given `_receiver`
     * @dev Can only be called by the owner
     * @param _receiver Receiver address
     */
    function sendFunds(address _receiver) public onlyOwner {
        (bool sent, ) = _receiver.call{value: address(this).balance}("");
        require(sent, "Failed to send funds");
    }

     /**
     * @notice transfer to a given `_receiver`
     * @param _receiver Receiver address
     * @param amount amount to send
     */
    function transfer(address _receiver, uint amount) public onlyOwner {
        token.transfer(_receiver, amount);
    }

    fallback() external payable {}
    
    receive() external payable {}

}
