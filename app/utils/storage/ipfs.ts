import { PublicKey } from '@solana/web3.js';
import fetch from '../fetch';
import type { Metadata } from '../metadata';
import { FileType, type StorageBackend } from './common';

export class IpfsStorage implements StorageBackend {
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
   * @param {FileType} _
   * @returns {Promise<string>}
   * @memberof IpfsStorage
   */
  async uploadFile(file: File, _: FileType): Promise<string> {
    const content = await file.text();
    return await this._send(content, file.type);
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
   * @param {string} content
   * @param {string} type
   * @returns {Promise<string>}
   * @memberof IpfsStorage
   */
  private async _send(content: string, type: string): Promise<string> {
    const resp = await fetch('/api/ipfs', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        type
      })
    });

    const { cid } = await resp.json();
    return cid;
  }
}
