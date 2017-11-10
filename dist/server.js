'use strict';

var express = require('express');

var app = express();

var server = app.listen(process.env.PORT, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Web server started at http://%s:%s', host, port);
});