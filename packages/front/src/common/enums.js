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
    Pending: "En attente",
    Active: "En cours",
    Canceled: "Annulé",
    Defeated: "Défaite",
    Succeeded: "Succès",
    Queued: "Queued",
    Expired: "Expiré",
    Executed: "Exécuté",
    Finished: "Terminé, en attente du prochain block"
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

const ProposalProjectStates = {
    Pending: "Proposition de devis",
    Active: "Votes ouverts",
    Ended: "Votes terminés, en attente de la décision du bénéficiaire",
    Rejected: "Rejeté",
    Accepted: "Accepté",
    Expire: "Expiré"
}

const ProposalProjectStateCodes = {
    "0": ProposalProjectStates.Pending,
    "1": ProposalProjectStates.Active,
    "2": ProposalProjectStates.Ended,
    "3": ProposalProjectStates.Rejected,
    "4": ProposalProjectStates.Accepted,
    "5": ProposalProjectStates.Expire
}

const Votes = {
    Against: 0,
    For: 1,
    Abstain: 2
}


export { Status, StatusCodes, Sector, SectorCodes, ProposalState, ProposalStateCodes, Votes, ProposalProjectStates, ProposalProjectStateCodes};