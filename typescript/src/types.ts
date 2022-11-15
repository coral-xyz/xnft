import type { IdlAccounts, IdlTypes } from "@project-serum/anchor";
import type { Xnft } from "./xnft";

export type Access = IdlAccounts<Xnft>["access"];
export type Install = IdlAccounts<Xnft>["install"];
export type Review = IdlAccounts<Xnft>["review"];
export type xNFT = IdlAccounts<Xnft>["xnft"];

export type CreateXnftParameters = IdlTypes<Xnft>["CreateXnftParams"];
export type UpdateXnftParameters = IdlTypes<Xnft>["UpdateParams"];
