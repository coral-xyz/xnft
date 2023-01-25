const nodeResolve = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const commonjs = require("@rollup/plugin-commonjs");

module.exports = {
  input: "src/index.ts",
  plugins: [
    commonjs(),
    nodeResolve({
      browser: true,
      extensions: [".js", ".ts"],
      dedupe: ["bn.js", "buffer"],
      preferBuiltins: false,
    }),
    typescript({
      tsconfig: "./tsconfig.base.json",
      moduleResolution: "node",
      target: "es2019",
      outDir: './types',
      outputToFilesystem: false,
    })
  ],
  external: [
    "@coral-xyz/anchor",
    "@metaplex-foundation/js",
    "@solana/spl-token",
    "@solana/web3.js",
    "semver",
    "zod"
  ],
  output: {
    file: "./dist/browser/index.mjs",
    format: "es",
    sourcemap: true,
  },
};
