import mailchimp from '@mailchimp/mailchimp_marketing';
import { withSentry } from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

const listID = process.env.MAILCHIMP_LISTID;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method must be `POST`' });
  } else if (req.query.secret !== process.env.NEXT_PUBLIC_MY_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const email = req.query.email;

  try {
    await mailchimp.lists.addListMember(listID, {
      email_address: email,
      status: 'pending'
    });

    res.end();
  } catch (err) {
    console.error('Error subscribing:', err);
    res.status(500).send('Error subscribing email');
  }
}

export default withSentry(handler);
