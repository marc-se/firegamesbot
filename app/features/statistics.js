import fb from "../initFirebase";

const database = fb.database();
const rootRef = database.ref();
const systemsRef = rootRef.child("systems");
import { isAuthorizedUser } from "../utils/isAuthorizedUser";

const fetchStatistics = () => {
	const systems = [];
	return systemsRef
		.once("value", snap => {
			const data = snap.val();

			Object.keys(data).forEach(system => {
				systems.push(data[system]);
			});
		})
		.then(() => systems);
};

const statistics = bot => {
	bot.command("/statistics", ctx => {
		const userId = ctx.message.from.id.toString();
		if (isAuthorizedUser(userId)) {
			fetchStatistics().then(systems => {
				const statistics = systems.map(system => {
					return `${system.title}: ${system.games}`;
				});
				ctx.reply(
					`Firegames Statistics 📊\n-----\n${statistics
						.toString()
						.split(",")
						.join("\n")}`
				);
			});
		} else {
			ctx.reply("You're not an authorized user! 🙅🏼");
		}
	});
};

export default statistics;
