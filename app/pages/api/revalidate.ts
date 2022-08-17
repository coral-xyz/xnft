import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method must be `POST`' });
  } else if (req.headers.authorization !== process.env.NEXT_PUBLIC_MY_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const xnft = req.query.xnft;

  try {
    await res.revalidate('/');

    if (xnft && xnft !== '') {
      await res.revalidate(`/app/${xnft}`);
      return res.json({ revalidated: true });
    }
  } catch (err) {
    res.status(500).send('Error revalidating');
  }
}
