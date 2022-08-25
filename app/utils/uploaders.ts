import { PublicKey } from '@solana/web3.js';
import fetch from 'isomorphic-unfetch';
import { getBundlePath, getIconPath, getMetadataPath, getScreenshotPath } from './api';
import { S3_BUCKET_URL } from './constants';
import type { Metadata } from './metadata';

export const enum FileType {
  Bundle = 'bundle',
  Icon = 'icon',
  Screenshot = 'screenshot'
}

interface Uploader {
  uploadFile(file: File, type: FileType): Promise<any>;
  uploadMetadata(data: Metadata): Promise<string>;
}

export class S3Uploader implements Uploader {
  constructor(public publicKey: PublicKey) {}

  async uploadFile(file: File, type: FileType): Promise<string> {
    let fileName: string;
    switch (type) {
      case FileType.Bundle: {
        fileName = getBundlePath(this.publicKey, file.name);
        break;
      }

      case FileType.Icon: {
        fileName = getIconPath(this.publicKey, file.name);
        break;
      }

      case FileType.Screenshot: {
        fileName = getScreenshotPath(this.publicKey, file.name);
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
    const fileName = getMetadataPath(this.publicKey);
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
}
