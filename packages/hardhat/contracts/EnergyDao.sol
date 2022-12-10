// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
import "./EEDToken.sol";
import "./EnergyGovernor.sol";
import "./Sale.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract EnergyDao is Ownable {

    uint public state;

    enum ProjectStatus {
        Created,
        Tallied,
        Validated,
        Rejected
    }

    enum Sector {
        Industrie,
        Residentiel,
        Tertiaire
    }

    struct Project {
        uint256 creationDate;
        string name;
        address beneficiaryAddr;
        string description;
        uint8 department;
        Sector sector;
        string[] photos;
        string diagnostic;
        string plan;
        ProjectStatus status;
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
    mapping (address => uint256) public locks;

    // Amount of tokens to mint
    uint256 public mintAmount;

    /// Amount of tokens to sale
    uint256 public saleAmount;

    Sale public sale;

    EEDToken public token;

    uint256 timeToPropose;
    uint256 timeToVote;
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
    event QuotationRegistred(uint256 indexed idProject, address craftsmanAddr);
    event Voted(address addrSender, uint _idProject, address craftsmanAddr);
    event VoteTallied(uint256 idProject, address craftsmanAddr);
    event ProjectDecision(uint256 idProject);

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
        uint _timeToPropose,
        uint _timeToVote,
        uint _votingPeriod,
        uint _nbTokenToLock 
    ) {
        // todo ajouter require sur time
        require(_mintAmount >= _saleAmount, "Mint amount should be higher than sale amount");
        nbTokenToLock = _nbTokenToLock;
        token = new EEDToken(_mintAmount, nbTokenToLock);
        sale = new Sale(address(token), _saleRate, _saleClosingTime, address(this));
        token.approve(address(sale), _saleAmount);
        timeToPropose = _timeToPropose;
        timeToVote = _timeToVote;
        governor = new EnergyGovernor(token, 0, _votingPeriod);
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

    // function _proposeCraftsman() internal returns (uint) {
    //     address[] memory addr = new address[](1);
    //     addr[0] = address(this);
    //     uint[] memory values = new uint[](1);
    //     string memory description = "validateCraftsman";
    //     bytes memory transferPayload = abi.encodeWithSignature("validateCraftsman(address)", msg.sender);
    //     bytes[] memory calldatas = new bytes[](1);
    //     calldatas[0] = transferPayload;
    //     return governor.propose(addr, values, calldatas, description);
    // }

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
        require(projects.length < 1000, "Project list is full");
        require(isNotEmptyString(_name)  && isNotEmptyString(_desc) && isNotEmptyString(_diagnostic)
        && isNotEmptyString(_plan) && _department != 0 && _photos.length > 0, "You must fill all fields");
        require( _photos.length < 5, "You can't upload more than 5 documents");
        Project memory project;
        project.name = _name;
        project.beneficiaryAddr = msg.sender;
        project.description = _desc;
        project.department = _department;
        project.sector = _sector;
        project.photos = _photos;
        project.diagnostic = _diagnostic;
        project.plan = _plan;
        project.creationDate = block.timestamp;
        projects.push(project);

        lock();

        emit ProjectRegistered(
            msg.sender,
            projects.length - 1,
            _name,
            _sector
        );
    }

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
            block.timestamp - projects[_id].creationDate < timeToPropose, "Proposal session is close for this project"
        );

        Quotation memory quotation;
        quotation.craftsmanAddr = msg.sender;
        quotation.documentHash = _docHash;
        quotation.price = _price;
        quotation.nbCee = _nbCee;
        quotation.description = _description;

        quotations[_id][msg.sender] = quotation;
        projects[_id].craftsmans.push(msg.sender);
        projects[_id].nbQuotations += 1;

        lock();

        emit QuotationRegistred(_id, msg.sender);
    }

    function removeQuotation(uint _projectId) external onlyValidatedCraftsman {
        quotations[_projectId][msg.sender].isDeleted = true;
    }

    function setVote(uint _projectId, address _craftsmanAddr) external {
        require(_projectId < projects.length, "Project doesn't exists");
        require(quotations[_projectId][_craftsmanAddr].craftsmanAddr != address(0), "No quotation available for this craftman / project");
        require(
            (block.timestamp >= (projects[_projectId].creationDate + timeToPropose)), "Vote session is not open yet for this project"
        );
        require(
            (block.timestamp - (projects[_projectId].creationDate + timeToPropose)) < timeToVote, "Vote session is close for this project"
        );
        require(voters[msg.sender][_projectId] == address(0), "You already vote for this project");
        if (token.delegates(msg.sender) == address(0)){
            token.delegate(msg.sender);
        }
        uint weight;
        weight = token.getVotes(msg.sender);
        quotations[_projectId][_craftsmanAddr].weightVote += weight;
        voters[msg.sender][_projectId] = _craftsmanAddr;
        emit Voted(msg.sender, _projectId, _craftsmanAddr);
    }

    function tallyVotes(uint _projectId) external onlyBeneficiary(_projectId) {
        require(_projectId < projects.length, "Project doesn't exists");
        require(
            (block.timestamp >= (projects[_projectId].creationDate + timeToPropose + timeToVote)), "Vote session is not finished yet for this project"
        );
        require(projects[_projectId].status == ProjectStatus.Created, "This project is already tallied");
        address _winningCraftsman;
        uint voteCount;
        voteCount = 0;
        for(uint i=0; i < projects[_projectId].craftsmans.length ; i++){
            address craftsmanAddr;
            craftsmanAddr = projects[_projectId].craftsmans[i];
            unlock(craftsmanAddr);
            if(quotations[_projectId][craftsmanAddr].weightVote > voteCount){
                voteCount = quotations[_projectId][craftsmanAddr].weightVote;
                _winningCraftsman = craftsmanAddr;
            }
        projects[_projectId].choosedCraftsman = _winningCraftsman;
        projects[_projectId].status = ProjectStatus.Tallied;
        emit VoteTallied(_projectId, _winningCraftsman);
        }

    }

    function projectDecision(uint _projectId, bool _decision) public onlyBeneficiary(_projectId) {
        require(projects[_projectId].status == ProjectStatus.Tallied, "Project vote is not tallied yet");
        Project storage project = projects[_projectId];
        if (_decision) {
            project.status = ProjectStatus.Validated;
        } else {
            project.status = ProjectStatus.Rejected;
        }
        craftsmans[project.choosedCraftsman].nbProjectsValidated += 1;
        emit ProjectDecision(_projectId);
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
