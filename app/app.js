import 'babel-polyfill';
import Search from './features/search';
import Statistics from './features/statistics';

const Telegraf = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// commands
Statistics(bot);

// hears
Search(bot);

bot.startPolling();
