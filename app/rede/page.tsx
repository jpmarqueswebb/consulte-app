'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FundoHero } from '@/components/FundoHero';
import { BotaoFunil } from '@/components/BotaoFunil';
import { BOTAO_OPCAO_CLASSES, REDES } from '@/lib/fluxo';

export default function RedePage() {
  const router = useRouter();
  const [opcaoId, setOpcaoId] = useState<string | null>(null);

  function continuar() {
    if (!opcaoId) return;

    if (opcaoId === 'consulte-beneficios') {
      router.push('/beneficios');
    } else if (opcaoId === 'consulte-parceiros') {
      router.push('/cidade?origem=parceiros');
    } else {
      // Rede credenciada
      router.push('/plano?rede=saude');
    }
  }

  return (
    <FundoHero hrefVoltar="/">
      <h1 className="text-4xl font-bold text-white sm:text-[clamp(2.25rem,3.75vw,3rem)] sm:leading-[1.1] uppercase tracking-wide">
        ESCOLHA UMA OPÇÃO
      </h1>
      <p className="mt-3 text-lg text-white/85 sm:text-[clamp(1.125rem,1.6vw,1.25rem)]">
        Selecione o serviço que deseja consultar
      </p>

      <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6 max-w-4xl mx-auto">
        {REDES.map((opcao) => {
          const selecionada = opcao.id === opcaoId;
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => setOpcaoId(opcao.id)}
              className={`${BOTAO_OPCAO_CLASSES} ${
                selecionada ? 'ring-4 ring-white/70 scale-102' : ''
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#004C83]">
                <span
                  className={`h-3 w-3 rounded-full bg-[#004C83] transition-transform duration-200 ${
                    selecionada ? 'scale-100' : 'scale-0'
                  }`}
                />
              </span>
              <span className="truncate">{opcao.nome}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <BotaoFunil onClick={continuar} disabled={!opcaoId} variante="continuar">
          CLIQUE PARA CONTINUAR
        </BotaoFunil>
      </div>
    </FundoHero>
  );
}
