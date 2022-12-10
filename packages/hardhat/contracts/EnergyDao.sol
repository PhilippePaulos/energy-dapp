// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "./EEDToken.sol";
import "./EnergyGovernor.sol";
import "./Sale.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";



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
        address choosedCraftsman;
    }

    struct Quotation {
        address craftsmanAddr;
        string description;
        string documentHash;
        uint price;
        uint128 nbCee;
        bool isValidated;
        uint256 proposalId;
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
        address beneficiary
    );

    event CraftsmanRegistered(address craftsmanAddress);
    event QuotationRegistred(uint256 indexed idProject, address craftsmanAddr);

    modifier onlyValidatedCraftsman() {
        require(isCraftsmanValidated(msg.sender), "You are not a validated craftsman");
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
        uint _timeToPropose,
        uint _timeToVote,
        uint _votingPeriod 
    ) {
        // todo ajouter require sur time
        require(_mintAmount >= _saleAmount, "Mint amount should be higher than sale amount");
        token = new EEDToken(_mintAmount);
        sale = new Sale(address(token), _saleRate, _saleClosingTime, address(this));
        token.approve(address(sale), _saleAmount);
        timeToPropose = _timeToPropose;
        timeToVote = _timeToVote;
        governor = new EnergyGovernor(token, 0, _votingPeriod);
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
        console.log("coucou");
        craftsmans[msg.sender].craftsmanAddr = msg.sender;
        craftsmans[msg.sender].name = _name;
        craftsmans[msg.sender].addressCompany = _addressCompany;
        craftsmans[msg.sender].certification = _certification;

        // uint proposalId = _proposeCraftsman();

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

    function addProject(
        string calldata _name,
        string calldata _desc,
        uint8 _department,
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
            msg.sender
        );
    }

    function proposeQuotation(
        uint256 _id,
        string calldata _description,
        string calldata _docHash,
        uint _price,
        uint128 _nbCee
    ) external onlyValidatedCraftsman {
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
            quotations[_id][msg.sender].craftsmanAddr == address(0),
            "You already proposed a quotation for this project"
        );

        Quotation memory quotation;
        quotation.craftsmanAddr = msg.sender;
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
        craftsmans[project.choosedCraftsman].nbProjectsValidated += 1;
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
