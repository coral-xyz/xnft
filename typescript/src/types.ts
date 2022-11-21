/*
 * Copyright (C) 2022 Blue Coral, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import type { IdlAccounts, IdlTypes } from "@project-serum/anchor";
import { IDL, type Xnft } from "./xnft";

export type AccessAccount = IdlAccounts<Xnft>["access"];
export type InstallAccount = IdlAccounts<Xnft>["install"];
export type ReviewAccount = IdlAccounts<Xnft>["review"];
export type XnftAccount = IdlAccounts<Xnft>["xnft"];

export type CreateXnftParameters = IdlTypes<Xnft>["CreateXnftParams"];
export type UpdateXnftParameters = IdlTypes<Xnft>["UpdateParams"];

export type Kind = typeof IDL.types[4]["type"]["variants"][number]["name"];
console.assert(IDL.types[4].type.variants.map((v) => v.name).includes("App"));
