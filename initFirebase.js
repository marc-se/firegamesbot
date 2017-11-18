import * as firebase from 'firebase'; // eslint-disable-line
import config from './apiKey';

const fb = firebase.initializeApp(config);

export default fb;
