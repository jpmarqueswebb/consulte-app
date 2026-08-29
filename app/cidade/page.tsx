'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { FundoHero } from '@/components/FundoHero';
import { SeletorOpcao } from '@/components/SeletorOpcao';
import { BOTAO_FUNIL_CONTINUAR_CLASSES, cidadesDaRede } from '@/lib/fluxo';

function CidadeConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rede = searchParams.get('rede') ?? '';
  const operadora = searchParams.get('operadora') ?? '';
  const [cidadeId, setCidadeId] = useState<string | null>(null);

  const cidades = cidadesDaRede(rede);

  // Sem rede válida não dá pra saber quais cidades oferecer — volta pro início do funil.
  useEffect(() => {
    if (cidades.length === 0) router.replace('/rede');
  }, [cidades.length, router]);

  function continuar() {
    if (!cidadeId) return;
    const params = new URLSearchParams();
    if (rede) params.set('rede', rede);
    if (operadora) params.set('operadora', operadora);
    params.set('cidade', cidadeId);
    router.push(`/pesquisar?${params.toString()}`);
  }

  const paramsVoltar = new URLSearchParams();
  if (rede) paramsVoltar.set('rede', rede);
  const hrefVoltar = `/plano${paramsVoltar.toString() ? `?${paramsVoltar.toString()}` : ''}`;

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
        <button type="button" onClick={continuar} disabled={!cidadeId} className={BOTAO_FUNIL_CONTINUAR_CLASSES}>
          CLIQUE PARA CONTINUAR
        </button>
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
