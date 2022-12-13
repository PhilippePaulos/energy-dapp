# Solidity API

## EEDToken

### amountStake

```solidity
uint256 amountStake
```

### constructor

```solidity
constructor(uint256 _mintAmount, uint256 _amountStake) public
```

### transfer

```solidity
function transfer(address to, uint256 amount) public virtual returns (bool)
```

_See {IERC20-transfer}.

Requirements:

- `to` cannot be the zero address.
- the caller must have a balance of at least `amount`._

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 amount) public virtual returns (bool)
```

_See {IERC20-transferFrom}.

Emits an {Approval} event indicating the updated allowance. This is not
required by the EIP. See the note at the beginning of {ERC20}.

NOTE: Does not update the allowance if the current allowance
is the maximum `uint256`.

Requirements:

- `from` and `to` cannot be the zero address.
- `from` must have a balance of at least `amount`.
- the caller must have allowance for ``from``'s tokens of at least
`amount`._

### _afterTokenTransfer

```solidity
function _afterTokenTransfer(address from, address to, uint256 amount) internal
```

### _mint

```solidity
function _mint(address to, uint256 amount) internal
```

### _burn

```solidity
function _burn(address account, uint256 amount) internal
```

## EnergyDao

Dao in order to find best project for energy economy

### ProposalState

```solidity
enum ProposalState {
  Pending,
  Active,
  Ended,
  Rejected,
  Accepted,
  Expired
}
```

### Sector

```solidity
enum Sector {
  Industrie,
  Residentiel,
  Tertiaire
}
```

### VoteInfo

```solidity
struct VoteInfo {
  uint64 voteStart;
  uint64 voteEnd;
  uint64 voteExpire;
  bool accepted;
  bool rejected;
}
```

### Project

```solidity
struct Project {
  string name;
  address beneficiaryAddr;
  string description;
  uint32 department;
  enum EnergyDao.Sector sector;
  string[] photos;
  string diagnostic;
  string plan;
  struct EnergyDao.VoteInfo voteInfo;
  uint8 nbQuotations;
  address[] craftsmans;
  address choosedCraftsman;
}
```

### Quotation

```solidity
struct Quotation {
  address craftsmanAddr;
  string description;
  string documentHash;
  uint256 price;
  uint128 nbCee;
  bool isValidated;
  bool isDeleted;
  uint256 proposalId;
  uint256 weightVote;
}
```

### Craftsman

```solidity
struct Craftsman {
  address craftsmanAddr;
  string name;
  string addressCompany;
  string certification;
  uint256 nbProjectsValidated;
  bool isValidated;
}
```

### projects

```solidity
struct EnergyDao.Project[] projects
```

### craftsmans

```solidity
mapping(address => struct EnergyDao.Craftsman) craftsmans
```

### quotations

```solidity
mapping(uint256 => mapping(address => struct EnergyDao.Quotation)) quotations
```

### voters

```solidity
mapping(address => mapping(uint256 => address)) voters
```

### governor

```solidity
contract EnergyGovernor governor
```

### locks

```solidity
mapping(address => uint256) locks
```

### mintAmount

```solidity
uint256 mintAmount
```

### saleAmount

```solidity
uint256 saleAmount
```

Amount of tokens to sale

### sale

```solidity
contract Sale sale
```

### token

```solidity
contract EEDToken token
```

### quotationPeriod

```solidity
uint256 quotationPeriod
```

### votingPeriod

```solidity
uint256 votingPeriod
```

### voteExpire

```solidity
uint256 voteExpire
```

### nbTokenToLock

```solidity
uint256 nbTokenToLock
```

### fees

```solidity
uint256 fees
```

### amountToLock

```solidity
uint256 amountToLock
```

### numberProject

```solidity
uint256 numberProject
```

### numberQuotation

```solidity
uint256 numberQuotation
```

### ProjectRegistered

```solidity
event ProjectRegistered(address beneficiary, uint256 id, string name, enum EnergyDao.Sector sector)
```

### CraftsmanRegistered

```solidity
event CraftsmanRegistered(address craftsmanAddress)
```

### QuotationRegistred

```solidity
event QuotationRegistred(uint256 projectId, address craftsmanAddr)
```

### Voted

```solidity
event Voted(address account, uint256 projectId, address craftsmanAddr, uint256 weight)
```

### QuotationAccepted

```solidity
event QuotationAccepted(uint256 projectId, address craftsmanAddr)
```

### QuotationRejected

```solidity
event QuotationRejected(uint256 projectId)
```

### onlyValidatedCraftsman

```solidity
modifier onlyValidatedCraftsman()
```

### onlyGovernor

```solidity
modifier onlyGovernor()
```

### onlyBeneficiary

```solidity
modifier onlyBeneficiary(uint256 _id)
```

### constructor

```solidity
constructor(uint256 _mintAmount, uint256 _saleAmount, uint256 _saleRate, uint256 _saleClosingTime, uint256 _craftsmanVotingPeriod, uint256 _quotationPeriod, uint256 _votingPeriod, uint256 _voteExpire, uint256 _nbTokenToLock, uint256 _numberProject, uint256 _numberQuotation) public
```

### registerCraftsman

```solidity
function registerCraftsman(string _name, string _addressCompany, string _certification) external
```

register a craftman

_Can be called by anyone_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _name | string | name craftman |
| _addressCompany | string | address of company |
| _certification | string | document for certification |

### isCraftsmanValidated

```solidity
function isCraftsmanValidated(address _addr) public view returns (bool)
```

check if craftman validated by quorum

_Can be called by anyone_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | address of craftsman |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean |

### validateCraftsman

```solidity
function validateCraftsman(address _addr) public
```

validate a craftman

_Can only be called by the governor_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | address of craftsman |

### removeCraftsman

```solidity
function removeCraftsman(address _addr) public
```

remove a craftman

_Can only be called by the governor_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | address of craftsman |

### isNotEmptyString

```solidity
function isNotEmptyString(string _str) internal pure returns (bool)
```

check if a string is empty

_Can be called by anyone_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _str | string | string to check |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean |

### addProject

```solidity
function addProject(string _name, string _desc, uint8 _department, enum EnergyDao.Sector _sector, string[] _photos, string _diagnostic, string _plan) external
```

add a project

_Can be called by anyone if enough token to lock_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _name | string | name of project |
| _desc | string | description of project |
| _department | uint8 | deparment of project |
| _sector | enum EnergyDao.Sector | sector enum of project |
| _photos | string[] | list of photos document of project |
| _diagnostic | string | diagnostic document of project |
| _plan | string | plan document of project |

### proposeQuotation

```solidity
function proposeQuotation(uint256 _id, string _description, string _docHash, uint256 _price, uint128 _nbCee) external
```

add a quotation to a project

_Can only be called by a validated craftsman_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint256 | id of project |
| _description | string | description of quotation |
| _docHash | string | document of quotation |
| _price | uint256 | price of quotation |
| _nbCee | uint128 | number of CEE estimated |

### removeQuotation

```solidity
function removeQuotation(uint256 _projectId) external
```

remove a quotation to a project

_Can only be called by a validated craftsman_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _projectId | uint256 | id of project |

### castVote

```solidity
function castVote(uint256 _projectId, address _account, address _craftsman) external
```

place a vote to a quotation on a project

_Can be called by anyone_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _projectId | uint256 | id of project |
| _account | address | address of person to delegate the vote |
| _craftsman | address | craftman chosen for the vote |

### getVoteProject

```solidity
function getVoteProject(uint256 _projectId, address _craftsmanAddr) public view returns (uint256)
```

get weight votes for a quotation

_Can be called by anyone_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _projectId | uint256 | id of project |
| _craftsmanAddr | address | craftman chosen for the vote |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint weight of the vote |

### hasVoted

```solidity
function hasVoted(uint256 _projectId, address _account) public view returns (bool)
```

check if an address voted for a project

_Can be called by anyone_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _projectId | uint256 | id of project |
| _account | address | craftman chosen for the vote |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool weight of the vote |

### getState

```solidity
function getState(uint256 _projectId) external view returns (enum EnergyDao.ProposalState)
```

get state of the project

_Can be called by anyone_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _projectId | uint256 | id of project |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | enum EnergyDao.ProposalState | ProposalState enum of state |

### _state

```solidity
function _state(uint256 _projectId, uint256 _block) internal view returns (enum EnergyDao.ProposalState)
```

get state of the project

_Called internally_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _projectId | uint256 | id of project |
| _block | uint256 | currrent block number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | enum EnergyDao.ProposalState | ProposalState enum of state |

### _computeProjectWinner

```solidity
function _computeProjectWinner(uint256 _projectId) internal view returns (address)
```

compute calculation of weight,

_Called internally_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _projectId | uint256 | id of project |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address address of wining craftsman |

### accept

```solidity
function accept(uint256 _projectId) external
```

beneficiary can accept the project

_Can only be called by the beneficiary_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _projectId | uint256 | id of project |

### reject

```solidity
function reject(uint256 _projectId) external
```

beneficiary can reject the project

_Can only be called by the beneficiary_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _projectId | uint256 | id of project |

### lock

```solidity
function lock() internal
```

lock an amount of token

_Called internally_

### unlock

```solidity
function unlock(address _addr) internal
```

unlock an amount of token

_Called internally_

### _calculateFees

```solidity
function _calculateFees(uint256 _amount) internal pure returns (uint256)
```

calculate the fees

_Called internally_

### getFunds

```solidity
function getFunds() public
```

Gets funds from `sale` into the contract

_Can only be called by the owner_

### sendFunds

```solidity
function sendFunds(address _receiver) public
```

Sends funds to a given `_receiver`

_Can only be called by the owner_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _receiver | address | Receiver address |

### transfer

```solidity
function transfer(address _receiver, uint256 amount) public
```

transfer to a given `_receiver`

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _receiver | address | Receiver address |
| amount | uint256 | amount to send |

### fallback

```solidity
fallback() external payable
```

### receive

```solidity
receive() external payable
```

## EnergyGovernor

### constructor

```solidity
constructor(contract IVotes _token, uint256 _votingDelay, uint256 _votingPeriod) public
```

### ids

```solidity
uint256[] ids
```

### votingDelay

```solidity
function votingDelay() public view returns (uint256)
```

### votingPeriod

```solidity
function votingPeriod() public view returns (uint256)
```

### quorum

```solidity
function quorum(uint256 blockNumber) public view returns (uint256)
```

### proposalThreshold

```solidity
function proposalThreshold() public view returns (uint256)
```

## Sale

_Sale is a contract for managing the eng token crowdsale,
allowing investors to purchase tokens with ether during a defined time frame.
An allowance is given by the contract holding the tokens to the Sale contract so it can sell a given amount of tokens_

### eedToken

```solidity
contract EEDToken eedToken
```

### closingTime

```solidity
uint256 closingTime
```

### rate

```solidity
uint256 rate
```

### tokenWallet

```solidity
address tokenWallet
```

### weiRaised

```solidity
uint256 weiRaised
```

### TokenPurchase

```solidity
event TokenPurchase(address purchaser, address beneficiary, uint256 value, uint256 amount)
```

Event for token purchase logging

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| purchaser | address | who paid for the tokens |
| beneficiary | address | who got the tokens |
| value | uint256 | weis paid for purchase |
| amount | uint256 | amount of tokens purchased |

### constructor

```solidity
constructor(address _tokenAddress, uint256 _rate, uint256 _closingTime, address _tokenWallet) public
```

_Constructor, takes token address, rate, closing time and token wallet._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenAddress | address | Token address |
| _rate | uint256 | Exchange rate |
| _closingTime | uint256 | Sale closing time |
| _tokenWallet | address | Address holding the tokens, which has approved allowance to the crowdsale |

### fallback

```solidity
fallback() external payable
```

_fallback function_

### receive

```solidity
receive() external payable
```

_receive function_

### buyTokens

```solidity
function buyTokens(address _beneficiary) public payable returns (uint256 _tokenAmount)
```

_Buy tokens as long as the sale is open_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenAmount | uint256 |  |

### remainingTokens

```solidity
function remainingTokens() public view returns (uint256)
```

_Checks the amount of tokens left in the allowance._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Amount of tokens left in the allowance |

### withdrawFunds

```solidity
function withdrawFunds() public
```

_Withdraw tokens, only when sale is closed_

### hasClosed

```solidity
function hasClosed() public view returns (bool)
```

_Checks whether the period in which the sale is open has already elapsed._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool sale period has elapsed |

### getRate

```solidity
function getRate() public view returns (uint256)
```

