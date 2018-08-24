var formidable = require('formidable');
//import child_process module
const child_process = require("child_process");
var smarty = require("../smarty.js");

var appRouter = function(app) {

    var username;
    app.get('/', function (req, res){
	res.sendFile(__dirname + '/index.html');
    });

    app.post('/getUserRecords/', function (req, res){
	username = req.body.username;
	console.log("Username: " + username);
	smarty.getUserRecordCountFromSmartContract(username, smarty.getAllUserRecordsFromSmartContract);
	res.writeHead(200, {'Content-Type': 'application/html'});
	res.end(JSON.stringify(smarty.rows));
    });

    app.post('/updateUserRecords/', function (req, res){
	username = req.body.username;
	console.log("Username: " + username);
	res.writeHead(200, {'Content-Type': 'application/html'});
	res.end(JSON.stringify(smarty.rows));
	smarty.rows = [];
    });

    app.post('/user', function (req, res){
	username = req.body.username;
	console.log("Username: " + username);
	res.sendFile(__dirname + '/file-upload.html');
    });
    
    app.post('/filetoupload', function (req, res){
	var form = new formidable.IncomingForm();
	form.parse(req);
	form.on('fileBegin', function (name, file){
	    file.path = __dirname + '/../../Uploaded-Smart-Contracts/' + file.name;
	});
	form.on('file', function (name, file){
	    console.log('Uploaded ' + file.name);
	    smarty.process_uploaded_file(username, file.name,file.path);
	});
	res.sendFile(__dirname + '/index.html');
    });
}

module.exports = appRouter;
