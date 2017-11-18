import 'babel-polyfill';
import Search from './features/search';

const Telegraf = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

Search(bot);
