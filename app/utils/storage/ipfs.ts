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
    const resp = await fetch('/api/ipfs', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: JSON.stringify({ comment }),
        type: 'application/json'
      })
    });

    const { cid } = await resp.json();
    return cid;
  }

  /**
   * @param {File} file
   * @param {FileType} _
   * @returns {Promise<string>}
   * @memberof IpfsStorage
   */
  async uploadFile(file: File, _: FileType): Promise<string> {
    const content = await file.text();
    const resp = await fetch('/api/ipfs', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        type: file.type
      })
    });

    const { cid } = await resp.json();
    return cid;
  }

  /**
   * @param {Metadata} data
   * @returns {Promise<string>}
   * @memberof IpfsStorage
   */
  async uploadMetadata(data: Metadata): Promise<string> {
    const resp = await fetch('/api/ipfs', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: JSON.stringify(data),
        type: 'application/json'
      })
    });

    const { cid } = await resp.json();
    return cid;
  }
}
