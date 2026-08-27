'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { FundoHero } from '@/components/FundoHero';
import { SeletorOpcao } from '@/components/SeletorOpcao';
import { BOTAO_FUNIL_CONTINUAR_CLASSES, CIDADES } from '@/lib/fluxo';

function CidadeConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rede = searchParams.get('rede') ?? '';
  const operadora = searchParams.get('operadora') ?? '';
  const [cidadeId, setCidadeId] = useState<string | null>(null);

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
      <h1 className="text-3xl font-bold text-white sm:text-5xl">Perfeito, e qual a sua cidade?</h1>

      <div className="mt-10 flex justify-center">
        <SeletorOpcao
          opcoes={CIDADES.map((c) => ({ id: c.id, label: `${c.nome} / ${c.uf}` }))}
          valor={cidadeId}
          onSelecionar={setCidadeId}
        />
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
