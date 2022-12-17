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

import type { JsonMetadata, Metadata } from "@metaplex-foundation/js";
import { BN, type IdlAccounts, type IdlTypes } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
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
export type Kind = Uncapitalize<typeof IDL.types[4]["type"]["variants"][number]["name"]>;
export const KindOptions = IDL.types[4].type.variants.map(v => v.name);
console.assert(IDL.types[4].type.variants.map(v => v.name).includes("App"));

export type Tag = Uncapitalize<typeof IDL.types[5]["type"]["variants"][number]["name"]>;
export const TagOptions = IDL.types[5].type.variants.map(v => v.name);
console.assert(IDL.types[5].type.variants.map(v => v.name).includes("Defi"));

type CreateXnftCommonParameters = {
  creators: CreatorsParam[];
  curator?: PublicKey;
  installAuthority?: PublicKey;
  installPrice: BN;
  installVault?: PublicKey;
  sellerFeeBasisPoints?: number;
  supply?: BN;
  tag: Tag;
  uri: string;
};

export type CreatorsParam = {
  address: PublicKey;
  share: number;
};

export type CreateAssociatedXnftOptions = CreateXnftCommonParameters & {
  kind: Kind;
};

export type CreateXnftAppOptions = CreateXnftCommonParameters & {
  name: string;
};

export type ManifestHistory = {
  version: string;
  uri: string;
}[];

export type Screenshot = {
  type: string;
  uri: string;
};

export type ManifestEntrypointPlatforms = Partial<Record<"android" | "ios" | "web", string>>;
export type ManifestEntrypoints = {
  default: ManifestEntrypointPlatforms;
  [id: string]: ManifestEntrypointPlatforms;
};

export type Manifest = {
  entrypoints: ManifestEntrypoints;
  screenshots: Screenshot[];
};

export type XnftMetadataProperties = {
  version: string;
  manifest: Manifest;
  programIds: string[];
  history: ManifestHistory;
};

export type CustomJsonMetadata = JsonMetadata<string> & { xnft: XnftMetadataProperties };

export type CustomMetadata = Metadata<CustomJsonMetadata>;

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
