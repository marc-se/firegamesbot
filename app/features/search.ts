import firebase from "firebase/app";
import "firebase/database";
import idx from "idx";

const database = firebase.database();
const rootRef = database.ref();
//const gamesRef = rootRef.child("games");
const systemsRef = rootRef.child("systems");
import { isAuthorizedUser } from "../utils/isAuthorizedUser";

import { fetchAllGames } from "../net/fetchAllGames";

import type { GameReference, System } from "../types";

const NodeCache = require("node-cache");
const botCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// TODO: put in utils function
const fetchAllShortNames = () => {
  let systems: System[] = [];
  return systemsRef
    .once("value", (snap) => {
      const data = snap.val();

      Object.keys(data).forEach((system) => {
        systems.push(data[system]);
      });
    })
    .then(() => systems);
};

function getSearchResults(games: GameReference[], message: string) {
  return games.filter((game) => {
    try {
      return game.title.toLowerCase().includes(message);
    } catch (e) {
      console.log("Error occured 🔥", e);
    }
  });
}

function botReply(result: string[], ctx: any) {
  if (result.length > 0) {
    ctx.replyWithMarkdown(
      `FOUND *${result.length}* ${
        result.length > 1 ? "GAMES" : "GAME"
      } 💁🏻\n-----\n${result.toString().split(",").join("\n")}`
    );
  } else {
    ctx.reply("NO GAMES FOUND! 😱");
  }
}

function getGamesWithShortName(games: GameReference[], systems: System[]) {
  let gamesWithShortName: string[] = [];
  games.map((game) => {
    const systemNode = systems.find((system) => system.url === game.parent);
    if (systemNode && systemNode.alias) {
      gamesWithShortName.push(`- ${game.title} (${systemNode.alias})`);
    }
  });
  return gamesWithShortName;
}

const search = (bot: any) => {
  bot.start((ctx: any) => ctx.reply("Welcome!"));

  bot.hears(/^(?!.*🕹)/gim, (ctx: any) => {
    const userId = ctx.message.from.id.toString();
    if (isAuthorizedUser(userId)) {
      const messageLength = idx(ctx, (_) => _.message.text.length) || 0;
      if (messageLength < 3) {
        ctx.reply("Please search for at least 3 characters");
      } else {
        const { text } = ctx.message;
        const message = text.toLowerCase();

        const cachedGames = botCache.get("allGames");
        const cachedSystems = botCache.get("allSystems");
        let searchResults: GameReference[] = [];

        if (cachedGames == undefined || cachedSystems == undefined) {
          fetchAllGames()
            .then((res) => {
              if (res) {
                // @ts-ignore
                const nestedGames: GameReference[][] = res;
                const games = ([] as GameReference[]).concat(...nestedGames);
                searchResults = getSearchResults(games, message);
                fetchAllShortNames().then((systems) => {
                  botCache.set("allSystems", systems);
                  // add system shortname for each game found to bot reply
                  let reply = getGamesWithShortName(searchResults, systems);

                  botCache.set("allGames", games);

                  botReply(reply, ctx);
                });
              }
            })
            .catch((error) => console.error("Search Error", error));
          return;
        }

        searchResults = getSearchResults(cachedGames, message);
        let reply = getGamesWithShortName(searchResults, cachedSystems);
        botReply(reply, ctx);
      }
    } else {
      ctx.reply("You're not an authorized user! 🙅🏼");
    }
  });
};
export default search;
