import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from '../../utils/fetch';
import type { Metadata } from '../../utils/metadata';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb'
    }
  }
};

interface RequestBody {
  uri: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Metadata | { message: string | Error }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method must be `POST`' });
  }

  const { uri } = req.body as RequestBody;

  try {
    const resp = await fetch(
      uri,
      {
        headers: {
          'Cache-Control': 'public,max-age=30'
        }
      },
      10000
    );
    const meta = await resp.json();

    res.status(200).json(meta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
}
