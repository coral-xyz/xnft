import { PublicKey } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import { getAllXNFTs } from '../utils/xnft';

const App = dynamic(() => import('../components/Library/App'));
const SecondaryCta = dynamic(() => import('../components/SecondaryCta'));
const Posts = dynamic(() => import('../components/Posts'));
const Newsletter = dynamic(() => import('../components/Newsletter'));

export async function getStaticProps() {
  const xnfts = await getAllXNFTs();

  return {
    props: {
      data: JSON.stringify(xnfts)
    },
    revalidate: 25
  };
}

function Home({ data }) {
  const xnfts = JSON.parse(data);

  return (
    <div className="flex flex-col gap-10">
      {/*  Primary CTA */}
      <div className="mx-auto flex flex-col gap-3 text-zinc-50">
        <h1 className="text-5xl font-extrabold tracking-wide">xNFT Library</h1>
        <p className="mx-auto w-64 tracking-wide">
          All your favorites Solana apps, published as executable NFTs.
        </p>
      </div>

      {/*  Apps */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-wide text-zinc-50">xNFT Apps</h2>
        <ul role="list" className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {xnfts.map((xnft, index) => (
            <li key={index} className="col-span-1 rounded-lg bg-zinc-800 py-2 hover:bg-zinc-600">
              <App
                key={index}
                iconUrl={xnft.metadata.properties.icon}
                name={xnft.metadata.name}
                description={xnft.metadata.description}
                publicKey={xnft.accounts.publicKey}
                publisher={new PublicKey(xnft.accounts.account.publisher)}
                installVault={new PublicKey(xnft.accounts.account.installVault)}
              />
            </li>
          ))}
        </ul>
      </div>

      <SecondaryCta publishDisable={false} />
      <Posts />
      <Newsletter />
    </div>
  );
}

export default Home;
