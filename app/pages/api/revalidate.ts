export default async function handler(req, res) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.NEXT_PUBLIC_MY_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const xnft = req.query.xnft;

  try {
    await res.unstable_revalidate('/');

    if (xnft) await res.unstable_revalidate(`/app/${xnft}`);

    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send('Error revalidating');
  }
}