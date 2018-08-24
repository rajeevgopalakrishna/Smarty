import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Smarty.sol";

contract TestSmarty {

  function testGetUnknownUserRecordCount() {
    Smarty smarty = new Smarty();
    uint count = smarty.retrieveSmartContractDetailsCount("user1");
    Assert.equal(count, 0, "Failed! User1 should have zero records");
  }
  
  function testAddNewUserFirstRecord() {
    Smarty smarty = new Smarty();
    smarty.submitSmartContractDetails("user1","user1_smartContractIPFSHash_1","user1_smartContractAuditReportIPFSHash_1");
    uint count = smarty.retrieveSmartContractDetailsCount("user1");
    Assert.equal(count, 1, "Failed! User1 should have one record");
  }

  function testAddNewUserMultipleRecords() {
    Smarty smarty = new Smarty();
    smarty.submitSmartContractDetails("user1","user1_smartContractIPFSHash_1","user1_smartContractAuditReportIPFSHash_1");
    smarty.submitSmartContractDetails("user1","user1_smartContractIPFSHash_2","user1_smartContractAuditReportIPFSHash_2");
    uint count = smarty.retrieveSmartContractDetailsCount("user1");
    Assert.equal(count, 2, "Failed! User1 should have two records");
  }

  function testAddMultipleUsersFirstRecords() {
    Smarty smarty = new Smarty();
    smarty.submitSmartContractDetails("user1","user1_smartContractIPFSHash_1","user1_smartContractAuditReportIPFSHash_1");
    smarty.submitSmartContractDetails("user2","user2_smartContractIPFSHash_1","user2_smartContractAuditReportIPFSHash_1");
    uint count1 = smarty.retrieveSmartContractDetailsCount("user1");
    uint count2 = smarty.retrieveSmartContractDetailsCount("user2");
    Assert.equal(count1, 1, "Failed! User1 should have one record");
    Assert.equal(count2, 1, "Failed! User2 should have one record");
  }

  function testAddMultipleUsersMultipleRecords() {
    Smarty smarty = new Smarty();
    smarty.submitSmartContractDetails("user1","user1_smartContractIPFSHash_1","user1_smartContractAuditReportIPFSHash_1");
    smarty.submitSmartContractDetails("user1","user1_smartContractIPFSHash_2","user1_smartContractAuditReportIPFSHash_2");
    smarty.submitSmartContractDetails("user2","user2_smartContractIPFSHash_1","user2_smartContractAuditReportIPFSHash_1");
    smarty.submitSmartContractDetails("user2","user2_smartContractIPFSHash_2","user2_smartContractAuditReportIPFSHash_2");
    uint count1 = smarty.retrieveSmartContractDetailsCount("user1");
    uint count2 = smarty.retrieveSmartContractDetailsCount("user2");
    Assert.equal(count1, 2, "Failed! User1 should have two records");
    Assert.equal(count2, 2, "Failed! User2 should have two records");
  }
}
