import Link from 'next/link';
import { FundoHero } from '@/components/FundoHero';
import { BOTAO_FUNIL_CLASSES, REDES } from '@/lib/fluxo';

export default function RedePage() {
  return (
    <FundoHero>
      <h1 className="text-3xl font-bold text-white sm:text-5xl">Escolha qual rede credenciada:</h1>

      <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
        {REDES.map((rede) => (
          <Link
            key={rede.id}
            href={`/plano?rede=${encodeURIComponent(rede.id)}`}
            className={BOTAO_FUNIL_CLASSES}
          >
            {rede.nome}
          </Link>
        ))}
      </div>
    </FundoHero>
  );
}
