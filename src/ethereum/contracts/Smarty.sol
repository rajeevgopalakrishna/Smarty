pragma solidity ^0.4.24;

import "./Library/OpenZeppelin/Ownable.sol";
import "./Library/OpenZeppelin/Pausable.sol";

/** @title Smarty: smart contract security audit timestamping. */
contract Smarty is Ownable, Pausable  {

  address owner;
  struct s_contractInfo {
    string smartContractIPFSHash;
    string smartContractAuditReportIPFSHash;
    uint256 smartContractAuditReportTimestamp;
  }
  struct s_userContracts {
    s_contractInfo[] userContracts;
  }
  mapping (string => s_userContracts) userData;

  event userContractCount (
			   string user,
			         uint256 count
			   );

  event userContractDetails (
			     string user,
			     uint256 index,
			     string smartContractIPFSHash,
			     string smartContractAuditReportIPFSHash,
			           uint256 smartContractAuditReportTimestamp
			     );

  constructor() public {
    owner = msg.sender;
  }

  /** @dev Registers the submitted IPFS hashes of smart contract and audit report along with the timestamp for the specified user
   * @param _user Username who submitted the contract.
   * @param _smartContractIPFSHash IPFS hash of the smart contract.
   * @param _smartContractAuditReportIPFSHash IPFS hash of the smart contract's audit report.
   */
  function submitSmartContractDetails (string _user, string _smartContractIPFSHash, string _smartContractAuditReportIPFSHash) external onlyOwner whenNotPaused {
    emit userContractDetails(_user,userData[_user].userContracts.length,_smartContractIPFSHash,_smartContractAuditReportIPFSHash,now);
    userData[_user].userContracts.push(s_contractInfo(_smartContractIPFSHash,_smartContractAuditReportIPFSHash,now));
  }

  /** @dev Retrieve the count of submitted IPFS hashes of smart contract details for the specified user
   * @param _user Username for which the count of smart contract details need to be retrieved
   * @return uint256 count of submitted smart contract details for the specified user
   */
  function retrieveSmartContractDetailsCount (string _user) view external whenNotPaused returns (uint256) {
    emit userContractCount(_user,userData[_user].userContracts.length);
    return(userData[_user].userContracts.length);
  }
  
  /** @dev Retrieve smart contract details for the specified user at the specified index
   * @param _user Username for which the smart contract details at the specified index need to be retrieved
   * @param _user Index at which the smart contract details for the specified user need to be retrieved
   * @return Submitted IPFS hashes and timestamp of smart contract details for the specified user at the specified index
   */
  function retrieveSmartContractDetailsAtIndex (string _user, uint256 _index) view external whenNotPaused returns (string, string, uint256) {
    emit userContractDetails(_user,_index,userData[_user].userContracts[_index].smartContractIPFSHash,userData[_user].userContracts[_index].smartContractAuditReportIPFSHash,userData[_user].userContracts[_index].smartContractAuditReportTimestamp);
    return(userData[_user].userContracts[_index].smartContractIPFSHash,userData[_user].userContracts[_index].smartContractAuditReportIPFSHash,userData[_user].userContracts[_index].smartContractAuditReportTimestamp);
  }

}
