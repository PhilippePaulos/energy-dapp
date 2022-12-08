const Sector = {
    Industrie: "Industrie",
    Residentiel: "Residentiel",
    Tertiaire: "Tertiaire"
}

const SectorCodes = {
    "0": Sector.Industrie ,
    "1": Sector.Residentiel, 
    "2": Sector.Tertiaire
} 

const Status = {
    Created: "Created",
    Tallied: "Tallied",
    Validated: "Validated",
    Rejected: "Rejected",
}

const StatusCodes = {
    "0": Status.Created,
    "1": Status.Tallied,
    "2": Status.Validated,
    "3": Status.Rejected,
}

export { Status, StatusCodes, Sector, SectorCodes};