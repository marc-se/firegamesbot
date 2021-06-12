import { NumberLiteralType } from "typescript";

export enum Region {
  PAL = "PAL",
  US = "US",
  JAP = "JAP",
}

export type Game = {
  title: string;
  genre: string;
  region: Region;
  playing: boolean;
  finished: boolean;
  playtime?: number;
};

export type System = {
  alias: string;
  title: string;
  url: string;
  finished: number;
  playing: number;
  untouched: number;
  games: number;
};

export type Genre = {
  title: string;
  url: string;
};

export type WishlistItem = {
  collected: boolean;
  purchased: boolean;
  region: Region;
  system: string;
  title: string;
};

export interface GameReference extends Game {
  playtime: number;
  key: string;
  parent: string;
}
