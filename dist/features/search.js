'use strict';

var Telegraf = require('telegraf');

console.log('🙉', process.env.BOT_TOKEN);

// const bot = new Telegraf(process.env.BOT_TOKEN);
var bot = new Telegraf('430184454:AAHoih_U_WqdbBntWn8d4v6KzOQTxRRVX-0');
bot.start(function (ctx) {
	console.log('started:', ctx.from.id);
	return ctx.reply('Welcome!');
});

bot.hears('hi', function (ctx) {
	return ctx.reply('Hey there!');
});
bot.hears('Laura', function (ctx) {
	return ctx.reply('Laura is pretty');
});
bot.hears('Hi', function (ctx) {
	return ctx.reply('Hello!');
});

bot.startPolling();