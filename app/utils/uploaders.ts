import { PublicKey } from '@solana/web3.js';
import fetch from 'isomorphic-unfetch';
import { S3_BUCKET_URL } from './constants';
import type { Metadata } from './metadata';

export const enum FileType {
  Bundle = 'bundle',
  Icon = 'icon',
  Screenshot = 'screenshot'
}

interface Uploader {
  uploadComment(author: PublicKey, comment: string): Promise<string>;
  uploadFile(file: File, type: FileType): Promise<any>;
  uploadMetadata(data: Metadata): Promise<string>;
}

export class S3Uploader implements Uploader {
  constructor(public publicKey: PublicKey) {}

  async uploadComment(author: PublicKey, comment: string): Promise<string> {
    const fileName = this.getCommentPath(author);
    const resp = await fetch('/api/s3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: fileName,
        type: 'application/json'
      })
    });

    const { url } = await resp.json();

    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ comment })
    });

    return `${S3_BUCKET_URL}/${fileName}`;
  }

  async uploadFile(file: File, type: FileType): Promise<string> {
    let fileName: string;
    switch (type) {
      case FileType.Bundle: {
        fileName = this.getBundlePath(file.name);
        break;
      }

      case FileType.Icon: {
        fileName = this.getIconPath(file.name);
        break;
      }

      case FileType.Screenshot: {
        fileName = this.getScreenshotPath(file.name);
        break;
      }

      default: {
        throw new Error(`Invalid file type ${type} provided`);
      }
    }

    const resp = await fetch('/api/s3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: fileName,
        type: file.type
      })
    });

    const { url } = await resp.json();

    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-type': file.type,
        'Access-Control-Allow-Origin': '*'
      },
      body: file
    });

    return `${S3_BUCKET_URL}/${fileName}`;
  }

  async uploadMetadata(data: Metadata): Promise<string> {
    const fileName = this.getMetadataPath();
    const resp = await fetch('/api/s3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: fileName,
        type: 'application/json'
      })
    });

    const { url } = await resp.json();

    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    });

    return `${S3_BUCKET_URL}/${fileName}`;
  }

  getBundlePath(name: string): string {
    return `${this.publicKey.toBase58()}/bundle/${name}`;
  }

  getCommentPath(author: PublicKey): string {
    return `${this.publicKey.toBase58()}/comments/${author.toBase58()}/comment.json`;
  }

  getIconPath(name: string): string {
    return `${this.publicKey.toBase58()}/icon/${name}`;
  }

  getMetadataPath(): string {
    return `${this.publicKey.toBase58()}/metadata.json`;
  }

  getScreenshotPath(name: string): string {
    return `${this.publicKey.toBase58()}/screenshots/${name}`;
  }
}
