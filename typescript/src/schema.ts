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

import { PublicKey } from "@solana/web3.js";
import semver from "semver";
import { z, ZodLiteral, ZodUnion } from "zod";
import { KindOptions, TagOptions } from "./types";

export const VersionSchema = z
  .custom<`${number}.${number}.${number}${string}`>()
  .refine(val => semver.valid(val) !== null, {
    message: "Invalid semantic version",
    path: ["version"],
  });
export type VersionType = z.infer<typeof VersionSchema>;

export const ManifestHistorySchema = z.object({ version: VersionSchema, uri: z.string() }).strict().array();
export type ManifestHistoryType = z.infer<typeof ManifestHistorySchema>;

export const ScreenshotsSchema = z
  .object({
    uri: z.string(),
    type: z.string(),
  })
  .strict()
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

export const SplashSizeOptionsSchema = z
  .object({
    src: z.string(),
    height: z.number(),
    width: z.number(),
  })
  .strict()
  .array();
export type SplashSizeOptionsType = z.infer<typeof SplashSizeOptionsSchema>;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const KindSchema = z.union(KindOptions.map(k => z.literal(k.toLowerCase())) as any) as ZodUnion<
  readonly [
    ZodLiteral<Lowercase<(typeof KindOptions)[number]>>,
    ...ZodLiteral<Lowercase<(typeof KindOptions)[number]>>[]
  ]
>;
export type Kind = z.infer<typeof KindSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TagSchema = z.union(TagOptions.map(t => z.literal(t.toLowerCase())) as any) as ZodUnion<
  readonly [ZodLiteral<Lowercase<(typeof TagOptions)[number]>>, ...ZodLiteral<Lowercase<(typeof TagOptions)[number]>>[]]
>;
export type Tag = z.infer<typeof TagSchema>;

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

export const ContactSchema = z.string().nonempty();
export type ContactType = z.infer<typeof ContactSchema>;

export const PropsSchema = z.any();
export type PropsType = z.infer<typeof PropsSchema>;

export const StorageSchema = z.union([z.literal("arweave"), z.literal("aws"), z.literal("ipfs")]);
export type StorageType = z.infer<typeof StorageSchema>;

export const AppBuildJsonManifestSchema = z.object({
  contact: ContactSchema,
  description: z.string().min(5).max(40),
  entrypoints: EntrypointsSchema,
  icon: ImageSizeOptionsSchema,
  installAuthority: PublicKeySchema.optional(),
  installVault: PublicKeySchema.optional(),
  kind: z.literal("app"),
  longDescription: z.string().min(5).optional(),
  name: z.string().min(1).max(32),
  price: z.number().nonnegative().optional(),
  programIds: PublicKeySchema.array().optional(),
  props: z.any().optional(),
  royalitesPercentage: z.number().nonnegative().max(100).optional(),
  screenshots: z.union([ScreenshotsSchema, z.string().array()]).optional(),
  splash: SplashSizeOptionsSchema.optional(),
  storage: StorageSchema,
  supply: z.number().min(1).optional(),
  tag: TagSchema.optional(),
  version: VersionSchema,
  website: z.string().url(),
});
export type AppBuildJsonManifestType = z.infer<typeof AppBuildJsonManifestSchema>;

export const CollectibleJsonManifestSchema = z.object({
  collectibleMint: PublicKeySchema,
  contact: ContactSchema,
  entrypoints: EntrypointsSchema,
  kind: z.literal("collectible"),
  programIds: PublicKeySchema.array().optional(),
  props: z.any().optional(),
  screenshots: z.union([ScreenshotsSchema, z.string().array()]).optional(),
  splash: SplashSizeOptionsSchema.optional(),
  storage: StorageSchema,
  version: VersionSchema,
});
export type CollectibleBuildJsonManifestType = z.infer<typeof CollectibleJsonManifestSchema>;

export const BuildJsonManifestSchema = z.discriminatedUnion("kind", [
  AppBuildJsonManifestSchema,
  CollectibleJsonManifestSchema,
]);
export type BuildJsonManifestType = z.infer<typeof BuildJsonManifestSchema>;

export const ManifestSchema = z.object({
  entrypoints: EntrypointsSchema,
  icon: ImageSizeOptionsSchema,
  longDescription: z.string().min(5).optional(),
  props: PropsSchema.optional(),
  screenshots: ScreenshotsSchema.optional(),
  splash: SplashSizeOptionsSchema.optional(),
  storage: StorageSchema,
});
export type ManifestType = z.infer<typeof ManifestSchema>;

export const XnftMetadataPropertiesSchema = z.object({
  version: VersionSchema,
  manifest: ManifestSchema,
  programIds: PublicKeySchema.array().optional(),
  contact: ContactSchema,
  history: ManifestHistorySchema,
});
export type XnftMetadataPropertiesType = z.infer<typeof XnftMetadataPropertiesSchema>;
