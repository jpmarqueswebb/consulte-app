'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FundoHero } from '@/components/FundoHero';
import { BotaoFunil } from '@/components/BotaoFunil';
import { BOTAO_OPCAO_CLASSES, OPCOES_BENEFICIOS } from '@/lib/fluxo';

export default function BeneficiosPage() {
  const router = useRouter();
  const [opcaoId, setOpcaoId] = useState<string | null>(null);

  function continuar() {
    if (!opcaoId) return;

    if (opcaoId === 'pratique') {
      router.push('/beneficios/pratique');
    } else if (opcaoId === 'exames') {
      router.push('/cidade?origem=exames&operadora=consulte-beneficios&rede=saude');
    } else if (opcaoId === 'clinicas') {
      router.push('/cidade?origem=clinicas&operadora=consulte-beneficios&rede=saude');
    }
  }

  return (
    <FundoHero hrefVoltar="/rede">
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#3BAEE1]">
          Clube de Vantagens
        </span>
        <h1 className="text-3xl font-bold text-white sm:text-[clamp(2rem,3.5vw,2.75rem)] sm:leading-[1.15] mt-1">
          Consulte Benefícios
        </h1>
        <p className="mt-3 text-lg text-white/85 sm:text-[clamp(1.125rem,1.6vw,1.25rem)]">
          Escolha uma das opções abaixo:
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 max-w-lg mx-auto w-full">
        {OPCOES_BENEFICIOS.map((opcao) => {
          const selecionada = opcao.id === opcaoId;
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => setOpcaoId(opcao.id)}
              className={`${BOTAO_OPCAO_CLASSES} w-full justify-start ${
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
              <span className="text-left font-bold text-[#004C83]">
                {opcao.nome}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <BotaoFunil onClick={continuar} disabled={!opcaoId} variante="continuar">
          CLIQUE PARA CONTINUAR
        </BotaoFunil>
      </div>
    </FundoHero>
  );
}
