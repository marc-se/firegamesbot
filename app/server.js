const express = require('express');
const http = require('http');

const app = express();
const port = process.env.PORT || 3030;

app.get('/', function(req, res) {
	res.send('Server running ✅');
});

function startKeepAlive() {
	setInterval(
		function() {
			let options = {
				host: `http://${process.env.HEROKU_APP_NAME}.herokuapp.com`,
				port: 80,
				path: '/',
			};
			http
				.get(options, function(res) {
					res.on('data', function(chunk) {
						try {
							console.log('HEROKU RESPONSE: ' + chunk);
						} catch (err) {
							console.log(err.message);
						}
					});
				})
				.on('error', function(err) {
					console.log('Error: ' + err.message);
				});
		},
		20 * 60 * 1000
	); // ping every 20 minutes
}

startKeepAlive();

const server = app.listen(port, '0.0.0.0', function() {
	console.info('Web server running at http://0.0.0.0:%s/ ✅', port);
});
