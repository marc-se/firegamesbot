const { Markup } = require("telegraf");

import { isAuthorizedUser } from "../utils/isAuthorizedUser";

import { fetchAllGames } from "../net/fetchAllGames";
import { fetchSystems } from "../net/fetchSystems";
import type { GameReference, System } from "../types";

const NodeCache = require("node-cache");
const botCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * get reply message for playtime results
 * @param games
 * @param systems
 * @param lowerInterval
 * @param upperInterval
 * @returns
 */
const getReplyMessage = (
  games: GameReference[],
  systems: System[] = [],
  lowerInterval: number,
  upperInterval: number
): string[] => {
  let introMessage = "";
  if (lowerInterval && upperInterval) {
    introMessage = `Games between ${lowerInterval} and ${upperInterval} hours playtime:\n`;
  } else if (lowerInterval <= 8) {
    introMessage = `Games with less than ${lowerInterval} hours playtime:\n`;
  } else {
    introMessage = `Games with more than ${lowerInterval} hours playtime:\n`;
  }

  if (games.length > 100) {
    const half = Math.round(games.length / 2);
    const firstChunk = games.slice(0, half);
    const secondChunk = games.slice(half);

    let firstChunkReply = "";
    let secondChunkReply = "";

    firstChunk.forEach((game) => {
      const systemNode = systems.find((system) => system.url === game.parent);
      if (systemNode && systemNode.alias) {
        firstChunkReply = `${firstChunkReply}\n- ${game.title} (${systemNode.alias}, ${game.playtime}h)`;
        return;
      }
      firstChunkReply = `${firstChunkReply}\n- ${game.title} (${game.playtime}h)`;
    });

    secondChunk.forEach((game) => {
      const systemNode = systems.find((system) => system.url === game.parent);
      if (systemNode && systemNode.alias) {
        secondChunkReply = `${secondChunkReply}\n- ${game.title} (${systemNode.alias}, ${game.playtime}h)`;
        return;
      }
      secondChunkReply = `${secondChunkReply}\n- ${game.title} (${game.playtime}h)`;
    });

    return [`${introMessage}${firstChunkReply}`, secondChunkReply];
  }

  let replyMessage = "";

  games.forEach((game) => {
    const systemNode = systems.find((system) => system.url === game.parent);
    if (systemNode && systemNode.alias) {
      replyMessage = `${replyMessage}\n- ${game.title} (${systemNode.alias}, ${game.playtime}h)`;
      return;
    }
    replyMessage = `${replyMessage}\n- ${game.title} (${game.playtime}h)`;
  });

  return [`${introMessage}${replyMessage}`];
};

/**
 * filter games by playtime
 * @param lowerInterval
 * @param upperInterval
 * @param games
 * @returns
 */
const filterGamesByPlaytime = (
  lowerInterval: number,
  upperInterval: number,
  games: GameReference[]
) => {
  let filteredGames: GameReference[] = [];
  if (lowerInterval && upperInterval) {
    filteredGames = games.filter(
      (game) =>
        game &&
        game.playtime &&
        !game.finished &&
        !game.playing &&
        game.playtime > lowerInterval &&
        game.playtime < upperInterval
    );
    return filteredGames;
  } else if (lowerInterval <= 8) {
    filteredGames = games.filter(
      (game) =>
        game &&
        game.playtime &&
        !game.finished &&
        !game.playing &&
        game.playtime < lowerInterval
    );
    return filteredGames;
  } else {
    filteredGames = games.filter(
      (game) =>
        game &&
        game.playtime &&
        !game.finished &&
        !game.playing &&
        game.playtime > lowerInterval
    );
    return filteredGames;
  }
};

const handlePlaytimeOption = (
  ctx: any,
  lowerInterval: number = 0,
  upperInterval: number = 0
) => {
  const cachedGames = botCache.get("allGames");
  const cachedSystems = botCache.get("allSystems");

  let filteredGames: GameReference[] = [];

  if (cachedGames == undefined || cachedSystems == undefined) {
    fetchAllGames()
      .then((res) => {
        if (res) {
          // @ts-ignore
          const nestedGames: GameReference[][] = res;
          const games = ([] as GameReference[]).concat(...nestedGames);
          let filteredGames: GameReference[] = [];

          botCache.set("allGames", games);

          filteredGames = filterGamesByPlaytime(
            lowerInterval,
            upperInterval,
            games
          );

          fetchSystems().then((systems) => {
            botCache.set("allSystems", systems);
            const replyMessage = getReplyMessage(
              filteredGames,
              systems,
              lowerInterval,
              upperInterval
            );

            replyMessage.forEach((reply) => ctx.replyWithMarkdown(reply));
          });
          return;
        }
      })
      .catch((error) => console.error("Playtime Error", error));
    return;
  }

  filteredGames = filterGamesByPlaytime(
    lowerInterval,
    upperInterval,
    cachedGames
  );

  const replyMessage = getReplyMessage(
    filteredGames,
    cachedSystems,
    lowerInterval,
    upperInterval
  );

  replyMessage.forEach((reply) => ctx.replyWithMarkdown(reply));

  return;
};

/**
 * bot user prompt for playtime options
 * @param ctx
 * @param bot
 */
const getGamesByPlaytime = (ctx: any, bot: any) => {
  const userId = ctx.message.from.id.toString();
  if (isAuthorizedUser(userId)) {
    ctx.replyWithMarkdown(
      `*Choose your prefered playtime*`,
      Markup.inlineKeyboard([
        [Markup.button.callback("playtime less than 8h", "playtime_lt_8")],
        [
          Markup.button.callback(
            "playtime between 8h and 20h",
            "playtime_gt_8_lt_20"
          ),
        ],
        [Markup.button.callback("playtime more than 20h", "playtime_gt_20h")],
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
