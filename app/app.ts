import Search from "./features/search";
import Statistics from "./features/statistics";
import Systems from "./features/systems";
import Wishlist from "./features/wishlist";
import Playtime from "./features/playtime";

const Telegraf = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// commands
Statistics(bot);
Systems(bot);
Wishlist(bot);
Playtime(bot);

// hears
Search(bot);

bot.startPolling();
