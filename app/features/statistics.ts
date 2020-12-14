import firebase from "firebase/app";
import "firebase/database";

const database = firebase.database();
const rootRef = database.ref();
const systemsRef = rootRef.child("systems");
import { isAuthorizedUser } from "../utils/isAuthorizedUser";
import type { System } from "../types";

const fetchStatistics = () => {
  const systems: System[] = [];
  return systemsRef
    .once("value", (snap) => {
      const data = snap.val();

      Object.keys(data).forEach((system) => {
        systems.push(data[system]);
      });
    })
    .then(() => systems);
};

const statistics = (bot: any) => {
  bot.command("/statistics", (ctx: any) => {
    const userId = ctx.message.from.id.toString();
    if (isAuthorizedUser(userId)) {
      fetchStatistics().then((systems) => {
        const statistics = systems.map((system) => {
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
