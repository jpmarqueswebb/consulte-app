import type { TipoProfissional } from '@/types/database';

export type OpcaoFluxo = {
  id: string;
  /** Valor usado para filtrar no banco (ex.: `profissionais.operadora`) — não mexer sem atualizar o cadastro. */
  nome: string;
  /** Texto exibido nas telas do funil, quando diferente de `nome` (ex.: nome mais didático pro cliente). */
  label?: string;
};
export type OpcaoCidade = OpcaoFluxo & { uf: string };

/** Texto a exibir pra uma opção do funil: usa `label` quando houver, senão `nome`. */
export function labelOpcao(opcao: OpcaoFluxo): string {
  return opcao.label ?? opcao.nome;
}

/**
 * Opções principais exibidas na primeira escolha do funil (/rede).
 */
export const REDES: OpcaoFluxo[] = [
  { id: 'rede-credenciada', nome: 'Rede credenciada' },
  { id: 'consulte-beneficios', nome: 'Consulte Benefícios' },
  { id: 'consulte-parceiros', nome: 'Consulte Parceiros' },
];

/**
 * Subopções exibidas na tela do Consulte Benefícios (/beneficios).
 */
export const OPCOES_BENEFICIOS: OpcaoFluxo[] = [
  { id: 'pratique', nome: 'Programa Pratique' },
  { id: 'exames', nome: 'Descontos em exames', label: 'Descontos em exames (Laboratórios)' },
  { id: 'clinicas', nome: 'Desconto em clínicas' },
];

/** Rede escolhida no funil → tipo de profissional que a busca deve retornar. */
export const REDE_TIPO: Record<string, TipoProfissional> = {
  'rede-credenciada': 'medico',
  saude: 'medico',
  odontologico: 'dentista',
};

/** Tipo de profissional da rede escolhida no funil, ou null se a rede for inválida/ausente. */
export function tipoDaRede(redeId: string | undefined): TipoProfissional | null {
  return redeId ? (REDE_TIPO[redeId] ?? null) : null;
}

const AMIL: OpcaoFluxo = { id: 'amil', nome: 'Amil', label: 'Amil Saúde' };
const AMIL_DENTAL: OpcaoFluxo = { id: 'amil-dental', nome: 'Amil', label: 'Amil Dental' };

/**
 * Convênio TEM Saúde e Consulte Benefícios — ainda sem base de médicos
 * cadastrada no banco (ver ESPECIALIDADES_TEM_SAUDE e
 * ESPECIALIDADES_CONSULTE_BENEFICIOS). `nome` não bate com nenhum
 * `profissionais.operadora` de propósito: a busca não vai encontrar ninguém
 * até essa base existir, mas a opção já aparece no funil.
 *
 * O Centro Ocupacional NÃO é uma opção própria aqui — ele existe só como um
 * dos resultados possíveis dentro do Consulte Benefícios (junto com a
 * Clínica Inovar), conforme pedido da cliente.
 */
const TEM_SAUDE: OpcaoFluxo = { id: 'tem-saude', nome: 'Convênio TEM Saúde' };
const CONSULTE_BENEFICIOS: OpcaoFluxo = { id: 'consulte-beneficios', nome: 'Consulte Benefícios' };

/**
 * Todas as operadoras/seguradoras já cadastradas (união de todas as redes) —
 * usada em /busca só pra resolver id → nome. O nome precisa bater com o valor
 * salvo em `profissionais.operadora` no banco, pois é usado para filtrar a busca.
 */
export const OPERADORAS: OpcaoFluxo[] = [AMIL, AMIL_DENTAL, TEM_SAUDE, CONSULTE_BENEFICIOS];

/**
 * Operadoras oferecidas na página 3 conforme a rede escolhida. A rede de
 * saúde usa Amil, Convênio TEM Saúde e Consulte Benefícios (nessa ordem); a
 * rede odontológica usa a Amil Dental. Ao expandir, é só acrescentar aqui.
 */
export const OPERADORAS_POR_REDE: Record<string, OpcaoFluxo[]> = {
  saude: [AMIL, TEM_SAUDE, CONSULTE_BENEFICIOS],
  odontologico: [AMIL_DENTAL],
};

/**
 * Especialidades que o Convênio TEM Saúde cobre, exatamente como a cliente
 * passou — a página de pesquisa mostra essa lista fixa (não vem do banco) só
 * quando essa operadora é escolhida. Sem base de médicos ainda, então a busca
 * final não retorna resultado, só a especialidade é filtrada.
 */
export const ESPECIALIDADES_TEM_SAUDE = [
  'Cardiologista',
  'Cirurgião Geral',
  'Ginecologista',
  'Urologista',
  'Psiquiatra',
  'Angiologista',
  'Ortopedista',
  'Nutricionista',
  'Gastro',
  'Dermatologista',
];

/**
 * Especialidades/exames que o Consulte Benefícios cobre — junção do que o
 * Centro Ocupacional e a Clínica Inovar oferecem (as duas clínicas por trás
 * desse plano; ver ESPECIALIDADES_CONSULTE_BENEFICIOS_CENTRO_OCUPACIONAL e
 * ESPECIALIDADES_CONSULTE_BENEFICIOS_INOVAR). Quem tiver a especialidade
 * cadastrada aparece no resultado: pode ser só uma clínica ou as duas juntas
 * (ex.: Nutricionista e Psicologia, que ambas oferecem).
 */
const ESPECIALIDADES_CONSULTE_BENEFICIOS_CENTRO_OCUPACIONAL = [
  'Alergista',
  'Angiologia',
  'Cardiologia',
  'Cirurgia Geral',
  'Clínico Geral',
  'Dermatologia',
  'Endocrinologia',
  'Fonoaudiologia',
  'Gastroenterologia',
  'Ginecologia',
  'Médico da Família',
  'Nutricionista',
  'Neuropsicologia',
  'Neurologia',
  'Oftalmologia',
  'Ortopedia / Traumatologia',
  'Otorrinolaringologia',
  'Pediatria',
  'Pneumologia',
  'Psiquiatria',
  'Psicologia',
  'Psicanálise',
  'Urologia',
];

const ESPECIALIDADES_CONSULTE_BENEFICIOS_INOVAR = [
  'Ecocardiograma / Ecodopplercardiograma',
  'Audiometria / Aparelho Auditivo',
  'Nutricionista',
  'Psicologia',
  'Consultas Médicas',
  'Exames Laboratoriais',
  'Análises Clínicas',
  'Genética',
  'Anatomia Patológica',
  'Toxicológicos',
  'Ultrassom Abdome Total',
  'Ultrassom Rins e Vias Urinárias',
  'Ultrassom Pélvico Masculino',
  'Ultrassom Pélvico Feminino',
  'Ultrassom Transvaginal',
  'Ultrassom Doppler Arterial de Membros Inferiores/Superiores',
  'Ultrassom Doppler Venoso de Membros Inferiores/Superiores',
  'Ultrassom Doppler de Carótidas e Vertebrais',
  'Ultrassom Doppler de Vasos Hepáticos',
  'Ultrassom Doppler de Vasos Renais',
  'Ultrassom Mapeamento Venoso (por membro)',
  'Ultrassom Tireoide com Doppler',
  'Ultrassom Cervical com Doppler',
  'Ultrassom Doppler de Veia Cava Inferior',
  'Ultrassom Abdome Superior',
  'Ultrassom Bolsa Escrotal com Doppler',
  'Ultrassom Bolsa Escrotal',
  'Ultrassom Partes Moles',
  'Ultrassom Cervical',
  'Ultrassom Glândulas Salivares',
  'Ultrassom Músculo e Articulações (por articulação)',
];

const CATEGORIAS_PARCEIROS_BENEFICIOS = [
  'Farmácia / Drogaria',
  'Ótica',
  'Laboratório / Exames',
  'Academia / Bem-estar',
];

/** Lista final exibida na página de pesquisa: união das clínicas conveniadas e categorias de empresas parceiras. */
export const ESPECIALIDADES_CONSULTE_BENEFICIOS = Array.from(
  new Set([
    ...CATEGORIAS_PARCEIROS_BENEFICIOS,
    ...ESPECIALIDADES_CONSULTE_BENEFICIOS_CENTRO_OCUPACIONAL,
    ...ESPECIALIDADES_CONSULTE_BENEFICIOS_INOVAR,
  ])
);

/**
 * Operadoras cuja lista de especialidades da página de pesquisa é fixa
 * (não vem do banco) — ver ESPECIALIDADES_TEM_SAUDE e
 * ESPECIALIDADES_CONSULTE_BENEFICIOS.
 */
export const ESPECIALIDADES_POR_OPERADORA: Record<string, string[]> = {
  'tem-saude': ESPECIALIDADES_TEM_SAUDE,
  'consulte-beneficios': ESPECIALIDADES_CONSULTE_BENEFICIOS,
};

/** Operadoras a exibir na página 3 para a rede escolhida (vazio se a rede for inválida). */
export function operadorasDaRede(redeId: string | undefined): OpcaoFluxo[] {
  return redeId ? (OPERADORAS_POR_REDE[redeId] ?? []) : [];
}

const ITABIRITO: OpcaoCidade = { id: 'itabirito-mg', nome: 'Itabirito', uf: 'MG' };
const SETE_LAGOAS: OpcaoCidade = { id: 'sete-lagoas-mg', nome: 'Sete Lagoas', uf: 'MG' };

/**
 * Todas as cidades já atendidas (união de todas as redes) — usada em /busca e na
 * ficha só pra resolver id → nome/uf. nome/uf precisam bater com a tabela
 * `cidades` no banco.
 */
export const CIDADES: OpcaoCidade[] = [ITABIRITO, SETE_LAGOAS];

/**
 * Cidades oferecidas na página 4 conforme a rede escolhida. Tanto a rede de
 * saúde quanto a odontológica cobrem Itabirito e Sete Lagoas. Ao expandir, é
 * só acrescentar aqui.
 */
export const CIDADES_POR_REDE: Record<string, OpcaoCidade[]> = {
  saude: [ITABIRITO, SETE_LAGOAS],
  odontologico: [ITABIRITO, SETE_LAGOAS],
};

/**
 * Operadoras que restringem as cidades da página 4 a um subconjunto — Convênio
 * TEM Saúde atende só Sete Lagoas; Consulte Benefícios cobre Itabirito e Sete Lagoas.
 */
export const CIDADES_POR_OPERADORA: Record<string, OpcaoCidade[]> = {
  'tem-saude': [SETE_LAGOAS],
  'consulte-beneficios': [ITABIRITO, SETE_LAGOAS],
};

/** Cidades a exibir na página 4 para a rede escolhida (vazio se a rede for inválida). */
export function cidadesDaRede(redeId: string | undefined): OpcaoCidade[] {
  return redeId ? (CIDADES_POR_REDE[redeId] ?? []) : [];
}

/**
 * Cidades a exibir na página 4 pro par rede + operadora escolhidos — checa
 * primeiro se a operadora restringe as cidades (CIDADES_POR_OPERADORA) e só
 * cai pra lista da rede (cidadesDaRede) se não houver restrição específica.
 */
export function cidadesDoFunil(redeId: string | undefined, operadoraId: string | undefined): OpcaoCidade[] {
  if (operadoraId && CIDADES_POR_OPERADORA[operadoraId]) return CIDADES_POR_OPERADORA[operadoraId];
  return cidadesDaRede(redeId);
}

export function buscarPorId<T extends OpcaoFluxo>(lista: T[], id: string | undefined): T | undefined {
  return lista.find((item) => item.id === id);
}

/**
 * Estilo do botão/CTA principal da página 1 do funil — grande, centralizado, responsivo, com pulso e reflexo contínuos.
 * A partir do breakpoint `sm`, padding e fonte são fluidos (clamp): acompanham a largura da tela em vez de
 * saltar pro tamanho de desktop e ficar grande demais em notebooks. Piso = tamanho mobile, teto = tamanho desktop.
 */
export const BOTAO_FUNIL_CLASSES =
  'efeito-brilho efeito-pulso w-full max-w-sm cursor-pointer rounded-full bg-gradient-to-r from-brand-blue via-brand-blue-dark to-brand-navy px-10 py-6 text-xl font-bold text-white shadow-2xl transition-all duration-200 enabled:hover:scale-105 enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[420px] sm:px-[clamp(2.5rem,4.4vw,3.5rem)] sm:py-[clamp(1.5rem,2.5vw,1.75rem)] sm:text-[clamp(1.25rem,1.9vw,1.5rem)]';

/** Variante do botão do funil com texto mais longo ("CLIQUE PARA CONTINUAR") — usada nas páginas 2, 3 e 4, com pulso e reflexo contínuos (desligados automaticamente quando desabilitado, ver globals.css). Fonte menor e whitespace-nowrap pra caber numa linha só sem deixar o botão alto. Padding/fonte fluidos do `sm` pra cima (ver BOTAO_FUNIL_CLASSES). */
export const BOTAO_FUNIL_CONTINUAR_CLASSES =
  'efeito-brilho efeito-pulso w-full max-w-sm cursor-pointer whitespace-nowrap rounded-full bg-gradient-to-r from-brand-blue via-brand-blue-dark to-brand-navy px-8 py-4 text-sm font-bold text-white shadow-2xl transition-all duration-200 enabled:hover:scale-105 enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[420px] sm:px-[clamp(2rem,4.4vw,3.5rem)] sm:py-[clamp(1rem,1.6vw,1.25rem)] sm:text-[clamp(0.875rem,1.5vw,1.125rem)]';

/** Botão de opção selecionável (página 2, rede credenciada) — fundo branco, texto azul da marca, com bolinha de seleção à esquerda que preenche quando a opção está ativa. Padding/fonte fluidos do `sm` pra cima (ver BOTAO_FUNIL_CLASSES). */
export const BOTAO_OPCAO_CLASSES =
  'flex w-full max-w-sm cursor-pointer items-center gap-3 rounded-full bg-white px-7 py-5 text-lg font-bold text-[#004C83] shadow-2xl transition-all duration-200 hover:scale-105 sm:w-auto sm:min-w-[300px] sm:px-[clamp(1.75rem,2.9vw,2.25rem)] sm:py-[clamp(1.25rem,2vw,1.5rem)] sm:text-[clamp(1.125rem,1.6vw,1.25rem)]';
