// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "./EEDToken.sol";
import "./EnergyGovernor.sol";
import "./Sale.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract EnergyDao is Ownable {

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
        uint256 department;
        Sector sector;
        string[] photos;
        string diagnostic;
        string plan;
        ProjectStatus status;
        uint8 nbQuotations;
        address choosedCraftman;
    }

    struct Quotation {
        address craftmanAddr;
        string description;
        string documentHash;
        uint8 price;
        uint128 nbCee;
        bool isValidated;
        uint256 proposalId;
    }

    struct Craftman {
        address craftmanAddr;
        string name;
        string addressCompany;
        string certification;
        uint256 nbProjectsValidated;
        bool isValidated;
    }

    Project[] public projects;
    mapping(address => Craftman) public craftmans;
    mapping(uint256 => mapping(address => Quotation)) quotations;
    EnergyGovernor public governor;

    // Amount of tokens to mint
    uint256 public mintAmount;

    /// Amount of tokens to sale
    uint256 public saleAmount;

    Sale public sale;

    EEDToken public token;

    uint256 timeToPropose;
    uint256 timeToVote;

    event ProjectRegistered(
        uint256 id,
        string name,
        Sector sector,
        ProjectStatus status
    );

    event CraftmanRegistered(address craftmanAddress);
    event QuotationRegistred(uint256 idProject, address craftmanAddr);

    modifier onlyValidatedCraftman() {
        require(isCraftmanValidated(msg.sender), "You are not a validated craftman");
        _;
    }

    modifier onlyGovernor() {
        require(msg.sender == address(governor), "You are not the governor");
        _;
    }

    constructor(
        uint _mintAmount, 
        uint _saleAmount,
        uint _saleRate,
        uint _saleClosingTime,
        uint256 _timeToPropose,
        uint256 _timeToVote
    ) {
        // todo ajouter require sur time
        require(_mintAmount >= _saleAmount, "Mint amount should be higher than sale amount");
        token = new EEDToken(_mintAmount);
        sale = new Sale(address(token), _saleRate, _saleClosingTime, address(this));
        token.approve(address(sale), _saleAmount);
        timeToPropose = _timeToPropose;
        timeToVote = _timeToVote;
        governor = new EnergyGovernor(token, 0, _timeToVote);
    }

    function registerCraftman(
        string calldata _name,
        string calldata _addressCompany,
        string calldata _certification
    ) external {
        require(
            craftmans[msg.sender].craftmanAddr == address(0),
            "Already registered as craftman"
        );
        craftmans[msg.sender].craftmanAddr = msg.sender;
        craftmans[msg.sender].name = _name;
        craftmans[msg.sender].addressCompany = _addressCompany;
        craftmans[msg.sender].certification = _certification;

        emit CraftmanRegistered(msg.sender);
    }

    function isCraftmanValidated(address _address) public view returns(bool) {
        return craftmans[_address].isValidated;
    }

    function validateCraftman(address _addr) public onlyGovernor {
        craftmans[_addr].isValidated = true;
    }

    function addProject(
        string calldata _name,
        string calldata _desc,
        uint256 _department,
        Sector _sector,
        string[] memory _photos,
        string calldata _diagnostic,
        string memory _plan
    ) external {
        require(projects.length < 1000, "Project list is full");
        //require(1=1, "Check that the sender as enough token stake to propose a project");
        Project memory project;
        project.name = _name;
        project.beneficiaryAddr = msg.sender;
        project.description = _desc;
        project.department = _department;
        project.sector = _sector;
        project.photos = _photos;
        project.diagnostic = _diagnostic;
        project.plan = _plan;
        projects.push(project);

        emit ProjectRegistered(
            projects.length - 1,
            _name,
            _sector,
            ProjectStatus.Created
        );
    }

    function proposeQuotation(
        uint256 _id,
        string calldata _description,
        string calldata _docHash,
        uint8 _price,
        uint128 _nbCee
    ) external onlyValidatedCraftman {
        //require(1=1, "Check that the sender as enough token stake to propose a quotation");
        // require parameters not empty
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
            quotations[_id][msg.sender].craftmanAddr == address(0),
            "You already proposed a quotation for this project"
        );

        Quotation memory quotation;
        quotation.craftmanAddr = msg.sender;
        quotation.documentHash = _docHash;
        quotation.price = _price;
        quotation.nbCee = _nbCee;
        quotation.description = _description;

        quotations[_id][msg.sender] = quotation;
        projects[_id].nbQuotations += 1;

        emit QuotationRegistred(_id, msg.sender);
    }

    function projectDecision(uint _projectId, bool _decision) public {
        Project storage project = projects[_projectId];
        require(msg.sender == project.beneficiaryAddr, "You are not the beneficiary");
        if (_decision) {
            project.status = ProjectStatus.Validated;
        } else {
            project.status = ProjectStatus.Rejected;
        }
        craftmans[project.choosedCraftman].nbProjectsValidated += 1;
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
