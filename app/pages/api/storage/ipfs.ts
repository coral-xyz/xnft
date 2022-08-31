import type { NextApiRequest, NextApiResponse } from 'next';
import { NFTStorage } from 'nft.storage';

const endpoint = process.env.NFT_STORAGE_ENDPOINT;
const client = new NFTStorage({
  endpoint: endpoint && endpoint !== '' ? new URL(endpoint) : undefined,
  token: process.env.NFT_STORAGE_API_KEY
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb'
    }
  }
};

interface RequestBody {
  content: string | number[];
  type: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ cid: string } | { message: string | Error }>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method must be `PUT`' });
  }

  const { content, type } = req.body as RequestBody;

  try {
    const blob = new Blob([typeof content === 'string' ? content : Buffer.from(content)], { type });
    const cid = await client.storeBlob(blob);

    res.status(201).json({ cid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
}
