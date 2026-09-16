'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { FundoHero } from '@/components/FundoHero';
import { SeletorOpcao } from '@/components/SeletorOpcao';
import { BotaoFunil } from '@/components/BotaoFunil';
import { cidadesDoFunil } from '@/lib/fluxo';

function CidadeConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rede = searchParams.get('rede') ?? '';
  const operadora = searchParams.get('operadora') ?? '';
  const origem = searchParams.get('origem') ?? '';
  const [cidadeId, setCidadeId] = useState<string | null>(null);

  const cidades = cidadesDoFunil(rede || 'saude', operadora);

  // Sem opções de cidades volta pro início
  useEffect(() => {
    if (cidades.length === 0) router.replace('/rede');
  }, [cidades.length, router]);

  function continuar() {
    if (!cidadeId) return;
    const params = new URLSearchParams();
    if (rede) params.set('rede', rede);
    if (operadora) params.set('operadora', operadora);
    if (origem) params.set('origem', origem);
    params.set('cidade', cidadeId);
    router.push(`/pesquisar?${params.toString()}`);
  }

  let hrefVoltar = '/rede';
  if (origem === 'exames' || origem === 'clinicas') {
    hrefVoltar = '/beneficios';
  } else if (operadora) {
    const paramsVoltar = new URLSearchParams();
    if (rede) paramsVoltar.set('rede', rede);
    hrefVoltar = `/plano${paramsVoltar.toString() ? `?${paramsVoltar.toString()}` : ''}`;
  }

  return (
    <FundoHero hrefVoltar={hrefVoltar}>
      <div className="mx-auto w-fit max-w-full">
        <h1 className="text-3xl font-bold text-white sm:text-[clamp(1.875rem,3.75vw,3rem)] sm:leading-[1.1]">
          Perfeito, e qual a sua cidade?
        </h1>

        <div className="mt-10">
          <SeletorOpcao
            opcoes={cidades.map((c) => ({ id: c.id, label: `${c.nome} / ${c.uf}` }))}
            valor={cidadeId}
            onSelecionar={setCidadeId}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <BotaoFunil onClick={continuar} disabled={!cidadeId} variante="continuar">
          CLIQUE PARA CONTINUAR
        </BotaoFunil>
      </div>
    </FundoHero>
  );
}

export default function CidadePage() {
  return (
    <Suspense fallback={null}>
      <CidadeConteudo />
    </Suspense>
  );
}
