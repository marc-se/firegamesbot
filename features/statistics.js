import * as firebase from 'firebase'; // eslint-disable-line0
import fb from '../initFirebase';

const database = fb.database();
const rootRef = database.ref();
const systemsRef = rootRef.child('systems');
const OWNER_ID = process.env.OWNER_ID;

const fetchStatistics = () => {
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

const statistics = bot => {
	bot.command('/statistics', ctx => {
		if (OWNER_ID === ctx.message.from.id.toString()) {
			fetchStatistics().then(systems => {
				const statistics = systems.map(system => {
					return `${system.title}: ${system.games}`;
				});
				ctx.reply(
					`Firegames Statistics 📊\n-----\n${statistics
						.toString()
						.split(',')
						.join('\n')}`
				);
			});
		}
	});
	bot.startPolling();
};

export default statistics;
