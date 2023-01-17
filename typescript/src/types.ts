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
import semver from "semver";
import { z } from "zod";
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
export type Kind = Lowercase<typeof IDL.types[4]["type"]["variants"][number]["name"]>;
export const KindOptions = IDL.types[4].type.variants.map(v => v.name);
console.assert(IDL.types[4].type.variants.map(v => v.name).includes("App"));

export type Tag = Lowercase<typeof IDL.types[5]["type"]["variants"][number]["name"]>;
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

// =========================
// MANIFEST SCHEMA AND TYPES
// =========================
export const VersionSchema = z
  .custom<`${number}.${number}.${number}${string}`>()
  .refine(val => semver.valid(val) !== null, {
    message: "Invalid semantic version",
    path: ["version"],
  });
export type VersionType = z.infer<typeof VersionSchema>;

export const ManifestHistorySchema = z.object({ version: VersionSchema, uri: z.string() }).array();
export type ManifestHistoryType = z.infer<typeof ManifestHistorySchema>;

export const ScreenshotsSchema = z
  .object({
    uri: z.string(),
    type: z.string(),
  })
  .array();
export type ScreenshotsType = z.infer<typeof ScreenshotsSchema>;

export const ImageSizeOptionsSchema = z
  .object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
  })
  .strict()
  .partial()
  .refine(({ sm, md, lg }) => sm !== undefined || md !== undefined || lg !== undefined, {
    message: "At least one image size must be defined",
  });
export type ImageSizeOptionsType = z.infer<typeof ImageSizeOptionsSchema>;

export const PublicKeySchema = z.string().refine(
  val => {
    try {
      new PublicKey(val);
      return true;
    } catch {
      return false;
    }
  },
  {
    message: "Invalid public key",
  }
);

export const EntrypointPlatformsSchema = z
  .object({
    android: z.string(),
    ios: z.string(),
    web: z.string(),
  })
  .strict()
  .partial()
  .refine(({ android, ios, web }) => android !== undefined || ios !== undefined || web !== undefined, {
    message: "At least one platform key must be defined for an entrypoint",
  });
export const EntrypointsCustomSchema = z.record(EntrypointPlatformsSchema);
export const EntrypointsDefaultSchema = z.object({
  default: EntrypointPlatformsSchema,
});
export const EntrypointsSchema = EntrypointsDefaultSchema.and(EntrypointsCustomSchema);
export type EntrypointsType = z.infer<typeof EntrypointsSchema>;

export const PropsSchema = z.any();
export type PropsType = z.infer<typeof PropsSchema>;

export const ManifestSchema = z.object({
  entrypoints: EntrypointsSchema,
  icon: ImageSizeOptionsSchema,
  props: PropsSchema.optional(),
  screenshots: ScreenshotsSchema.optional(),
  splash: ImageSizeOptionsSchema.optional(),
});
export type ManifestType = z.infer<typeof ManifestSchema>;

export const XnftMetadataPropertiesSchema = z.object({
  version: VersionSchema,
  manifest: ManifestSchema,
  programIds: PublicKeySchema.array().optional(),
  history: ManifestHistorySchema,
});
export type XnftMetadataPropertiesType = z.infer<typeof XnftMetadataPropertiesSchema>;
