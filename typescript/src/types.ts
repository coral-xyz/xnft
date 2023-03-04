/*
 * Copyright (C) 2023 Blue Coral, Inc.
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

import { BN, type IdlAccounts, type IdlTypes } from "@coral-xyz/anchor";
import type { JsonMetadata, Metadata } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import type { Tag, XnftMetadataPropertiesType } from "./schema";
import { IDL, type Xnft } from "./xnft";

// ================
// IDL PARSED TYPES
// ================
export type IdlAccessAccount = IdlAccounts<Xnft>["access"];
export type IdlInstallAccount = IdlAccounts<Xnft>["install"];
export type IdlReviewAccount = IdlAccounts<Xnft>["review"];
export type IdlXnftAccount = IdlAccounts<Xnft>["xnft"];

export type IdlCreateXnftParameters = IdlTypes<Xnft>["CreateXnftParams"];
export type IdlUpdateXnftParameters = IdlTypes<Xnft>["UpdateParams"];

// =================
// ABSTRACTION TYPES
// =================
export const KindOptions = IDL.types[4].type.variants.map(v => v.name);
console.assert(IDL.types[4].type.variants.map(v => v.name).includes("App"));

export const TagOptions = IDL.types[5].type.variants.map(v => v.name);
console.assert(IDL.types[5].type.variants.map(v => v.name).includes("Defi"));

export type CreatorParam = {
  address: PublicKey;
  share: number;
};

type CreateXnftCommonParameters = {
  tag: Tag;
  uri: string;
};

export type CreateXnftCollectibleOptions = CreateXnftCommonParameters & {
  metadata: PublicKey;
  mint: PublicKey;
};

export type CreateXnftAppOptions = CreateXnftCommonParameters & {
  creators: CreatorParam[];
  curator?: PublicKey;
  installAuthority?: PublicKey;
  installPrice?: BN;
  installVault?: PublicKey;
  name: string;
  sellerFeeBasisPoints?: number;
  supply?: BN;
};

export type UpdateXnftOptions = {
  installAuthority?: PublicKey;
  installPrice: BN;
  installVault: PublicKey;
  name?: string;
  supply?: BN;
  tag: Tag;
  uri?: string;
};

export type XnftAccount = {
  data: IdlXnftAccount;
  metadata: CustomMetadata;
  publicKey: PublicKey;
  token: {
    address: PublicKey;
    owner: PublicKey;
  };
};

export type CustomJsonMetadata = JsonMetadata<string> & { xnft: XnftMetadataPropertiesType };
export type CustomMetadata = Metadata<CustomJsonMetadata>;
