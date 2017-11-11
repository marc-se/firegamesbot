const IS_DEV = process.env.NODE_ENV !== 'production';
if (IS_DEV) {
	require('dotenv').config();
}

require('./server');
require('./app');
