import Image from 'next/image';

const articles = [
  {
    title: 'WTF are xNFTs?',
    subtitle: 'Include a brief description of the article in this area'
  },
  {
    title: 'Publish an xNFT',
    subtitle: "Have an App? Publish it as an XNFT on Coral's decentralised marketplace"
  }
];

export default function Posts() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-theme-font text-xl font-bold tracking-wide">News</h2>
      <div className="flex flex-col gap-10 sm:flex-row">
        {articles.map((article, index) => (
          <div
            key={index}
            className="bg-theme-background-light flex max-w-xl flex-col items-center justify-around
              gap-6 rounded-xl py-10 px-10 md:gap-2 lg:flex-row"
          >
            <div className="flex flex-col">
              <div className="text-xs font-medium uppercase tracking-wide text-zinc-300">
                Featured Article
              </div>
              <div className="text-theme-font text-xl tracking-wide">{article.title}</div>
              <div className="mt-4 text-sm text-zinc-300">{article.subtitle}</div>

              <a
                className="item-center mt-4 w-40 cursor-not-allowed rounded-xl
                  bg-zinc-100 py-3 px-2 text-center font-medium
                  transition delay-100 ease-in-out hover:scale-110"
              >
                Read Article
              </a>
            </div>

            <Image
              alt=""
              className=" rounded-xl bg-cover"
              src="/article1.jpeg"
              width="500px"
              height="340px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
