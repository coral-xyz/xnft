import { PublicKey } from '@solana/web3.js';
import type { Metadata } from '../metadata';

export const enum FileType {
  Bundle = 'bundle',
  Icon = 'icon',
  Screenshot = 'screenshot'
}

export interface StorageBackend {
  uploadComment(author: PublicKey, comment: string): Promise<string>;
  uploadFile(file: File, type: FileType): Promise<string>;
  uploadMetadata(data: Metadata): Promise<string>;
}
