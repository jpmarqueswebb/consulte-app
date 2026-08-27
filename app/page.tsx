import Link from 'next/link';
import { FundoHero } from '@/components/FundoHero';
import { BOTAO_FUNIL_CLASSES } from '@/lib/fluxo';

export default function Home() {
  return (
    <FundoHero>
      <h1 className="text-2xl font-bold text-white sm:text-5xl">
        <span className="text-3xl text-[#3BAEE1] sm:text-6xl">CONSULTE -</span> A rede
        <br className="sm:hidden" /> credenciada do seu plano
        <br className="sm:hidden" /> na palma da sua mão
      </h1>

      <div className="mt-10 flex justify-center">
        <Link href="/rede" className={BOTAO_FUNIL_CLASSES}>
          CLIQUE AQUI
        </Link>
      </div>
    </FundoHero>
  );
}
