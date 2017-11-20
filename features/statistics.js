import * as firebase from 'firebase'; // eslint-disable-line0
import fb from '../initFirebase';

const database = fb.database();
const rootRef = database.ref();
const systemsRef = rootRef.child('systems');
const OWNER_ID = process.env.OWNER_ID;

const fetchStatistics = () => {
	const systems = [];
	systemsRef
		.once('child_added', snap => {
			const data = snap.val();

			Object.keys(data).forEach(system => {
				systems.push(data[system]);
			});
		})
		.then(() => systems);
};

const statistics = bot => {
	bot.command('/statistics', ctx => {
		console.log('👻', ctx.message.from.id);
		if (OWNER_ID === ctx.message.from.id.toString()) {
			fetchStatistics.then(systems => {
				console.log(systems);
			});
			ctx.reply('Firegames Statistics');
		}
	});
	bot.startPolling();
};

export default statistics;
