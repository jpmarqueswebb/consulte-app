'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FundoHero } from '@/components/FundoHero';
import { BotaoFunil } from '@/components/BotaoFunil';
import { SeletorOpcao, type OpcaoSeletor } from '@/components/SeletorOpcao';

const OPCOES_REDE: (OpcaoSeletor & { detalhe: string; icone: string })[] = [
  {
    id: 'rede-credenciada',
    label: 'Rede credenciada',
    descricao: 'Médicos, dentistas e hospitais do seu plano de saúde',
    icone: '🏥',
    detalhe:
      'Busca oficial de médicos, dentistas, clínicas e hospitais credenciados pela operadora do seu plano (ex.: Amil e Amil Dental).',
  },
  {
    id: 'consulte-beneficios',
    label: 'Consulte Benefícios',
    descricao: 'Programa Pratique Fitness, descontos em exames e clínicas',
    icone: '⭐',
    detalhe:
      'Clube exclusivo da Consulte Corretora: matrícula e mensalidade promocional na Pratique Fitness, descontos em laboratórios de exames e clínicas.',
  },
  {
    id: 'consulte-parceiros',
    label: 'Consulte Parceiros',
    descricao: 'Farmácias, óticas e comércio com desconto na carteirinha',
    icone: '🏷️',
    detalhe:
      'Rede de estabelecimentos comerciais parceiros (farmácias, óticas e serviços) com descontos exclusivos na apresentação da sua Carteirinha Digital.',
  },
];

export default function RedePage() {
  const router = useRouter();
  const [opcaoId, setOpcaoId] = useState<string | null>(null);

  const opcaoSelecionada = OPCOES_REDE.find((op) => op.id === opcaoId);

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
      <h1 className="text-3xl font-bold text-white sm:text-[clamp(2.25rem,3.75vw,3rem)] sm:leading-[1.1] uppercase tracking-wide">
        ESCOLHA UMA OPÇÃO
      </h1>
      <p className="mt-2 text-base text-white/85 sm:text-[clamp(1.125rem,1.6vw,1.25rem)]">
        Selecione o serviço que deseja consultar
      </p>

      {/* Campo Estilo Select */}
      <div className="mt-8 mx-auto w-full max-w-md">
        <SeletorOpcao
          opcoes={OPCOES_REDE}
          valor={opcaoId}
          onSelecionar={(id) => setOpcaoId(id)}
          placeholder="Selecione uma opção..."
        />
      </div>

      {/* Card Explicativo Dinâmico para Esclarecer a Diferença */}
      {opcaoSelecionada ? (
        <div className="mt-6 mx-auto w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md text-left text-white shadow-xl transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 pb-2 border-b border-white/15">
            <span className="text-2xl">{opcaoSelecionada.icone}</span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-sky block">
                Sobre este serviço
              </span>
              <h2 className="text-base font-bold text-white leading-tight">
                {opcaoSelecionada.label}
              </h2>
            </div>
          </div>
          <p className="mt-2.5 text-xs sm:text-sm text-white/90 leading-relaxed">
            {opcaoSelecionada.detalhe}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-white/60">
          Abra a lista acima para escolher entre Rede credenciada, Benefícios ou Parceiros.
        </p>
      )}

      <div className="mt-8 flex justify-center">
        <BotaoFunil onClick={continuar} disabled={!opcaoId} variante="continuar">
          CLIQUE PARA CONTINUAR
        </BotaoFunil>
      </div>
    </FundoHero>
  );
}
