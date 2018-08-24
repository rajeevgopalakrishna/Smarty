**Design Patterns Used**

* Implement a circuit breaker / emergency stop

Smarty.sol uses OpenZeppelin's Pausable.sol to enforce a circuit breaker and pause the smart contract under emergency conditions. This can be triggered only by the owner of the Smarty contract.

* Authorisation for smart contract functions

Smarty.sol uses OpenZeppelin's Ownable.sol to register the owner address (`msg.sender()` in constructor) and use it to enforce authorisation on the smart contract functions. The `submitSmartContractDetails` function is only callable by the owner because we want only the authorised Smarty service to register contract details on the blockchain. The other two functions `retrieveSmartContractDetailsCount` and `retrieveSmartContractDetailsAtIndex` can be called by anyone because these are used to verify the smart contract details on the blockchain.
