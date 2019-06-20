export function isAuthorizedUser(id) {
	const USER_IDS = process.env.USER_IDS;
	const users = USER_IDS.split(",");
	return users.includes(id);
}
