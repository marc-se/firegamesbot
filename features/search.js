import * as firebase from 'firebase';
import fb from '../initFirebase';

const database = fb.database();
const gamesRef = database.ref(`games/playstation4`);

const rootRef = fb.database().ref();
const systemsRef = rootRef.child('games');

let systemKeys = [];
let systemRefs = [];
let tmpGames = [];
let gamesContainer = [];

let fetchAllGames = systemsRef
	.once('value', snap => {
		let games = [];
		let system = {};
		snap.forEach(child => {
			let key = child.key;
			systemKeys.push(key);
		});
	})
	.then(() => {
		systemKeys.forEach(system => {
			let systemRef = database.ref(`games/${system}`);
			systemRefs.push(systemRef);
		});
	})
	.then(() =>
		Promise.all(gatherGames(systemRefs)).then(res => {
			return gamesContainer;
		})
	);

let gatherGames = systemRefs => {
	let promises = systemRefs.map(systemRef => {
		return systemRef
			.once('value', snap => {
				// reset temp games array
				tmpGames = [];

				let data = snap.val();

				Object.keys(data).forEach(game => {
					data[game].key = game;
					tmpGames.push(data[game].title);
				});
			})
			.then(() => gamesContainer.push(...tmpGames));
	});

	return promises;
};

function getSearchResults(games, message) {
	return games.filter(game => game.toLowerCase().includes(message));
}

const search = bot => {
	bot.start(ctx => {
		//console.log('started:', ctx.from.id);
		return ctx.reply('Welcome!');
	});

	bot.hears(/.*/gim, ctx => {
		if ([ctx.message.text.length] < 3) {
			//console.log([ctx.message.text]);
			ctx.reply('Please search for at least 3 characters');
		} else {
			const message = [ctx.message.text].toString().toLowerCase();

			fetchAllGames.then(allGames => {
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

export default search;
