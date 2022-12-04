// SPDX-License-Identifier: MIT

pragma solidity^0.8.9;

contract EnergyDao {


    enum ProjectStatus {
        Registered,
        QuotationRegistrationStarted,
        QuotationRegistrationEnded,
        QuotationSessionStarted,
        QuotationSessionEnded,
        VotesTallied
        //funding started
        //funding ended
        //works started
        //works ended
    }

    enum Sector {
        industrie,
        residentiel,
        tertiaire
    }

    struct File {
        string filePath;
        uint256 fileSize;
        string fileType;
        string fileName;
        //address payable uploader;
    }

    struct Project {
        address addressBeneficiary;
        string name;
        string description;
        uint department;
        Sector sector;
        string[] photos;
        string diagnostic;
        string plan;
        ProjectStatus status;
    }

    struct Quotation {
        string description;
        uint8 price;
        uint8 nbWorkingDays;
    }

    struct Craftman {
        string name;
        string addressCompany;
        string certification;
        uint nbProjectsValidated;
        uint[] quotationProposed;
    }

    Craftman[] craftmanArray;
    Project[] projectArray;
    mapping (address => Craftman) craftmans;
    mapping (uint => Quotation[]) projectQuotationsArray;
    mapping (address => mapping (uint => bool)) craftmansQuotations;
    mapping (address => mapping (uint => bool)) voters;

    event ProjectRegistered(uint projectId);
    event CraftmanRegistered(address craftmanAddress);
    event QuotationToProjectRegistered(uint idProject, uint idQuotation);

    modifier onlyCraftman() {
        require(checkCraftman(msg.sender), "You are not a craftman");
        _;
    }

    // ::::::::::::: GETTERS ::::::::::::: //

    function getProject(uint _id) public view returns (Project memory) {
        return projectArray[_id];
    }


    // ::::::::::::: CHECKERS ::::::::::::: //

    function checkCraftman(address _addr) public view returns (bool) {
        return bytes(craftmans[_addr].name).length > 0;
    }

    function checkVotersVoted(uint _id) public view returns (bool) {
        return voters[msg.sender][_id];
    }

    function checkCraftmanQuotation(uint _id) public view  returns (bool) {
        return craftmansQuotations[msg.sender][_id];
    }


    function registerCraftman(string calldata _name, string calldata _addressCompany, string calldata _certification) external {
        require(checkCraftman(msg.sender) != true, "Already registered as craftman");
        craftmans[msg.sender].name = _name;
        craftmans[msg.sender].certification = _certification;
        craftmans[msg.sender].addressCompany = _addressCompany;
        emit CraftmanRegistered(msg.sender);

    }

    function addProject(string calldata _name, string calldata _desc, uint _department, Sector _sector,
     string[] memory _photos, string calldata _diagnostic, string calldata _plan) external {
        require(projectArray.length <= 1000, "Project list is full");
        //require(1=1, "Check that the sender as enough token stake to propose a project");
        Project memory project;
        project.addressBeneficiary = msg.sender;
        project.name = _name;
        project.description = _desc;
        project.department = _department;
        project.sector = _sector;
        project.photos = _photos;
        project.diagnostic = _diagnostic;
        project.plan = _plan;
        projectArray.push(project);
        emit ProjectRegistered(projectArray.length-1);
    }

    function proposeQuotationToProject(uint _id, string calldata _desc, uint8 _price, uint8 _nbWorkingDays) external onlyCraftman {
        //require(1=1, "Check that the sender as enough token stake to propose a quotation");
        require(_id < projectArray.length, "Project doesn't exists");
        require(projectQuotationsArray[_id].length <= 10, "Quotation list for this project is full");
        require(projectArray[_id].addressBeneficiary != msg.sender, "You can't propose quotation for your project");
        require(checkCraftmanQuotation(_id) == false, "You already proposed a quotation for this project");
        
        Quotation memory quotation;
        quotation.description = _desc;
        quotation.price = _price;
        quotation.nbWorkingDays = _nbWorkingDays;
        craftmans[msg.sender].quotationProposed.push(_id);
        projectQuotationsArray[_id].push(quotation);
        emit QuotationToProjectRegistered(_id, projectQuotationsArray[_id].length-1);
    }

    function setVote(uint _idProject, uint _idQuotation) external {
        //require(1=1, "Check that the sender as enough token stake to vote");
        require(checkVotersVoted(_idProject) == false, "You already vote for this project");



    }

}