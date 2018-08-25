var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
var Tx = require('ethereumjs-tx');
var Util = require('ethereumjs-util');
var Web3 = require('web3');
var path = require('path');
var async = require('async');
var config = require('./config.js');

module.exports.rows = [];

var web3;
var address_smarty_contract;
var privateKey;
var publicKey;
var address_tx_from;

const smarty_contract_abi = [{"constant":true,"inputs":[{"name":"_user","type":"string"}],"name":"retrieveSmartContractDetailsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_user","type":"string"},{"name":"_smartContractIPFSHash","type":"string"},{"name":"_smartContractAuditReportIPFSHash","type":"string"}],"name":"submitSmartContractDetails","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_user","type":"string"},{"name":"_index","type":"uint256"}],"name":"retrieveSmartContractDetailsAtIndex","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"user","type":"string"},{"indexed":false,"name":"count","type":"uint256"}],"name":"userContractCount","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"user","type":"string"},{"indexed":false,"name":"index","type":"uint256"},{"indexed":false,"name":"smartContractIPFSHash","type":"string"},{"indexed":false,"name":"smartContractAuditReportIPFSHash","type":"string"},{"indexed":false,"name":"smartContractAuditReportTimestamp","type":"uint256"}],"name":"userContractDetails","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];

exports.setContractInterfaces = function() {
    address_smarty_contract = config.contractAddress;
    privateKey = Buffer.from(config.privateKey,'hex');
    publicKey = Util.bufferToHex(Util.privateToPublic(privateKey));
    address_tx_from = '0x' + Util.bufferToHex(Util.sha3(publicKey)).slice(26); 
    if (config.network == "local") {
	console.log("Warning! Using smarty contract deployed on local Ganache node. Make sure config.js is set up with the right values.")
	web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
    }
    else if (config.network == "rinkeby") {
	console.log("Warning! Using smarty contract deployed on Rinkeby. Make sure config.js is set up with the right values.");
	console.log("network = 'rinkeby'; contractAddress = See deployed_addresses.txt for address; privateKey = Your Ropsten private key which has Ether.");
	console.log("Warning! Using smarty contract deployed on Rinkeby. Make sure environment variable infura_APIKEY is set.");
	var infura_APIKEY = process.env.infura_APIKEY;
	web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/" + infura_APIKEY));
    }
    else {
	throw "Unknown network: config.network can only be local or rinkeby";
    }
}

function submitSmartContractDetails(username, contract_ipfs_hash, contract_audit_ipfs_hash) {
    console.log("Calling contract at address: " + address_smarty_contract);    
    var smarty_contract = new web3.eth.contract(smarty_contract_abi);
    var smarty_contract_instance = smarty_contract.at(address_smarty_contract);

    var nonce = web3.eth.getTransactionCount(address_tx_from);
    console.log("======== Nonce while sending transaction = ", nonce);

    try {
	var smarty_contract_call_data = smarty_contract_instance.submitSmartContractDetails.getData(username,contract_ipfs_hash,contract_audit_ipfs_hash);
	console.log("Call data = ", smarty_contract_call_data);
    } catch (e) {
	console.log(e);
    }

    console.log("Sender public key: ", publicKey);
    console.log("Sender address: " + '0x' + Util.bufferToHex(Util.sha3(publicKey)).slice(26));
            
    var nonceHex = web3.toHex(nonce);
    var gasPrice = web3.toHex('1e9');
    var gasLimit = web3.toHex('3800000');

    var rawTx = {
	chainId: 4,
	nonce: nonceHex,
	gasPrice: gasPrice,
	gasLimit: gasLimit,
	to: address_smarty_contract,
	from: address_tx_from,
	value: 0,
	data: smarty_contract_call_data
    };
    
    var tx = new Tx(rawTx);
    tx.sign(privateKey);
    
    var serializedTx = tx.serialize();    
    var hex_serialized = '0x' + serializedTx.toString('hex');
    console.log("TXN serialized --> ", hex_serialized);
    
    web3.eth.sendRawTransaction(hex_serialized, function(err, hash) {
	if (!err) {
	    console.log("Hash of the TXN = ", hash);
	    var receipt = null;
	    // This is not really efficient but nodejs cannot pause the running process
	    while(receipt === null) {
		receipt = web3.eth.getTransactionReceipt(hash);
	    }
	    console.log("Receipt is : " + JSON.stringify(receipt));

	    var SolidityCoder = require("web3/lib/solidity/coder.js");
	    // You might want to put the following in a loop to handle all logs in this receipt.
	    var log = receipt.logs[0];
	    var event = null;	    
	    for (var i = 0; i < smarty_contract_abi.length; i++) {
		var item = smarty_contract_abi[i];
		if (item.type != "event") continue;
		var signature = item.name + "(" + item.inputs.map(function(input) {return input.type;}).join(",") + ")";
		var hash = web3.sha3(signature);
		if (hash == log.topics[0]) {
		    event = item;
		    break;
		}
	    }
	    if (event != null) {
		var inputs = event.inputs.map(function(input) {return input.type;});
		var data = SolidityCoder.decodeParams(inputs, log.data.replace("0x", ""));
		console.log("Event: " + data);
		// Do something with the data. Depends on the log and what you're using the data for.
	    }
	} else {
	    console.log(err);
	}
    });    
    
}

exports.getUserRecordCountFromSmartContract = function(username, callback) {
    console.log("Calling contract at address: " + address_smarty_contract);    
    var smarty_contract = new web3.eth.contract(smarty_contract_abi);
    var smarty_contract_instance = smarty_contract.at(address_smarty_contract);

    var nonce = web3.eth.getTransactionCount(address_tx_from);
    console.log("======== Nonce while sending transaction = ", nonce);
    
    try {
	var smarty_contract_call_data = smarty_contract_instance.retrieveSmartContractDetailsCount.getData(username);
	console.log("Call data = ", smarty_contract_call_data);
    } catch (e) {
	console.log(e);
    }

    console.log("Sender public key: ", publicKey);
    console.log("Sender address: " + '0x' + Util.bufferToHex(Util.sha3(publicKey)).slice(26));
            
    var nonceHex = web3.toHex(nonce);
    var gasPrice = web3.toHex('1e9');
    var gasLimit = web3.toHex('3800000');
    
    var rawTx = {
	chainId: 4,
	nonce: nonceHex,
	gasPrice: gasPrice,
	gasLimit: gasLimit,
	to: address_smarty_contract,
	from: address_tx_from,
	value: 0,
	data: smarty_contract_call_data
    };

    var tx = new Tx(rawTx);
    tx.sign(privateKey);
    
    var serializedTx = tx.serialize();    
    var hex_serialized = '0x' + serializedTx.toString('hex');
    console.log("TXN serialized --> ", hex_serialized);
    
    web3.eth.sendRawTransaction(hex_serialized, function(err, hash) {
	if (!err) {
	    console.log("Hash of the TXN = ", hash);
	    var receipt = null;
	    // This is not really efficient but nodejs cannot pause the running process
	    while(receipt === null) {
		receipt = web3.eth.getTransactionReceipt(hash);
	    }
	    console.log("Receipt is : " + JSON.stringify(receipt));

	    var SolidityCoder = require("web3/lib/solidity/coder.js");	    
	    // You might want to put the following in a loop to handle all logs in this receipt.
	    var log = receipt.logs[0];
	    var event = null;
	    for (var i = 0; i < smarty_contract_abi.length; i++) {
		var item = smarty_contract_abi[i];
		if (item.type != "event") continue;
		var signature = item.name + "(" + item.inputs.map(function(input) {return input.type;}).join(",") + ")";
		var hash = web3.sha3(signature);
		if (hash == log.topics[0]) {
		    event = item;
		    break;
		}
	    }
	    if (event != null) {
		var inputs = event.inputs.map(function(input) {return input.type;});
		var data = SolidityCoder.decodeParams(inputs, log.data.replace("0x", ""));
		console.log("Event: " + data);
		// Do something with the data. Depends on the log and what you're using the data for.
		var event_fields = String(data).split(",");
		console.log("Record Count: " + event_fields[1]);
		callback(username, event_fields[1]);
	    }
	    else {
		console.log("Event is null!");
	    }
	} else {
	    console.log(err);
	}
    });
}

exports.getAllUserRecordsFromSmartContract = function(username, total_count) {
    var nonce = web3.eth.getTransactionCount(address_tx_from);
    console.log("======== Nonce got = ", nonce);

    for (var i=0; i<total_count; i++) {
	getUserRecordFromSmartContract(username, nonce, i);
    }
}

function getUserRecordFromSmartContract(username, got_nonce, index) {
    console.log("Calling contract at address: " + address_smarty_contract);
    var smarty_contract = new web3.eth.contract(smarty_contract_abi);
    var smarty_contract_instance = smarty_contract.at(address_smarty_contract);

    console.log("Getting record " + index + " for user " + username);
    
    try {
	var smarty_contract_call_data = smarty_contract_instance.retrieveSmartContractDetailsAtIndex.getData(username, index);
	console.log("Call data = ", smarty_contract_call_data);
    } catch (e) {
	console.log(e);
    }
    
    console.log("Sender public key: ", publicKey);
    console.log("Sender address: " + '0x' + Util.bufferToHex(Util.sha3(publicKey)).slice(26));
    
    var nonce = got_nonce+index
    console.log("======== Nonce while sending transaction = ", nonce);	
    
    var nonceHex = web3.toHex(nonce);
    var gasPrice = web3.toHex('1e9');
    var gasLimit = web3.toHex('3800000');
        
    var rawTx = {
	chainId: 4,
	nonce: nonceHex,
	gasPrice: gasPrice,
	gasLimit: gasLimit,
	to: address_smarty_contract,
	from: address_tx_from,
	value: 0,
	data: smarty_contract_call_data
    };
    
    var tx = new Tx(rawTx);
    tx.sign(privateKey);
    
    var serializedTx = tx.serialize();
    var hex_serialized = '0x' + serializedTx.toString('hex');
    console.log("TXN serialized --> ", hex_serialized);
    
    web3.eth.sendRawTransaction(hex_serialized, function(err, hash) {
	if (!err) {
	    console.log("Hash of the TXN = ", hash);	    
	    var receipt = null;
	    // This is not really efficient but nodejs cannot pause the running process
	    while(receipt === null) {
		receipt = web3.eth.getTransactionReceipt(hash);
	    }
	    console.log("Receipt is : " + JSON.stringify(receipt));
	    
	    var SolidityCoder = require("web3/lib/solidity/coder.js");
	    // You might want to put the following in a loop to handle all logs in this receipt.
	    var log = receipt.logs[0];
	    var event = null;
	    for (var i = 0; i < smarty_contract_abi.length; i++) {
		var item = smarty_contract_abi[i];
		if (item.type != "event") continue;
		var signature = item.name + "(" + item.inputs.map(function(input) {return input.type;}).join(",") + ")";
		var hash = web3.sha3(signature);
		if (hash == log.topics[0]) {
		    event = item;
		    break;
		}
	    }
	    if (event != null) {
		var inputs = event.inputs.map(function(input) {return input.type;});
		var data = SolidityCoder.decodeParams(inputs, log.data.replace("0x", ""));
		
		console.log("Event: " + data);
		// Do something with the data. Depends on the log and what you're using the data for.
		var row = String(data).split(",");
		module.exports.rows.push({recordID: row[1], contract: row[2], audit: row[3], timestamp: row[4]});
	    }
	    else {
		console.log("Event is null!");
	    }
	} else {
	    console.log(err);
	}
    });
}

exports.process_uploaded_file = function(username, file_name, file_path) {
    console.log("Processing file: " + file_path + "\nfor user: " + username);
    var contract_str;
    var contract_ipfs_hash;
    fs.readFile(file_path, function (err, contract) {
	if (err) throw err;
	contract_str = contract.toString();
	ipfs.add(contract_str, (err, result) => {
	    if (!err) {
		contract_ipfs_hash = result;
		console.log(contract_ipfs_hash);

		console.log("NOT Calling Mythril on " + file_name);
		/*		
		const { execSync } = require('child_process');
		var audit_Mythril = execSync(`sudo docker run -v $(pwd):/tmp mythril/myth -x /tmp/Uploaded-Smart-Contracts/` + file_name);
		*/
		
		var audit_Mythril = "Mythril audit should go here";
	 	ipfs.add(audit_Mythril, (err, result) => {
		    if (!err) {
			contract_audit_Mythril_ipfs_hash = result;
			console.log(contract_audit_Mythril_ipfs_hash);
			submitSmartContractDetails(username, contract_ipfs_hash, contract_audit_Mythril_ipfs_hash);
		    }
		});
	    }
	});
    });
}

