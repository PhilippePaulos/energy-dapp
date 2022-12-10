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

const ProposalState = {
    Pending: "Pending",
    Active: "Active",
    Canceled: "Canceled",
    Defeated: "Defeated",
    Succeeded: "Succeeded",
    Queued: "Queued",
    Expired: "Expired",
    Executed: "Executed"
}

const ProposalStateCodes = {
    "0": ProposalState.Pending,
    "1": ProposalState.Active,
    "2": ProposalState.Canceled,
    "3": ProposalState.Defeated,
    "4": ProposalState.Succeeded,
    "5": ProposalState.Queued,
    "6": ProposalState.Expired,
    "7": ProposalState.Executed,
}

const Votes = {
    Against: 0,
    For: 1,
    Abstain: 2
}


export { Status, StatusCodes, Sector, SectorCodes, ProposalState, ProposalStateCodes, Votes};