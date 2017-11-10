const Telegraf = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(ctx => {
	console.log('started:', ctx.from.id);
	return ctx.reply('Welcome!');
});

bot.hears('Hi', ctx => ctx.reply('Hello!'));

bot.startPolling();
