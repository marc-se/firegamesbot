const Markup = require("telegraf/markup");

import { isAuthorizedUser } from "../utils/isAuthorizedUser";

import { fetchAllGames } from "../net/fetchAllGames";
import type { GameReference } from "../types";

const getReplyMessage = (games: GameReference[]) => {
  // TODO
};

const handlePlaytimeOption = (
  ctx: any,
  lowerInterval: number = 0,
  upperInterval: number = 0
) => {
  console.log("handlePlaytimeOption", lowerInterval, upperInterval);

  fetchAllGames()
    .then((res) => {
      if (res) {
        // @ts-ignore
        const nestedGames: GameReference[][] = res;
        const games = ([] as GameReference[]).concat(...nestedGames);
        let filteredGames: GameReference[] = [];

        if (lowerInterval && upperInterval) {
          filteredGames = games.filter((game) => {
            game &&
              game.playtime &&
              (game.playtime < lowerInterval || game.playtime > upperInterval);
          });
          console.log("games with two intervals", filteredGames);

          ctx.replyWithMarkdown(
            `Games between ${lowerInterval} and ${upperInterval} hours playtime`
          );
          return;
        }

        filteredGames = games.filter(
          (game) =>
            game &&
            game.playtime &&
            (game.playtime < lowerInterval || game.playtime > upperInterval)
        );

        console.log("games with one interval", filteredGames);

        // TODO: find suitable message
        ctx.replyWithMarkdown(`Games with ${lowerInterval} hours playtime`);
        return;
      }
    })
    .catch((error) => console.error("Playtime Error", error));
};

const getGamesByPlaytime = (ctx: any, bot: any) => {
  const userId = ctx.message.from.id.toString();
  if (isAuthorizedUser(userId)) {
    ctx.replyWithMarkdown(
      `*Choose an option*`,
      Markup.inlineKeyboard([
        [Markup.callbackButton("playtime < 8h", "playtime_lt_8")],
        [Markup.callbackButton("playtime > 8h < 20h", "playtime_gt_8_lt_20")],
        [Markup.callbackButton("playtime > 20h", "playtime_gt_20h")],
      ]).extra()
    );
  }
};

const playtime = (bot: any) => {
  bot.command("/playtime", (ctx: any) => getGamesByPlaytime(ctx, bot));
  bot.action("playtime_lt_8", (ctx: any) => {
    handlePlaytimeOption(ctx, 8);
  });
  bot.action("playtime_gt_8_lt_20", (ctx: any) => {
    handlePlaytimeOption(ctx, 8, 20);
  });
  bot.action("playtime_gt_20h", (ctx: any) => {
    handlePlaytimeOption(ctx, 20);
  });
};

export default playtime;
