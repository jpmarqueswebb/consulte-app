import Link from 'next/link';
import { FundoHero } from '@/components/FundoHero';
import { BotaoFunil } from '@/components/BotaoFunil';

export default function Home() {
  return (
    <FundoHero>
      <h1 className="text-2xl font-bold text-white sm:text-[clamp(1.5rem,3.75vw,3rem)] sm:leading-[1.1]">
        <span className="text-3xl text-[#3BAEE1] sm:text-[clamp(1.875rem,4.7vw,3.75rem)]">CONSULTE -</span> A rede
        <br className="sm:hidden" /> credenciada do seu plano
        <br className="sm:hidden" /> na palma da sua mão
      </h1>

      <div className="mt-10 flex flex-col items-center justify-center gap-4">
        <BotaoFunil href="/rede" variante="inicial">
          CLIQUE AQUI
        </BotaoFunil>

        <Link
          href="/carteirinha"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          Acessar minha Carteirinha Digital
        </Link>
      </div>
    </FundoHero>
  );
}
