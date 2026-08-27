'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { FundoHero } from '@/components/FundoHero';
import { SeletorOpcao } from '@/components/SeletorOpcao';
import { BOTAO_FUNIL_CONTINUAR_CLASSES, OPERADORAS } from '@/lib/fluxo';

function PlanoConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rede = searchParams.get('rede') ?? '';
  const [operadoraId, setOperadoraId] = useState<string | null>(null);

  function continuar() {
    if (!operadoraId) return;
    const params = new URLSearchParams();
    if (rede) params.set('rede', rede);
    params.set('operadora', operadoraId);
    router.push(`/cidade?${params.toString()}`);
  }

  return (
    <FundoHero>
      <h1 className="text-3xl font-bold text-white sm:text-5xl">Qual é o seu plano?</h1>

      <div className="mt-10 flex justify-center">
        <SeletorOpcao
          opcoes={OPERADORAS.map((o) => ({ id: o.id, label: o.nome }))}
          valor={operadoraId}
          onSelecionar={setOperadoraId}
        />
      </div>

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={continuar} disabled={!operadoraId} className={BOTAO_FUNIL_CONTINUAR_CLASSES}>
          CLIQUE PARA CONTINUAR
        </button>
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
