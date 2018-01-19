const express = require('express');
const http = require('http');

const app = express();
const port = process.env.PORT || 3030;

app.get('/', function(req, res) {
	res.send('Server running ✅');
});

setInterval(
	function() {
		http.get(`http://${process.env.HEROKU_APP_NAME}.herokuapp.com`);
	},
	900000
); // wake up call every 15 minutes

const server = app.listen(port, '0.0.0.0', function() {
	console.info('Web server running at http://0.0.0.0:%s/ ✅', port);
});
