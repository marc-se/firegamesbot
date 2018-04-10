import * as firebase from 'firebase'; // eslint-disable-line
import fb from '../initFirebase';

const { Extra, Markup } = require('telegraf');

const database = fb.database();
const rootRef = fb.database().ref();
const systemsRef = rootRef.child('systems');
const OWNER_ID = process.env.OWNER_ID;

const fetchSystems = () => {
	const systems = [];

	return systemsRef
		.once('value', snap => {
			const data = snap.val();

			Object.keys(data).forEach(system => {
				systems.push(data[system]);
			});
		})
		.then(() => systems);
};

function cleanupString(systemString) {
	return systemString.slice(0, -2).trim();
}

function replyWithSystemData(ctx, systems, bot) {
	const games = [];

	const cleanSystemString = cleanupString(ctx.match[0]);
	const requestedSystem = systems.find(system => system.title === cleanSystemString);

	if (requestedSystem) {
		const systemRef = database.ref(`games/${requestedSystem.url}`);

		const fetchGames = systemRef
			.once('value', snap => {
				const data = snap.val();
				Object.keys(data).forEach(game => {
					data[game].key = game;
					games.push(data[game].title);
				});
			})
			.then(() => {
				ctx.replyWithMarkdown(
					`Here are your *${cleanSystemString}* Games 😘`,
					Extra.markup(Markup.removeKeyboard())
				);
				ctx.reply(
					`${games
						.toString()
						.split(',')
						.join('\n')}`,
					Extra.markup(Markup.removeKeyboard())
				);
			});
	}
}

const systems = bot => {
	bot.command('/gamesbysystem', ctx => {
		if (OWNER_ID === ctx.message.from.id.toString()) {
			fetchSystems().then(systems => {
				const systemTitles = systems.map(system => {
					return `${system.title} 🕹`;
				});

				const systemUrls = systems.map(system => {
					return `${system.url}`;
				});

				bot.hears(/.*🕹/gim, ctx => {
					replyWithSystemData(ctx, systems, bot);
				});

				return ctx.reply(
					'Please select which games you would like to see 🕹',
					Extra.markup(Markup.keyboard(systemTitles))
				);
			});
		}
	});
};

export default systems;
