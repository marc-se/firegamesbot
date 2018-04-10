import 'babel-polyfill';
import Search from './features/search';
import Statistics from './features/statistics';
import Systems from './features/systems';

const Telegraf = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// commands
Statistics(bot);
Systems(bot);

// hears
Search(bot);

bot.startPolling();
