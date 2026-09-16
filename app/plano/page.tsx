'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { FundoHero } from '@/components/FundoHero';
import { SeletorOpcao } from '@/components/SeletorOpcao';
import { BotaoFunil } from '@/components/BotaoFunil';
import { labelOpcao, operadorasDaRede } from '@/lib/fluxo';

function PlanoConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rede = searchParams.get('rede') ?? '';
  const [operadoraId, setOperadoraId] = useState<string | null>(null);
  const operadoras = operadorasDaRede(rede);

  function continuar() {
    if (!operadoraId) return;
    const params = new URLSearchParams();
    if (rede) params.set('rede', rede);
    params.set('operadora', operadoraId);
    router.push(`/cidade?${params.toString()}`);
  }

  return (
    <FundoHero hrefVoltar="/rede">
      <div className="mx-auto w-fit max-w-full">
        <h1 className="text-3xl font-bold text-white sm:whitespace-nowrap sm:text-[clamp(1.875rem,2.8vw,2.25rem)] sm:leading-[1.15]">
          Ótimo, agora me diga, qual o seu plano?
        </h1>

        <div className="mt-10">
          <SeletorOpcao
            opcoes={operadoras.map((o) => ({ id: o.id, label: labelOpcao(o) }))}
            valor={operadoraId}
            onSelecionar={setOperadoraId}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <BotaoFunil onClick={continuar} disabled={!operadoraId} variante="continuar">
          CLIQUE PARA CONTINUAR
        </BotaoFunil>
      </div>
    </FundoHero>
  );
}

export default function PlanoPage() {
  return (
    <Suspense fallback={null}>
      <PlanoConteudo />
    </Suspense>
  );
}
