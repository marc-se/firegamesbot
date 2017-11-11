import * as firebase from 'firebase';
import config from './apiKey';

const fb = firebase.initializeApp(config);

export default fb;
