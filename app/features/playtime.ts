import { isAuthorizedUser } from "../utils/isAuthorizedUser";

import { fetchAllGames } from "../net/fetchAllGames";

const getGamesByPlaytime = (ctx, bot) => {
  fetchAllGames().then((games) => console.log("allGames", games));
};

const playtime = (bot: any) => {
  bot.command("/playtime", (ctx: any) => getGamesByPlaytime(ctx, bot));
};

export default playtime;
