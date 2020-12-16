import firebase from "firebase/app";
import "firebase/database";

const { Extra, Markup } = require("telegraf");

const database = firebase.database();

import { isAuthorizedUser } from "../utils/isAuthorizedUser";
import { fetchSystems } from "../net/fetchSystems";
import type { Game, System } from "../types";

function cleanupString(systemString: string) {
  return systemString.slice(0, -2).trim();
}

const replyWithSystemData = (ctx: any, systems: System[]) => {
  const games: string[] = [];

  const cleanSystemString = cleanupString(ctx.match[0]);
  const requestedSystem = systems.find(
    (system) => system.title === cleanSystemString
  );

  if (requestedSystem) {
    const systemRef = database.ref(`games/${requestedSystem.url}`);

    systemRef
      .once("value", (snap) => {
        const data = snap.val();
        Object.keys(data).forEach((node) => {
          data[node].key = node;
          const game: Game = data[node];
          const status =
            game.playing || game.finished
              ? `${game.playing ? "🕹" : ""}${game.finished ? "✅" : ""}`
              : "🆕";
          games.push(`${game.title} ${status}`);
        });
      })
      .then(() => {
        ctx.replyWithMarkdown(
          `Here are your *${cleanSystemString}* Games 😘`,
          Extra.markup(Markup.removeKeyboard())
        );
        ctx.reply(
          `- ${games.toString().split(",").join("\n- ")}`,
          Extra.markup(Markup.removeKeyboard())
        );
      });
  }
};

const getSystemData = (ctx: any, bot: any) => {
  const userId = ctx.message.from.id.toString();
  if (isAuthorizedUser(userId)) {
    fetchSystems()
      .then((systems) => {
        if (systems) {
          const systemTitles = systems.map((system) => {
            return `${system.title} 🕹`;
          });

          bot.hears(/.*🕹/gim, (ctx: any) => {
            replyWithSystemData(ctx, systems);
          });

          return ctx.reply(
            "Please select which games you would like to see 🕹",
            Extra.markup(Markup.keyboard(systemTitles))
          );
        }
      })
      .catch((error) => console.error("Systems Error", error));
  } else {
    ctx.reply("You're not an authorized user! 🙅🏼");
  }
};

const systems = (bot: any) => {
  bot.command("/gamesbysystem", (ctx: any) => getSystemData(ctx, bot));
};

export default systems;
