import firebase from "firebase/app";
import "firebase/database";
import idx from "idx";

const database = firebase.database();
const rootRef = firebase.database().ref();
const gamesRef = rootRef.child("games");
const systemsRef = rootRef.child("systems");
import { isAuthorizedUser } from "../utils/isAuthorizedUser";

import type { GameReference, System } from "../types";

const NodeCache = require("node-cache");
const botCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

let systemKeys: string[] = [];
let systemRefs: firebase.database.Reference[] = [];
let gamesContainer: GameReference[] = [];

const fetchAllGames = () =>
  gamesRef
    .once("value", (snap) => {
      snap.forEach((child) => {
        const { key } = child;
        if (key) {
          systemKeys.push(key);
        }
      });
    })
    .then(() => {
      systemKeys.forEach((system) => {
        const systemRef = database.ref(`games/${system}`);
        systemRefs.push(systemRef);
      });
    })
    .then(() =>
      Promise.all(gatherGames()).then((res) => {
        // cache all games for 5 minutes
        return gamesContainer;
      })
    );

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

let gatherGames = () => {
  const promises = systemRefs.map((systemRef) =>
    systemRef.once("value", (snap) => {
      const data = snap.val();
      Object.keys(data).forEach((game) => {
        data[game].key = game;
        if (snap.key) {
          gamesContainer.push({ title: data[game].title, parent: snap.key });
        }
      });
    })
  );

  return promises;
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
      // TODO: check if messageLength is working
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
          fetchAllGames().then((allGames) => {
            searchResults = getSearchResults(allGames, message);
            fetchAllShortNames().then((systems) => {
              botCache.set("allSystems", systems);
              // add system shortname for each game found to bot reply
              let reply = getGamesWithShortName(searchResults, systems);

              botCache.set("allGames", allGames);

              botReply(reply, ctx);
              systemKeys = [];
              systemRefs = [];
              gamesContainer = [];
            });
          });
        } else {
          searchResults = getSearchResults(cachedGames, message);
          let reply = getGamesWithShortName(searchResults, cachedSystems);
          botReply(reply, ctx);
        }
      }
    } else {
      ctx.reply("You're not an authorized user! 🙅🏼");
    }
  });
};
export default search;