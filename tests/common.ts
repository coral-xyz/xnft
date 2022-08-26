import { web3 } from '@project-serum/anchor';

export const metadataProgram = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
