import Search from './features/search';
import 'babel-polyfill';

const Telegraf = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

Search(bot);
