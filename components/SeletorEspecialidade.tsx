'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SeletorOpcao } from './SeletorOpcao';

/**
 * Seletor de especialidade da tela de pesquisa: ao escolher uma opção, vai
 * direto pra página de resultados já com os parâmetros do funil (rede, operadora,
 * cidade, tipo). As opções são as especialidades do tipo da rede escolhida — o
 * `id` de cada uma é o `nome_normalizado`, que é o que /busca espera em `especialidade`.
 */
export function SeletorEspecialidade({
  especialidades,
  parametros = {},
}: {
  especialidades: { nome_normalizado: string }[];
  parametros?: Record<string, string>;
}) {
  const router = useRouter();
  const [valor, setValor] = useState<string | null>(null);

  function selecionar(nome: string) {
    setValor(nome);
    const params = new URLSearchParams({ especialidade: nome, ...parametros });
    router.push(`/busca?${params.toString()}`);
  }

  return (
    <SeletorOpcao
      opcoes={especialidades.map((e) => ({ id: e.nome_normalizado, label: e.nome_normalizado }))}
      valor={valor}
      onSelecionar={selecionar}
      placeholder="Selecione a especialidade"
    />
  );
}
