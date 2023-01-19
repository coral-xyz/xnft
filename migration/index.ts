import { Metaplex, type Nft, type Sft } from "@metaplex-foundation/js";
import { Program, AnchorProvider, Wallet, type IdlAccounts, ProgramAccount } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs/promises";
import fetch from "node-fetch";
import {
  deriveMasterMintAddress,
  deriveXnftAddress,
  type CustomJsonMetadata as V2CustomJsonMetadata,
} from "../typescript/src";
import * as idls from "./idls";

const KEYPAIR_BYTES: number[] = require(process.env.KEYPAIR);
const API_BASE = process.env.API_BASE;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getProvider(): AnchorProvider {
  const connection = new Connection(process.env.RPC_ENDPOINT, "confirmed");
  const wallet = new Wallet(Keypair.fromSecretKey(Uint8Array.from(KEYPAIR_BYTES)));
  return new AnchorProvider(connection, wallet, {});
}

function getProgramV1(): Program<idls.OldXnft> {
  return new Program(idls.OldIDL, new PublicKey("BaHSGaf883GA3u8qSC5wNigcXyaScJLSBJZbALWvPcjs"), getProvider());
}

function getProgramV2(): Program<idls.NewXnft> {
  return new Program(idls.NewIDL, new PublicKey("xnft5aaToUM4UFETUQfj7NUDUBdvYHTVhNFThEYTm55"), getProvider());
}

export type V1CustomJsonMetadata = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  animation_url: string;
  external_url: string;
  properties: {
    bundle: string;
    bundle_type: string;
    files: {
      uri: string;
      type: string;
    }[];
    versions: {
      created_at: string | Date;
      semver: `${number}.${number}.${number}`;
      uri: string;
    }[];
  };
};

type V1AccountData = {
  account: IdlAccounts<idls.OldXnft>["xnft"];
  metadata: Sft | Nft;
  json: V1CustomJsonMetadata;
  publicKey: PublicKey;
};

async function getV1AccountData(
  program: Program<idls.OldXnft>,
  account: ProgramAccount<IdlAccounts<idls.OldXnft>["xnft"]>
): Promise<V1AccountData | null> {
  const mpl = Metaplex.make(program.provider.connection);
  const metadata = await mpl
    .nfts()
    .findByMetadata({ metadata: account.account.masterMetadata, loadJsonMetadata: false });

  const json = (await mpl
    .storage()
    .downloadJson(metadata.uri.replace("ipfs://", "https://nftstorage.link/ipfs/"))) as V1CustomJsonMetadata;

  return {
    account: account.account,
    metadata,
    json,
    publicKey: account.publicKey,
  };
}

function generateV2CustomMetadata(
  v1: V1CustomJsonMetadata,
  bundleUri: string,
  oldAddress: string,
  newAddress: string
): V2CustomJsonMetadata {
  return {
    name: v1.name,
    description: v1.description,
    image: v1.image.replace(oldAddress, newAddress),
    external_url: v1.external_url,
    properties: {},
    xnft: {
      version: v1.properties.versions?.at(0).semver ?? "0.1.0",
      manifest: {
        entrypoints: {
          default: {
            web: bundleUri,
          },
        },
        screenshots: v1.properties.files.map(f => ({ type: f.type, uri: f.uri.replace(oldAddress, newAddress) })),
      },
      programIds: [],
      history: [],
    },
  };
}

async function wrapLegacyBundle(uri: string): Promise<string | null> {
  const resp = await fetch(uri.replace("ipfs://", "https://nftstorage.link/ipfs/"));

  if (resp.headers.get("content-type").includes("text/html")) {
    return null;
  }

  const content = await resp.text();
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <link rel="stylesheet" href="https://doof72pbjabye.cloudfront.net/fonts/inter/font.css"></link>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          html, body {
            position:relative;
            margin: 0;
            padding: 0;
            height:100%;
            display:flex;
            flex-direction: column;
          }
          #native-container {
            display:none;
            flex-direction: column;
            flex: 1 0 100%;
          }
        </style>
      </head>
      <body>
        <div id="native-container"></div>
        <div id="container"></div>
        <!-- code loaded from ${uri} -->
        <script>${content}</script>
        <script src="https://unpkg.com/@coral-xyz/react-xnft-dom-renderer@0.2.0-latest.676/dist/index.js"></script>
      </body>
    </html>
  `;
}

function getStorageSuffix(uri: string): string {
  return uri.startsWith("ipfs://") ? "ipfs" : uri.startsWith("https://arweave") ? "arweave" : "s3";
}

async function copyS3Files(oldAddress: string, newAddress: string) {
  const uri = `${API_BASE}/api/storage/s3-copy-folder`;
  const resp = await fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: oldAddress,
      destination: newAddress,
    }),
  });

  if (resp.status !== 201) {
    const data = await resp.json();
    throw new Error(`failed to copy s3 folder: ${JSON.stringify(data)}`);
  }
}

async function uploadV2Bundle(blob: V1CustomJsonMetadata, xnft: PublicKey, content: string): Promise<string> {
  const uri = `${API_BASE}/api/storage/${getStorageSuffix(blob.image)}`;
  const body = {
    content,
    name: undefined,
    type: "text/html",
  };

  if (uri.endsWith("s3")) {
    body.name = `${xnft.toBase58()}/bundle/index.html`;
  }

  const resp = await fetch(uri, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await resp.json();
  return json.uri;
}

async function uploadV2Metadata(blob: V2CustomJsonMetadata, xnft: PublicKey): Promise<string> {
  const uri = `${API_BASE}/api/storage/${getStorageSuffix(blob.image)}`;
  const body = {
    content: JSON.stringify(blob),
    name: undefined,
    type: "application/json",
  };

  if (uri.endsWith("s3")) {
    body.name = `${xnft.toBase58()}/metadata.json`;
  }

  const resp = await fetch(uri, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await resp.json();
  return json.uri;
}

async function migrateToV2(v1: Program<idls.OldXnft>, x: ProgramAccount<IdlAccounts<idls.OldXnft>["xnft"]>) {
  // Fetch v0.1.0 account data and the HTML transformed bundle content
  const data = await getV1AccountData(v1, x as any);
  console.log(`[~] ${x.account.name}`);
  console.log(`\t+ Old pubkey: ${x.publicKey.toBase58()}`);

  // Calculate the new program's xNFT public key
  const [newMintPublicKey] = await deriveMasterMintAddress(x.account.name, x.account.publisher);
  const [newXnftPublicKey] = await deriveXnftAddress(newMintPublicKey);
  console.log(`\t+ New pubkey: ${newXnftPublicKey.toBase58()}`);

  if (data.json.image.includes("amazonaws.com")) {
    await copyS3Files(data.publicKey.toBase58(), newXnftPublicKey.toBase58());
    console.log("\t+ Copied S3 files to new folder");
  }

  const htmlBundle = await wrapLegacyBundle(data.json.properties.bundle);
  let migratedBundleUri: string = "";
  if (!htmlBundle) {
    migratedBundleUri = data.json.properties.bundle;
    console.log("\t+ Bundle already in HTML format");
  } else {
    migratedBundleUri = await uploadV2Bundle(data.json as V1CustomJsonMetadata, newXnftPublicKey, htmlBundle);
    console.log(`\t+ Bundle migrated to HTML format ${migratedBundleUri}`);
  }

  // Transform the v0.1.0 metadata blob into the v0.2.0 format and upload it for new URI
  const v2Json = generateV2CustomMetadata(
    data.json,
    migratedBundleUri,
    data.publicKey.toBase58(),
    newXnftPublicKey.toBase58()
  );

  const migratedMetadataUri = await uploadV2Metadata(v2Json, newXnftPublicKey);
  console.log(`\t+ Metadata JSON migrated and uploaded ${migratedMetadataUri}`);

  // Submit the transaction to create the new on-chain xNFT
  const v2 = getProgramV2();
  const signature = await v2.methods
    .createXnft(data.account.name, {
      creators:
        data.metadata.creators.length === 0
          ? [{ address: data.account.publisher, share: 100 }]
          : data.metadata.creators.map(c => ({ address: c.address, share: c.share })),
      curator: data.account.curator === null ? null : new PublicKey("4JgrHCTZUg8cyh8bxfVjobkAdD3i9gN7MgTusKcVKSty"),
      installAuthority: data.account.installAuthority,
      installPrice: data.account.installPrice,
      installVault: data.account.installVault,
      sellerFeeBasisPoints: data.metadata.sellerFeeBasisPoints,
      supply: data.account.supply,
      symbol: "",
      tag: Object.keys(data.account.tag)[0] === "nft" ? ({ nfts: {} } as never) : data.account.tag,
      uri: migratedMetadataUri,
    })
    .accounts({
      masterMint: newMintPublicKey,
      masterToken: await getAssociatedTokenAddress(newMintPublicKey, data.account.publisher),
      metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
      publisher: data.account.publisher,
      xnft: newXnftPublicKey,
    })
    .rpc();
  console.log(`\t+ Signature: ${signature}\n`);
}

/*********************************************************************************************/

async function main() {
  const migrations: string[] = JSON.parse(await fs.readFile("./migrations.json", "utf-8"));
  const v1 = getProgramV1();
  let xnfts = await v1.account.xnft.all();
  xnfts = xnfts.filter(x => !x.account.suspended);

  console.log(`[✓] v0.1.0 qualifying xNFTs retrieved to be migrated! (${xnfts.length} remaining)\n`);

  for (let i = 0; i < xnfts.length; i++) {
    const x = xnfts[i];
    if (migrations.includes(x.publicKey.toBase58())) {
      continue;
    }

    await migrateToV2(v1, x as any);

    migrations.push(x.publicKey.toBase58());
    await fs.writeFile("./migrations.json", JSON.stringify(migrations));

    await wait(5000);
  }
}

main();
