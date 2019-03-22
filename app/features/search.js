import fb from "../initFirebase";

const database = fb.database();
const rootRef = fb.database().ref();
const systemsRef = rootRef.child("games");
const OWNER_ID = process.env.OWNER_ID;

const NodeCache = require("node-cache");
const botCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

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
	.then(() =>
		Promise.all(gatherGames(systemRefs)).then(res => {
			// cache all games for 5 minutes
			botCache.set("allGames", gamesContainer);
			return gamesContainer;
		})
	);

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
		try {
			return game.toLowerCase().includes(message);
		} catch (e) {
			console.log("Error occured 🔥", e);
		}
	});
}

function botReply(result, ctx) {
	if (result.length > 0) {
		ctx.replyWithMarkdown(
			`FOUND *${result.length}* ${result.length > 1 ? "GAMES" : "GAME"} 💁🏻\n-----\n${result
				.toString()
				.split(",")
				.join("\n")}`
		);
	} else {
		ctx.reply("NO GAMES FOUND! 😱");
	}
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

				const cachedGames = botCache.get("allGames");
				let searchResults = [];
				console.log("cached games ⭐️", cachedGames);

				if (cachedGames == undefined) {
					console.log("fetch all games 🔥");

					fetchAllGames.then(allGames => {
						searchResults = getSearchResults(allGames, message);
						botReply(searchResults, ctx);
					});
				} else {
					console.log("use cache ✅");
					searchResults = getSearchResults(cachedGames, message);
					botReply(searchResults, ctx);
				}
			}
		}
	});
};
export default search;
