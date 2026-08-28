import type { TipoProfissional } from '@/types/database';

export type OpcaoFluxo = { id: string; nome: string };
export type OpcaoCidade = OpcaoFluxo & { uf: string };

/**
 * Redes credenciadas exibidas na página 2. A escolha aqui segmenta todo o resto
 * do funil (ver REDE_TIPO): rede de saúde só mostra médicos, rede odontológica
 * só mostra dentistas — da busca até a ficha.
 */
export const REDES: OpcaoFluxo[] = [
  { id: 'saude', nome: 'Saúde' },
  { id: 'odontologico', nome: 'Odontológico' },
];

/** Rede escolhida na página 2 → tipo de profissional que a busca deve retornar. */
export const REDE_TIPO: Record<string, TipoProfissional> = {
  saude: 'medico',
  odontologico: 'dentista',
};

/** Tipo de profissional da rede escolhida no funil, ou null se a rede for inválida/ausente. */
export function tipoDaRede(redeId: string | undefined): TipoProfissional | null {
  return redeId ? (REDE_TIPO[redeId] ?? null) : null;
}

/**
 * Operadoras/seguradoras exibidas na página 3. Adicionar novas aqui quando
 * entrarem no ar — o nome precisa bater com o valor salvo em
 * `profissionais.operadora` no banco, pois é usado para filtrar a busca.
 */
export const OPERADORAS: OpcaoFluxo[] = [{ id: 'amil', nome: 'Amil' }];

const ITABIRITO: OpcaoCidade = { id: 'itabirito-mg', nome: 'Itabirito', uf: 'MG' };
const SETE_LAGOAS: OpcaoCidade = { id: 'sete-lagoas-mg', nome: 'Sete Lagoas', uf: 'MG' };

/**
 * Todas as cidades já atendidas (união de todas as redes) — usada em /busca e na
 * ficha só pra resolver id → nome/uf. nome/uf precisam bater com a tabela
 * `cidades` no banco.
 */
export const CIDADES: OpcaoCidade[] = [ITABIRITO, SETE_LAGOAS];

/**
 * Cidades oferecidas na página 4 conforme a rede escolhida. A rede de saúde
 * (COMEDI) só tem Itabirito; a rede odontológica da Amil cobre Itabirito e Sete
 * Lagoas. Ao expandir, é só acrescentar aqui.
 */
export const CIDADES_POR_REDE: Record<string, OpcaoCidade[]> = {
  saude: [ITABIRITO],
  odontologico: [ITABIRITO, SETE_LAGOAS],
};

/** Cidades a exibir na página 4 para a rede escolhida (vazio se a rede for inválida). */
export function cidadesDaRede(redeId: string | undefined): OpcaoCidade[] {
  return redeId ? (CIDADES_POR_REDE[redeId] ?? []) : [];
}

export function buscarPorId<T extends OpcaoFluxo>(lista: T[], id: string | undefined): T | undefined {
  return lista.find((item) => item.id === id);
}

/** Estilo do botão/CTA principal da página 1 do funil — grande, centralizado, responsivo, com pulso e reflexo contínuos. */
export const BOTAO_FUNIL_CLASSES =
  'efeito-brilho efeito-pulso w-full max-w-sm cursor-pointer rounded-full bg-gradient-to-r from-brand-blue via-brand-blue-dark to-brand-navy px-10 py-6 text-xl font-bold text-white shadow-2xl transition-all duration-200 enabled:hover:scale-105 enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[420px] sm:px-14 sm:py-7 sm:text-2xl';

/** Variante do botão do funil com texto mais longo ("CLIQUE PARA CONTINUAR") — usada nas páginas 2, 3 e 4, com pulso e reflexo contínuos (desligados automaticamente quando desabilitado, ver globals.css). Fonte menor e whitespace-nowrap pra caber numa linha só sem deixar o botão alto. */
export const BOTAO_FUNIL_CONTINUAR_CLASSES =
  'efeito-brilho efeito-pulso w-full max-w-sm cursor-pointer whitespace-nowrap rounded-full bg-gradient-to-r from-brand-blue via-brand-blue-dark to-brand-navy px-8 py-4 text-sm font-bold text-white shadow-2xl transition-all duration-200 enabled:hover:scale-105 enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[420px] sm:px-14 sm:py-5 sm:text-lg';

/** Botão de opção selecionável (página 2, rede credenciada) — fundo branco, texto azul da marca, com bolinha de seleção à esquerda que preenche quando a opção está ativa. */
export const BOTAO_OPCAO_CLASSES =
  'flex w-full max-w-sm cursor-pointer items-center gap-3 rounded-full bg-white px-7 py-5 text-lg font-bold text-[#004C83] shadow-2xl transition-all duration-200 hover:scale-105 sm:w-auto sm:min-w-[300px] sm:px-9 sm:py-6 sm:text-xl';
