// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "./EEDToken.sol";
import "./EnergyGovernor.sol";
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
        uint256 budget;
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
    EnergyGovernor governor;

    EEDToken token;
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

    modifier onlyCraftman() {
        require(craftmans[msg.sender].isValidated, "You are not a craftman");
        _;
    }

    modifier onlyGovernor() {
        require(msg.sender == address(governor), "You are not the governor");
        _;
    }

    constructor(
        EEDToken _token,
        uint256 _timeToPropose,
        uint256 _timeToVote,
        EnergyGovernor _governor
    ) {
        // require sur time
        token = _token;
        timeToPropose = _timeToPropose;
        timeToVote = _timeToVote;
        governor = _governor;
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

    function validateCraftman(address _addr) public onlyGovernor {
        craftmans[_addr].isValidated = true;
    }

    function addProject(
        string calldata _name,
        uint256 _budget,
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
        project.budget = _budget;
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
        string calldata description,
        string calldata _docHash,
        uint8 _price,
        uint128 _nbCee
    ) external onlyCraftman {
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
        quotation.description = description;

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

}
