import fb from "../initFirebase";

const database = fb.database();
const rootRef = fb.database().ref();
const systemsRef = rootRef.child("games");
const OWNER_ID = process.env.OWNER_ID;

// TODO: put in scope, if possible
const systemKeys = [];
const systemRefs = [];
const gamesContainer = [];

const fetchAllGames = systemsRef
	.once("value", snap => {
		snap.forEach(child => {
			const { key } = child;
			systemKeys.push(key);
		});
	})
	.then(() => {
		systemKeys.forEach(system => {
			const systemRef = database.ref(`games/${system}`);
			systemRefs.push(systemRef);
		});
	})
	.then(() => Promise.all(gatherGames(systemRefs)).then(res => gamesContainer));

let gatherGames = () => {
	const promises = systemRefs.map(systemRef =>
		systemRef.once("value", snap => {
			const data = snap.val();

			Object.keys(data).forEach(game => {
				data[game].key = game;
				gamesContainer.push(data[game].title);
			});
		})
	);

	return promises;
};

function getSearchResults(games, message) {
	return games.filter(game => {
		console.log(game);
		try {
			return game.toLowerCase().includes(message);
		} catch (e) {
			console.log("Error occured 🔥", e);
		}
	});
}

const search = bot => {
	bot.start(ctx => ctx.reply("Welcome!"));

	bot.hears(/^(?!.*🕹)/gim, ctx => {
		if (ctx.message.from.id.toString() === OWNER_ID) {
			if ([ctx.message.text.length] < 3) {
				ctx.reply("Please search for at least 3 characters");
			} else {
				const { text } = ctx.message;
				const message = text.toLowerCase();

				fetchAllGames.then(allGames => {
					const searchResults = getSearchResults(allGames, message);

					if (searchResults.length > 0) {
						ctx.replyWithMarkdown(
							`FOUND *${searchResults.length}* ${searchResults.length > 1 ? "GAMES" : "GAME"} 💁🏻\n-----\n${searchResults
								.toString()
								.split(",")
								.join("\n")}`
						);
					} else {
						ctx.reply("NO GAMES FOUND! 😱");
					}
				});
			}
		}
	});
};
export default search;
