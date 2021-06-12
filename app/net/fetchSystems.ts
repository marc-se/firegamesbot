import firebase from "firebase/app";
import "firebase/database";

import type { System } from "../types";

export const fetchSystems = async () => {
  try {
    const database = await firebase.database();
    const rootRef = await database.ref();
    const systemsRef = await rootRef.child("systems");
    const systems: System[] = [];

    await systemsRef.once("value", (snap) => {
      const data = snap.val();

      Object.keys(data).forEach((system) => {
        systems.push(data[system]);
      });
    });

    return systems;
  } catch (error) {
    console.error(error);
  }
};
