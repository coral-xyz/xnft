import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Blob, NFTStorage } from 'nft.storage';

const client = new NFTStorage({
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

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ cid: string } | { error: string | Error }>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method must be `PUT`' });
  }

  const { content, type } = req.body as RequestBody;

  try {
    const blob = new Blob([typeof content === 'string' ? content : Buffer.from(content)], { type });
    const cid = await client.storeBlob(blob);

    return res.status(201).json({ cid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export default withSentry(handler);
