**Smarty: A Smart Contract Proof-of-Audit Service**

Smarty is a smart contract proof-of-audit service which allows users to upload smart contracts, have them analysed for security vulnerabilities using state-of-the-art security tools and have the security audit reports recorded on the Ethereum blockchain for transparency and auditability.

There are many security tools being developed for analysing smart contracts written in Solidity on Ethereum such as Remix, Solium, Oyente and Mythril. Smart contract users and developers do not necessarily have access to these tools or the know how to effectively install, configure and run them. Interpreting the output of these tools is yet another challenge because of the level of technical knowledge required or identifying the false positives (incorrect alerts) which may be included in the output. Some of these tools such as Oyente and Mythril which are based on symbolic execution incur significant computation requiring high performance infrastructure to which the users may not always have access. This motivates a smart-contract-auditing-as-a-service which runs the latest versions of multiple security tools, interprets their outputs and presents an accessible consolidated report to the user.

These reports (along with the smart contracts) may be registered on the blockchain with a timestamp for the user/developer to prove that they have used this service and are aware of the security vulnerabilities (or lack thereof) as indicated in the reports. Such proofs-of-audit vindicate the user or developer against any potential future claims of having interacted with or deployed smart contracts with known vulnerabilities.

**Technical Stack**

* Back-end: NodeJS, IPFS, Security tools (e.g. Mythril/Oyente)
* Front-end: Very primitive HTML, JQuery

**Setup**

* Clone from github
* Run `ganache-cli`
  * Set `privateKey` in `src/config.js` to private key of 1st account (without the '0x' characters)
  * Set `network` in `src/config.js` to "local"
* Run `truffle` compile/migrate/test in `src/ethereum` directory
  * Set `contractAddress` in `src/config.js` to the Smarty contract address shown under `2_smarty_migration.js` with `truffle migrate`
* Run `npm install` in `src` directory. This will install all the Node package dependencies from `package.json`.
* Run `nodejs src/app.js` in `src` directory. This will start the Smarty server on port 56008.
* From a browser, connect to *localhost:56008*. This will bring up the front-end interface.




