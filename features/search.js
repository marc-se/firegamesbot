import * as firebase from 'firebase';
import fb from '../initFirebase';

const database = fb.database();
const gamesRef = database.ref(`games/playstation4`);
let allGames = [];

let fetchedData = gamesRef.once('value', snap => {
	let data = snap.val();
	let games = [];

	Object.keys(data).forEach(game => {
		data[game].key = game;
		games.push(data[game].title);
	});

	allGames = [...games];
});

const search = bot => {
	bot.start(ctx => {
		console.log('started:', ctx.from.id);
		return ctx.reply('Welcome!');
	});

	bot.hears(/.*/gim, ctx => {
		if ([ctx.message.text.length] < 3) {
			console.log([ctx.message.text]);
			ctx.reply('Please search for at least 3 characters');
		} else {
			const message = [ctx.message.text].toString().toLowerCase();

			fetchedData.then(() => {
				let searchResults = getSearchResults(allGames, message);

				if (searchResults.length > 0) {
					ctx.reply(
						`FOUND ${searchResults.length} ${searchResults.length > 1
							? 'GAMES'
							: 'GAME'} 💁🏻\n-----\n${searchResults
							.toString()
							.split(',')
							.join('\n')}`
					);
				} else {
					ctx.reply('NO GAMES FOUND! 😱');
				}
			});
		}
	});

	bot.startPolling();
};

function getSearchResults(games, message) {
	return games.filter(game => game.toLowerCase().includes(message));
}

export default search;
