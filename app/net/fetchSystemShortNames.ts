import firebase from "firebase/app";
import "firebase/database";

import type { System } from "../types";

export const fetchSystemShortNames = async () => {
  const database = await firebase.database();
  const rootRef = await database.ref();
  const systemsRef = await rootRef.child("systems");

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
