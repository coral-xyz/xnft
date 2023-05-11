import { PublicKey } from "@solana/web3.js";
import {
  BuildJsonManifestSchema,
  type AppBuildJsonManifestType,
  type CollectibleBuildJsonManifestType,
} from "../src/schema";

describe("xNFT publish manifest json schema validation", () => {
  test("minimal app", async () => {
    const json: AppBuildJsonManifestType = {
      contact: "tg:my_handler",
      description: "test json for app publishing",
      longDescription: "long description version of the app description",
      entrypoints: {
        default: {
          web: "./index.html",
        },
      },
      icon: {
        sm: "./icon.png",
      },
      kind: "app",
      name: "Test App",
      storage: "arweave",
      version: "0.0.1",
      website: "https://backpack.app",
    };

    await BuildJsonManifestSchema.parseAsync(json);
  });

  test("minimal collectible", async () => {
    const json: CollectibleBuildJsonManifestType = {
      contact: "tg:my_handler",
      entrypoints: {
        default: {
          web: "./index.html",
        },
      },
      kind: "collectible",
      storage: "arweave",
      version: "0.0.1",
      collectibleMint: PublicKey.default.toBase58(),
    };

    await BuildJsonManifestSchema.parseAsync(json);
  });
});
