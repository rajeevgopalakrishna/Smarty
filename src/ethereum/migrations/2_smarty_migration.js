var Smarty = artifacts.require("Smarty");

module.exports = function(deployer) {
    // deployment steps
    deployer.deploy(Smarty);
};

