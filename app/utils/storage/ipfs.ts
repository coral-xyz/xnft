import { PublicKey } from '@solana/web3.js';
import fetch from '../fetch';
import type { Metadata } from '../metadata';
import { FileType, type StorageBackend } from './common';

export class IpfsStorage implements StorageBackend {
  /**
   * @param {PublicKey} _
   * @memberof IpfsStorage
   */
  constructor(_: PublicKey) {}

  /**
   * @param {PublicKey} _
   * @param {string} comment
   * @returns {Promise<string>}
   * @memberof IpfsStorage
   */
  async uploadComment(_: PublicKey, comment: string): Promise<string> {
    return await this._send(JSON.stringify({ comment }), 'application/json');
  }

  /**
   * @param {File} file
   * @param {FileType} type
   * @returns {Promise<string>}
   * @memberof IpfsStorage
   */
  async uploadFile(file: File, type: FileType): Promise<string> {
    let data: string | Buffer;

    if (type === FileType.Bundle) {
      data = await file.text();
    } else {
      const ab = await file.arrayBuffer();
      data = Buffer.from(ab);
    }

    return await this._send(data, file.type);
  }

  /**
   * @param {Metadata} data
   * @returns {Promise<string>}
   * @memberof IpfsStorage
   */
  async uploadMetadata(data: Metadata): Promise<string> {
    return await this._send(JSON.stringify(data), 'application/json');
  }

  /**
   * Common HTTP request function to send content and file type
   * to the private API handler for uploading and return the CID.
   * @private
   * @param {string | Buffer} content
   * @param {string} type
   * @returns {Promise<string>}
   * @memberof IpfsStorage
   */
  private async _send(content: string | Buffer, type: string): Promise<string> {
    const body = JSON.stringify({
      content: typeof content === 'string' ? content : [...content.values()],
      type
    });

    const resp = await fetch('/api/storage/ipfs', {
      method: 'PUT',
      headers: {
        'Content-Length': body.length.toString(),
        'Content-Type': 'application/json'
      },
      body
    });

    const { cid } = await resp.json();
    return `ipfs://${cid}`;
  }
}
