/**
 * Created by fatality-ap on 12.05.16.
 */


var express = require('express');
var app = express();

app.use(express.static(__dirname + '/site'));

var server = app.listen(80);

var address = server.address();

if(address != null) {
    console.log("server is running,", "host: " + address.address, "port: " + address.port);
}
else {
    console.log("server is running");
}



