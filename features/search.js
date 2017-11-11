const search = bot => {
	bot.start(ctx => {
		console.log('started:', ctx.from.id);
		return ctx.reply('Welcome!');
	});

	bot.hears('Hi', ctx => ctx.reply('Hello!'));

	bot.startPolling();
};

export default search;
