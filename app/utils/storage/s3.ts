import { PublicKey } from '@solana/web3.js';
import fetch from 'isomorphic-unfetch';
import { S3_BUCKET_URL } from '../constants';
import type { Metadata } from '../metadata';
import { FileType, type StorageBackend } from './common';

export class S3Storage implements StorageBackend {
  /**
   * @param {PublicKey} xnft
   * @memberof S3Storage
   */
  constructor(private xnft: PublicKey) {}

  /**
   * @param {PublicKey} author
   * @param {string} comment
   * @returns {Promise<string>}
   * @memberof S3Storage
   */
  async uploadComment(author: PublicKey, comment: string): Promise<string> {
    const fileName = this.getCommentPath(author);
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
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ comment })
    });

    return `${S3_BUCKET_URL}/${fileName}`;
  }

  /**
   * @param {File} file
   * @param {FileType} type
   * @returns {Promise<string>}
   * @memberof S3Storage
   */
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

  /**
   * @param {Metadata} data
   * @returns {Promise<string>}
   * @memberof S3Storage
   */
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

  /**
   * Get full S3 bundle path.
   * @param {string} name
   * @returns {string}
   * @memberof S3Storage
   */
  getBundlePath(name: string): string {
    return `${this.xnft.toBase58()}/bundle/${name}`;
  }

  /**
   * Get full S3 comment path.
   * @param {PublicKey} author
   * @returns {string}
   * @memberof S3Storage
   */
  getCommentPath(author: PublicKey): string {
    return `${this.xnft.toBase58()}/comments/${author.toBase58()}/comment.json`;
  }

  /**
   * Get full S3 icon file path.
   * @param {string} name
   * @returns {string}
   * @memberof S3Storage
   */
  getIconPath(name: string): string {
    return `${this.xnft.toBase58()}/icon/${name}`;
  }

  /**
   * Get full S3 metadata path.
   * @returns {string}
   * @memberof S3Storage
   */
  getMetadataPath(): string {
    return `${this.xnft.toBase58()}/metadata.json`;
  }

  /**
   * Get full screenshot file path.
   * @param {string} name
   * @returns {string}
   * @memberof S3Storage
   */
  getScreenshotPath(name: string): string {
    return `${this.xnft.toBase58()}/screenshots/${name}`;
  }
}
