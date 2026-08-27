'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FundoHero } from '@/components/FundoHero';
import { BOTAO_FUNIL_CONTINUAR_CLASSES, BOTAO_OPCAO_CLASSES, REDES } from '@/lib/fluxo';

export default function RedePage() {
  const router = useRouter();
  const [redeId, setRedeId] = useState<string | null>(null);

  function continuar() {
    if (!redeId) return;
    router.push(`/plano?rede=${encodeURIComponent(redeId)}`);
  }

  return (
    <FundoHero hrefVoltar="/">
      <h1 className="text-4xl font-bold text-white sm:text-5xl">
        Escolha qual a sua rede credenciada:
      </h1>
      <p className="mt-3 text-lg text-white/85 sm:text-xl">Escolha uma opção</p>

      <div className="mt-10 flex flex-col items-center gap-7 sm:flex-row sm:justify-center sm:gap-8">
        {REDES.map((rede) => {
          const selecionada = rede.id === redeId;
          return (
            <button
              key={rede.id}
              type="button"
              onClick={() => setRedeId(rede.id)}
              className={`${BOTAO_OPCAO_CLASSES} ${selecionada ? 'ring-4 ring-white/70' : ''}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#004C83]">
                <span
                  className={`h-3 w-3 rounded-full bg-[#004C83] transition-transform duration-200 ${
                    selecionada ? 'scale-100' : 'scale-0'
                  }`}
                />
              </span>
              {rede.nome}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={continuar} disabled={!redeId} className={BOTAO_FUNIL_CONTINUAR_CLASSES}>
          CLIQUE PARA CONTINUAR
        </button>
      </div>
    </FundoHero>
  );
}
