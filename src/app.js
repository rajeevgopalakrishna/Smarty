var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var smarty = require("./smarty.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var routes = require("./routes/routes.js")(app);

var server = app.listen(56008, function () {
    smarty.setContractInterfaces();
    console.log("Listening on port %s...", server.address().port);
});
