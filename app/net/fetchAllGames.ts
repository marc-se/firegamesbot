import firebase from "firebase/app";
import "firebase/database";

import type { GameReference } from "../types";

const getAllReferences = async (systemRef: firebase.database.Reference) => {
  try {
    const gamesContainer: GameReference[] = [];
    await systemRef.once("value", (snap: any) => {
      const data = snap.val();
      Object.keys(data).forEach((node) => {
        data[node].key = node;
        const game = data[node];
        if (snap.key) {
          gamesContainer.push({ title: game.title, parent: snap.key });
        }
      });
    });

    return gamesContainer;
  } catch (error) {
    console.error(error);
  }
};

const gatherGames = async (systemRefs: firebase.database.Reference[]) => {
  try {
    return Promise.all(
      systemRefs.map((systemRef) => getAllReferences(systemRef))
    );
  } catch (error) {
    console.error(error);
  }
};

export const fetchAllGames = async () => {
  try {
    const database = await firebase.database();
    const rootRef = await database.ref();
    const gamesRef = await rootRef.child("games");

    const systemKeys: string[] = [];
    const systemRefs: firebase.database.Reference[] = [];

    await gamesRef
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
      });

    return gatherGames(systemRefs);
  } catch (error) {
    console.error(error);
  }
};
