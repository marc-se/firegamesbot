import firebase from "firebase/app";
import "firebase/database";

import type { WishlistItem } from "../types";

export const fetchWishlist = async () => {
  try {
    const database = await firebase.database();
    const rootRef = await database.ref();
    const wishlistRef = await rootRef.child("wishlist");
    const wishlist: WishlistItem[] = [];

    await wishlistRef.once("value", (snap) => {
      const data = snap.val();
      Object.keys(data).forEach((game) => {
        wishlist.push(data[game]);
      });
    });

    return wishlist;
  } catch (error) {
    console.error(error);
  }
};
