import S3 from 'aws-sdk/clients/s3';
import type { NextApiRequest, NextApiResponse } from 'next';

const client = new S3({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  signatureVersion: 'v4'
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb' // TODO: using limit to show a warning
    }
  }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default async (
  req: NextApiRequest,
  res: NextApiResponse<{ url: string } | { message: string }>
) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, type } = req.body;

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
      Key: name,
      Expires: 600,
      ContentType: type
    };

    const url = await client.getSignedUrlPromise('putObject', params);

    res.status(200).json({ url });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
};
