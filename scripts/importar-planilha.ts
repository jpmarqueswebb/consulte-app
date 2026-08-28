/**
 * Script de importação/limpeza de planilha de profissionais (Consulte / Ariádne).
 * Roda uma vez, manualmente:
 *
 *   npx tsx scripts/importar-planilha.ts <planilha.csv> [--tipo=medico|dentista] [--cidade="Itabirito"] [--inspecionar]
 *
 * Requer SUPABASE_SERVICE_ROLE_KEY em .env.local (ignora RLS — nunca usar essa chave no app).
 *
 * Colunas lidas: NOME COMPLETO, TIPO, Nº CONSELHO, UF CONSELHO, CIDADE, UF, ESPECIALIDADE,
 * "ATENDE EM QUAL CLÍNICA ?". As colunas TIPO/CIDADE/UF são opcionais na planilha — se
 * ausentes, valem as flags --tipo / --cidade. O tipo (medico|dentista) é obrigatório por
 * linha (coluna TIPO ou flag --tipo): sem ele a linha vai pra descartados.csv. Nunca há
 * default silencioso de tipo na importação — o default 'medico' do banco só serve pro
 * cadastro manual do painel admin.
 *
 * Dicionários abaixo (NORMALIZACAO_ESPECIALIDADE, EXCECOES_SEPARADOR_E) foram construídos
 * a partir dos valores únicos reais de "COMEDI CORPO CLÍNICO - 20.04.2026 - Layout.csv"
 * (68 médicos, Itabirito) e de "dados/dentistas-amil.csv" (88 dentistas, Itabirito + Sete
 * Lagoas). Se a planilha for atualizada com novas especialidades ou clínicas, rode primeiro
 * com --inspecionar para levantar os valores novos antes de reimportar.
 */

import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

type TipoProfissional = 'medico' | 'dentista';

const CORRETORA_SLUG = 'ariadne';
const CIDADE_PADRAO_FALLBACK = 'Itabirito';

// Chave = como aparece na planilha, normalizado (minúsculo, sem acento) → valor = nome_normalizado final.
const NORMALIZACAO_ESPECIALIDADE: Record<string, string> = {
  // --- rede de saúde (médicos) ---
  anestesiologia: 'Anestesiologia',
  psiquiatria: 'Psiquiatria',
  acupuntura: 'Acupuntura',
  pneumologia: 'Pneumologia',
  nefrologista: 'Nefrologia',
  otorrinolaringologia: 'Otorrinolaringologia',
  'ortopedia e traumatologia': 'Ortopedia e Traumatologia',
  'cirurgia geral': 'Cirurgia Geral',
  'clinica medica': 'Clínica Médica',
  pediatria: 'Pediatria',
  oftalmologia: 'Oftalmologia',
  dermatologia: 'Dermatologia',
  dermatologista: 'Dermatologia',
  'diagnostico por imagem e ultrassonografia geral': 'Diagnóstico por Imagem e Ultrassonografia Geral',
  neurologia: 'Neurologia',
  endocrinologia: 'Endocrinologia',
  'endocrinologia e metabologia': 'Endocrinologia',
  'ginecologia e obstetricia': 'Ginecologia e Obstetrícia',
  cardiologia: 'Cardiologia',
  mastologia: 'Mastologia',
  'cirurgia vascular': 'Cirurgia Vascular',
  neurocirurgia: 'Neurocirurgia',
  coloproctologia: 'Coloproctologia',
  angiologia: 'Angiologia',
  gastroenterologia: 'Gastroenterologia',
  'cirurgia plastica': 'Cirurgia Plástica',
  'cirurgia torax': 'Cirurgia Torácica', // "Cirurgiã Tórax" na planilha (exemplo citado na spec)
  neurofisiologia: 'Neurofisiologia',
  urologia: 'Urologia',
  'medicina do trabalho': 'Medicina do Trabalho',
  'cirurgia geral/trauma e aparelho digestivo': 'Cirurgia Geral, Trauma e Aparelho Digestivo',

  // --- rede odontológica (dentistas) — as 15 categorias da rede credenciada Amil ---
  'clinica geral': 'Clínica Geral',
  cirurgia: 'Cirurgia',
  endodontia: 'Endodontia',
  'protese dentaria': 'Prótese Dentária',
  'odontologia estetica': 'Odontologia Estética',
  ortodontia: 'Ortodontia',
  periodontia: 'Periodontia',
  implantodontia: 'Implantodontia',
  odontopediatria: 'Odontopediatria',
  odontogeriatria: 'Odontogeriatria',
  estomatologia: 'Estomatologia',
  'radiologia odontologica e imaginologia': 'Radiologia Odontológica e Imaginologia',
  'disfuncao temporomandibular e dor orofacial': 'Disfunção Temporomandibular e Dor Orofacial',
  'odontologia para pacientes com necessidades especiais':
    'Odontologia para Pacientes com Necessidades Especiais',
  'urgencia em consultorio agendada': 'Urgência em Consultório Agendada',
};

// Nomes de especialidade que contêm a palavra "e" no meio e NÃO devem ser separados
// (levantados manualmente a partir dos valores únicos reais das planilhas).
const EXCECOES_SEPARADOR_E: string[] = [
  'ortopedia e traumatologia',
  'ginecologia e obstetricia',
  'diagnostico por imagem e ultrassonografia geral',
  'endocrinologia e metabologia',
  'cirurgia geral/trauma e aparelho digestivo',
  'radiologia odontologica e imaginologia',
  'disfuncao temporomandibular e dor orofacial',
];

// Palavras que indicam que o campo "local" na verdade é um texto de status, não um endereço.
const PALAVRAS_LOCAL_VALIDO = ['clinica', 'hospital', 'consultorio', 'ambulatorio', 'laboratorio', 'concel'];
const PALAVRAS_INATIVO = ['demissao', 'descredenciad', 'nao atende mais'];
const REGEX_APENAS_OUTRA_CIDADE = /\b(somente|apenas)\s+em\b/;

// Separa clínicas distintas dentro do campo "local": por "/" ou por " e ", desde que o que vem
// depois seja um nome próprio (maiúscula) e não continue descrevendo o mesmo contato
// ("Telefone"/"WhatsApp"/"Whastsapp" — grafia com erro que aparece na planilha).
const SEPARADOR_LOCAL =
  /\s*\/\s*(?=[A-ZÀ-Ú])(?!(?:[Ww]hats[Aa]pp|WhastsApp|[Tt]elefone))|\s+e\s+(?=[A-ZÀ-Ú])(?!(?:[Ww]hats[Aa]pp|WhastsApp|[Tt]elefone))/g;

const REGEX_TELEFONE_LABEL = /telefone/i;
const REGEX_WHATSAPP_LABEL = /whatsapp|whastsapp/i;
const REGEX_TELEFONE = /\(?\d{2}\)?[\s.-]?\d{4,5}-?\d{4}/g;

interface Descarte {
  nome: string;
  crm: string;
  motivo: string;
}

interface RevisaoEspecialidade {
  nome: string;
  crm: string;
  textoOriginal: string;
}

interface ContatoLocal {
  nome: string;
  telefone: string | null;
  whatsapp: string | null;
  whatsappValido: boolean;
  extras: string[];
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Separa múltiplas especialidades de um campo bruto.
 *
 * Quando o campo usa ";" como separador (formato das planilhas novas, ex.
 * "Cirurgia; Clínica Geral; Endodontia"), confia nele: cada pedaço é uma
 * especialidade atômica, sem heurística de "/", "," ou "e".
 *
 * Sem ";" (formato legado da planilha de médicos), cai na heurística antiga,
 * respeitando a lista de exceções (nomes compostos que contêm "e" mas são UMA
 * especialidade só).
 */
function separarEspecialidades(bruto: string): string[] {
  if (bruto.includes(';')) {
    return bruto
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const normalizadoCompleto = normalizar(bruto);
  if (EXCECOES_SEPARADOR_E.includes(normalizadoCompleto)) {
    return [bruto.trim()];
  }

  const partes: string[] = [];
  for (const segmento of bruto.split('/')) {
    const segmentoTrim = segmento.trim();
    if (!segmentoTrim) continue;

    if (EXCECOES_SEPARADOR_E.includes(normalizar(segmentoTrim))) {
      partes.push(segmentoTrim);
      continue;
    }

    for (const sub of segmentoTrim.split(/,|\be\b/i)) {
      const subTrim = sub.trim();
      if (subTrim) partes.push(subTrim);
    }
  }

  return partes;
}

/** 9 dígitos após o DDD = celular válido. 8 dígitos = padrão pré-2012, nunca auto-corrigido. */
function whatsappValido(digitos: string): boolean {
  return digitos.length !== 10;
}

function situacaoDoTexto(localBruto: string): {
  situacao: 'ativo' | 'inativo' | 'descartar';
  observacao?: string;
} {
  const normalizado = normalizar(localBruto);
  const pareceEndereco =
    /\(\d{2}\)/.test(localBruto) || PALAVRAS_LOCAL_VALIDO.some((p) => normalizado.includes(p));

  if (pareceEndereco) {
    return { situacao: 'ativo' };
  }

  if (PALAVRAS_INATIVO.some((p) => normalizado.includes(p))) {
    return { situacao: 'inativo', observacao: localBruto.trim() };
  }

  if (REGEX_APENAS_OUTRA_CIDADE.test(normalizado)) {
    return { situacao: 'descartar', observacao: localBruto.trim() };
  }

  // Texto de status não reconhecido: nunca supor — mesmo tratamento do caso anterior.
  return { situacao: 'descartar', observacao: localBruto.trim() };
}

/**
 * Extrai nome + telefone + whatsapp de UM segmento de clínica já separado pelo
 * SEPARADOR_LOCAL. Lida com: número único compartilhado entre telefone e whatsapp
 * ("Telefone e WhatsApp (31) X"), telefone e whatsapp distintos, mais de um telefone
 * listado antes do whatsapp (guarda o primeiro como principal, resto vai pra `extras`),
 * e números "soltos" sem rótulo (tratados como telefone fixo, nunca validados como whatsapp).
 */
function extrairContato(segmento: string): ContatoLocal {
  const matchTel = segmento.match(REGEX_TELEFONE_LABEL);
  const matchWhats = segmento.match(REGEX_WHATSAPP_LABEL);
  const idxTel = matchTel?.index ?? Infinity;
  const idxWhats = matchWhats?.index ?? Infinity;

  const telefones = [...segmento.matchAll(REGEX_TELEFONE)].map((m) => ({
    digitos: m[0].replace(/\D/g, ''),
    index: m.index ?? 0,
  }));

  const fimNome = Math.min(idxTel, idxWhats, telefones[0]?.index ?? Infinity);
  const nome = segmento
    .slice(0, fimNome === Infinity ? segmento.length : fimNome)
    .replace(/[-–—]\s*$/, '')
    .trim();

  const hasTel = idxTel !== Infinity;
  const hasWhats = idxWhats !== Infinity;

  if (hasTel && hasWhats && telefones.length === 1) {
    const { digitos } = telefones[0];
    return { nome, telefone: digitos, whatsapp: digitos, whatsappValido: whatsappValido(digitos), extras: [] };
  }

  if (hasWhats) {
    const antesDoWhats = telefones.filter((t) => t.index < idxWhats);
    const depoisDoWhats = telefones.filter((t) => t.index >= idxWhats);
    const telefone = antesDoWhats[0]?.digitos ?? null;
    const whatsapp = depoisDoWhats[0]?.digitos ?? antesDoWhats[antesDoWhats.length - 1]?.digitos ?? null;
    const extras = [...antesDoWhats.slice(1), ...depoisDoWhats.slice(1)]
      .filter((t) => t.digitos !== telefone && t.digitos !== whatsapp)
      .map((t) => t.digitos);

    return {
      nome,
      telefone: telefone === whatsapp ? null : telefone,
      whatsapp,
      whatsappValido: whatsapp ? whatsappValido(whatsapp) : true,
      extras,
    };
  }

  // Sem rótulo de WhatsApp: tudo é telefone (rotulado "Telefone" ou solto/fixo).
  const [primeiro, ...resto] = telefones;
  return {
    nome,
    telefone: primeiro?.digitos ?? null,
    whatsapp: null,
    whatsappValido: true,
    extras: resto.map((t) => t.digitos),
  };
}

/** Separa o campo de local em clínicas distintas e extrai o contato de cada uma. */
function extrairLocais(localBruto: string, nomeProfissional: string): ContatoLocal[] {
  return localBruto
    .split(SEPARADOR_LOCAL)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((segmento) => {
      const contato = extrairContato(segmento);
      // "Consultório" sozinho não identifica uma clínica de verdade — é o consultório
      // particular de cada médico, e vários médicos usam esse mesmo nome genérico com
      // números diferentes. Sem desambiguar, o upsert por nome coletaria essa diferença.
      if (normalizar(contato.nome) === 'consultorio') {
        return { ...contato, nome: `Consultório (${nomeProfissional})` };
      }
      return contato;
    });
}

async function main() {
  const args = process.argv.slice(2);
  const flags = new Map<string, string>();
  let caminhoCsv: string | undefined;
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [chave, valor] = arg.slice(2).split('=');
      flags.set(chave, valor ?? 'true');
    } else if (!caminhoCsv) {
      caminhoCsv = arg;
    }
  }

  if (!caminhoCsv) {
    console.error(
      'Uso: npx tsx scripts/importar-planilha.ts <planilha.csv> [--tipo=medico|dentista] [--cidade="Itabirito"] [--inspecionar]'
    );
    process.exit(1);
  }

  const tipoPadrao = flags.get('tipo')?.trim().toLowerCase();
  if (tipoPadrao && tipoPadrao !== 'medico' && tipoPadrao !== 'dentista') {
    console.error(`--tipo inválido: "${tipoPadrao}" (use "medico" ou "dentista")`);
    process.exit(1);
  }
  const cidadePadrao = flags.get('cidade')?.trim() || CIDADE_PADRAO_FALLBACK;

  const csvBruto = readFileSync(caminhoCsv, 'utf-8');
  const linhas: Record<string, string>[] = parse(csvBruto, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  // CPF nunca entra no banco: mesmo que uma versão futura da planilha traga essa coluna,
  // descartamos explicitamente aqui — CRM já identifica o profissional publicamente,
  // e CPF é dado pessoal sem finalidade legítima num app público (risco de LGPD desnecessário).
  for (const linha of linhas) {
    for (const chave of Object.keys(linha)) {
      if (normalizar(chave).includes('cpf')) {
        delete linha[chave];
      }
    }
  }

  // --inspecionar é análise local da planilha, não toca no banco.
  if (flags.has('inspecionar')) {
    const valoresUnicos = new Set<string>();
    for (const l of linhas) {
      for (const item of separarEspecialidades((l['ESPECIALIDADE'] ?? '').trim())) {
        valoresUnicos.add(item);
      }
    }
    console.log('Valores únicos de especialidade encontrados na planilha (já separados):');
    console.log([...valoresUnicos].sort().join('\n'));
    console.log(
      '\nUse essa lista para preencher NORMALIZACAO_ESPECIALIDADE e EXCECOES_SEPARADOR_E antes de rodar sem --inspecionar.'
    );
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em .env.local');
    process.exit(1);
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

  const { data: corretora } = await supabase
    .from('corretoras')
    .select('id')
    .eq('slug', CORRETORA_SLUG)
    .single();
  if (!corretora) {
    console.error(`Corretora "${CORRETORA_SLUG}" não encontrada — rode supabase/seed.sql primeiro.`);
    process.exit(1);
  }

  // ---- resolvedores com cache -------------------------------------------------

  const cacheCidade = new Map<string, string | null>();
  async function resolverCidadeId(nome: string, uf: string): Promise<string | null> {
    const chave = `${normalizar(nome)}|${normalizar(uf)}`;
    if (cacheCidade.has(chave)) return cacheCidade.get(chave) ?? null;
    const { data } = await supabase
      .from('cidades')
      .select('id')
      .ilike('nome', nome)
      .ilike('uf', uf)
      .maybeSingle();
    cacheCidade.set(chave, data?.id ?? null);
    return data?.id ?? null;
  }

  const cacheEspecialidade = new Map<string, string | null>();
  async function resolverEspecialidadeId(
    nomeFinal: string,
    tipo: TipoProfissional
  ): Promise<string | null> {
    const chave = normalizar(nomeFinal);
    if (cacheEspecialidade.has(chave)) return cacheEspecialidade.get(chave) ?? null;

    const { data: existente } = await supabase
      .from('especialidades')
      .select('id')
      .ilike('nome_normalizado', nomeFinal)
      .maybeSingle();
    if (existente) {
      cacheEspecialidade.set(chave, existente.id);
      return existente.id;
    }

    const { data: nova, error } = await supabase
      .from('especialidades')
      .insert({ nome_normalizado: nomeFinal, tipo })
      .select('id')
      .single();
    if (error || !nova) {
      console.error(`  especialidade "${nomeFinal}": ${error?.message ?? 'erro ao criar'}`);
      cacheEspecialidade.set(chave, null);
      return null;
    }
    cacheEspecialidade.set(chave, nova.id);
    return nova.id;
  }

  /** Cria/atualiza o profissional. Com conselho: upsert por (crm, uf_crm, corretora). Sem conselho: identidade por (corretora, nome). */
  async function upsertProfissional(p: {
    nome: string;
    crm: string;
    uf: string;
    tipo: TipoProfissional;
    situacao: 'ativo' | 'inativo';
    observacao: string | null;
  }): Promise<{ id: string } | null> {
    const base = {
      corretora_id: corretora!.id,
      nome: p.nome,
      uf_crm: p.uf,
      tipo: p.tipo,
      situacao: p.situacao,
      situacao_observacao: p.observacao,
    };

    if (p.crm) {
      const { data, error } = await supabase
        .from('profissionais')
        .upsert({ ...base, crm: p.crm }, { onConflict: 'crm,uf_crm,corretora_id' })
        .select('id')
        .single();
      if (error) console.error(`  profissional "${p.nome}" (conselho ${p.crm}): ${error.message}`);
      return data ?? null;
    }

    const { data: existente } = await supabase
      .from('profissionais')
      .select('id')
      .eq('corretora_id', corretora!.id)
      .is('crm', null)
      .ilike('nome', p.nome)
      .maybeSingle();

    if (existente) {
      const { data, error } = await supabase
        .from('profissionais')
        .update(base)
        .eq('id', existente.id)
        .select('id')
        .single();
      if (error) console.error(`  profissional "${p.nome}" (sem conselho, update): ${error.message}`);
      return data ?? null;
    }

    const { data, error } = await supabase
      .from('profissionais')
      .insert({ ...base, crm: null })
      .select('id')
      .single();
    if (error) console.error(`  profissional "${p.nome}" (sem conselho, insert): ${error.message}`);
    return data ?? null;
  }

  // ---- loop principal -------------------------------------------------------

  const descartados: Descarte[] = [];
  const revisaoEspecialidades: RevisaoEspecialidade[] = [];
  const telefonesExtras: string[] = [];
  const porTipo: Record<string, number> = {};
  const porCidade: Record<string, number> = {};
  let importados = 0;
  let whatsappParaConferir = 0;

  for (const linha of linhas) {
    const nome = (linha['NOME COMPLETO'] ?? '').trim();
    const crm = (linha['Nº CONSELHO'] ?? '').trim();
    const uf = (linha['UF CONSELHO'] ?? 'MG').trim() || 'MG';
    const especialidadeBruta = (linha['ESPECIALIDADE'] ?? '').trim();
    const localBruto = (linha['ATENDE EM QUAL CLÍNICA ?'] ?? '').trim();
    const tipoLinha = ((linha['TIPO'] ?? '').trim().toLowerCase() || tipoPadrao) as string | undefined;
    const cidadeNome = (linha['CIDADE'] ?? '').trim() || cidadePadrao;
    const cidadeUf = (linha['UF'] ?? 'MG').trim() || 'MG';

    if (!nome) {
      descartados.push({ nome, crm, motivo: 'nome ausente' });
      continue;
    }

    if (tipoLinha !== 'medico' && tipoLinha !== 'dentista') {
      descartados.push({
        nome,
        crm,
        motivo: 'tipo ausente/inválido — informe a coluna TIPO na planilha ou a flag --tipo',
      });
      continue;
    }

    const { situacao, observacao } = situacaoDoTexto(localBruto);

    if (situacao === 'descartar') {
      descartados.push({ nome, crm, motivo: observacao ?? 'texto de local não reconhecido' });
      continue;
    }

    const especialidades = separarEspecialidades(especialidadeBruta);
    if (especialidades.length === 0) {
      revisaoEspecialidades.push({ nome, crm, textoOriginal: especialidadeBruta });
      continue;
    }

    const cidadeId = await resolverCidadeId(cidadeNome, cidadeUf);
    if (!cidadeId) {
      descartados.push({
        nome,
        crm,
        motivo: `cidade não encontrada: ${cidadeNome}/${cidadeUf} — rode supabase/patch-003 ou seed.sql`,
      });
      continue;
    }

    const profissional = await upsertProfissional({
      nome,
      crm,
      uf,
      tipo: tipoLinha,
      situacao: situacao === 'inativo' ? 'inativo' : 'ativo',
      observacao: situacao === 'inativo' ? (observacao ?? null) : null,
    });

    if (!profissional) {
      descartados.push({ nome, crm, motivo: 'erro ao gravar profissional (ver log acima)' });
      continue;
    }

    for (const nomeEspecialidade of especialidades) {
      const nomeFinal =
        NORMALIZACAO_ESPECIALIDADE[normalizar(nomeEspecialidade)] ?? nomeEspecialidade.trim();
      const especialidadeId = await resolverEspecialidadeId(nomeFinal, tipoLinha);
      if (especialidadeId) {
        await supabase
          .from('profissional_especialidades')
          .upsert({ profissional_id: profissional.id, especialidade_id: especialidadeId });
      }
    }

    if (situacao === 'ativo' && localBruto) {
      for (const contato of extrairLocais(localBruto, nome)) {
        if (!contato.nome) continue;

        const { data: local } = await supabase
          .from('locais')
          .upsert(
            { corretora_id: corretora.id, cidade_id: cidadeId, nome: contato.nome },
            { onConflict: 'nome,cidade_id' }
          )
          .select()
          .single();

        if (!local) continue;

        if (contato.whatsapp && !contato.whatsappValido) whatsappParaConferir += 1;
        if (contato.extras.length > 0) {
          telefonesExtras.push(
            `${nome} (conselho ${crm || '—'}) — ${contato.nome}: ${contato.extras.join(', ')}`
          );
        }

        await supabase.from('profissional_locais').upsert({
          profissional_id: profissional.id,
          local_id: local.id,
          telefone: contato.telefone,
          whatsapp: contato.whatsapp,
          whatsapp_valido: contato.whatsappValido,
        });
      }
    }

    importados += 1;
    porTipo[tipoLinha] = (porTipo[tipoLinha] ?? 0) + 1;
    const chaveCidade = `${cidadeNome}/${cidadeUf}`;
    porCidade[chaveCidade] = (porCidade[chaveCidade] ?? 0) + 1;
  }

  if (descartados.length > 0) {
    writeFileSync(
      'descartados.csv',
      ['nome,crm,motivo', ...descartados.map((d) => `"${d.nome}","${d.crm}","${d.motivo}"`)].join('\n')
    );
  }
  if (revisaoEspecialidades.length > 0) {
    writeFileSync(
      'revisao-especialidades.csv',
      [
        'nome,crm,texto_original',
        ...revisaoEspecialidades.map((r) => `"${r.nome}","${r.crm}","${r.textoOriginal}"`),
      ].join('\n')
    );
  }
  if (telefonesExtras.length > 0) {
    writeFileSync('telefones-extras.csv', telefonesExtras.join('\n'));
  }

  console.log(`\n${importados} profissionais importados com sucesso`);
  console.log(`  por tipo: ${JSON.stringify(porTipo)}`);
  console.log(`  por cidade: ${JSON.stringify(porCidade)}`);
  console.log(
    `${descartados.length} profissionais descartados${descartados.length ? ' → ver descartados.csv' : ''}`
  );
  console.log(
    `${revisaoEspecialidades.length} casos de especialidade para revisão manual${
      revisaoEspecialidades.length ? ' → ver revisao-especialidades.csv' : ''
    }`
  );
  console.log(`${whatsappParaConferir} vínculos com whatsapp_valido = false para conferência`);
  if (telefonesExtras.length > 0) {
    console.log(`${telefonesExtras.length} telefones extras (mais de 1 por vínculo) → ver telefones-extras.csv`);
  }
}

if (!existsSync('.env.local')) {
  console.warn('Aviso: .env.local não encontrado — copie de .env.local.example e preencha as chaves.');
} else {
  config({ path: '.env.local', quiet: true });
}

main();
