const { Markup } = require("telegraf");

import { isAuthorizedUser } from "../utils/isAuthorizedUser";

import { fetchAllGames } from "../net/fetchAllGames";
import type { GameReference } from "../types";

const getReplyMessage = (
  games: GameReference[],
  lowerInterval: number,
  upperInterval: number
) => {
  // TODO
  let introMessage = "";
  if (lowerInterval && upperInterval) {
    introMessage = `Games between ${lowerInterval} and ${upperInterval} hours playtime:\n`;
  } else if (lowerInterval <= 8) {
    introMessage = `Games with less than ${lowerInterval} hours playtime:\n`;
  } else {
    introMessage = `Games with more than ${lowerInterval} hours playtime:\n`;
  }

  return `${introMessage}`;
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
          console.log(lowerInterval, upperInterval, games[1]);
          filteredGames = games.filter(
            (game) =>
              game &&
              game.playtime &&
              !game.finished &&
              !game.playing &&
              game.playtime > lowerInterval &&
              game.playtime < upperInterval
          );
        } else if (lowerInterval <= 8) {
          filteredGames = games.filter(
            (game) =>
              game &&
              game.playtime &&
              !game.finished &&
              !game.playing &&
              game.playtime < lowerInterval
          );
        } else {
          filteredGames = games.filter(
            (game) =>
              game &&
              game.playtime &&
              !game.finished &&
              !game.playing &&
              game.playtime > lowerInterval
          );
        }

        const replyMessage = getReplyMessage(
          filteredGames,
          lowerInterval,
          upperInterval
        );

        // TODO: find suitable message
        ctx.replyWithMarkdown(replyMessage);
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
        [Markup.button.callback("playtime < 8h", "playtime_lt_8")],
        [Markup.button.callback("playtime > 8h < 20h", "playtime_gt_8_lt_20")],
        [Markup.button.callback("playtime > 20h", "playtime_gt_20h")],
      ])
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
