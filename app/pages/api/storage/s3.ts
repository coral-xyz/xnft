import { withSentry } from '@sentry/nextjs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { NextApiRequest, NextApiResponse } from 'next';

const client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
  }
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb'
    }
  }
};

interface RequestBody {
  name: string;
  type: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ url: string } | { error: string | Error }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method must be `POST`' });
  }

  const { name, type } = req.body as RequestBody;

  try {
    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
        Key: name,
        ContentType: type
      }),
      { expiresIn: 600 }
    );

    res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export default withSentry(handler);
