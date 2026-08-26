/**
 * Script de importação/limpeza da planilha de profissionais (Consulte / Ariádne).
 * Roda uma vez, manualmente: `npx tsx scripts/importar-planilha.ts caminho/para/planilha.csv`
 *
 * Requer SUPABASE_SERVICE_ROLE_KEY em .env.local (ignora RLS — nunca usar essa chave no app).
 *
 * Dicionários abaixo (NORMALIZACAO_ESPECIALIDADE, EXCECOES_SEPARADOR_E) foram construídos
 * a partir dos valores únicos reais de "COMEDI CORPO CLÍNICO - 20.04.2026 - Layout.csv"
 * (68 profissionais). Se a planilha for atualizada com novas especialidades ou clínicas,
 * rode primeiro com --inspecionar para levantar os valores novos antes de reimportar.
 */

import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const CIDADE_PADRAO = 'Itabirito';
const CORRETORA_SLUG = 'ariadne';

// Chave = como aparece na planilha, normalizado (minúsculo, sem acento) → valor = nome_normalizado final.
const NORMALIZACAO_ESPECIALIDADE: Record<string, string> = {
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
};

// Nomes de especialidade que contêm a palavra "e" no meio e NÃO devem ser separados
// (levantados manualmente a partir dos valores únicos reais da planilha).
const EXCECOES_SEPARADOR_E: string[] = [
  'ortopedia e traumatologia',
  'ginecologia e obstetricia',
  'diagnostico por imagem e ultrassonografia geral',
  'endocrinologia e metabologia',
  'cirurgia geral/trauma e aparelho digestivo',
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
 * Separa múltiplas especialidades de um campo bruto, respeitando a lista de exceções
 * (nomes compostos que contêm "e" mas são UMA especialidade só). Primeiro checa o campo
 * inteiro contra as exceções (cobre casos como "Cirurgia geral/Trauma e aparelho digestivo",
 * que usa "/" como parte do próprio nome). Se não bater, separa por "/" e depois, dentro de
 * cada parte, por "," ou "e" isolado — checando as exceções de novo em cada parte, pra
 * casos como "Ginecologia e obstetrícia / Clinica medica".
 */
function separarEspecialidades(bruto: string): string[] {
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
  const caminhoCsv = process.argv[2];
  if (!caminhoCsv) {
    console.error('Uso: npx tsx scripts/importar-planilha.ts caminho/para/planilha.csv');
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em .env.local');
    process.exit(1);
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

  const csvBruto = readFileSync(caminhoCsv, 'utf-8');
  const linhas: Record<string, string>[] = parse(csvBruto, {
    columns: true,
    skip_empty_lines: true,
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

  if (process.argv.includes('--inspecionar')) {
    const valoresUnicos = new Set(linhas.map((l) => l['ESPECIALIDADE'] ?? ''));
    console.log('Valores únicos de especialidade encontrados na planilha:');
    console.log([...valoresUnicos].sort().join('\n'));
    console.log(
      '\nUse essa lista para preencher NORMALIZACAO_ESPECIALIDADE e EXCECOES_SEPARADOR_E antes de rodar sem --inspecionar.'
    );
    return;
  }

  const { data: corretora } = await supabase
    .from('corretoras')
    .select('id')
    .eq('slug', CORRETORA_SLUG)
    .single();
  if (!corretora) {
    console.error(`Corretora "${CORRETORA_SLUG}" não encontrada — rode supabase/seed.sql primeiro.`);
    process.exit(1);
  }

  const { data: cidade } = await supabase
    .from('cidades')
    .select('id')
    .eq('nome', CIDADE_PADRAO)
    .single();
  if (!cidade) {
    console.error(`Cidade "${CIDADE_PADRAO}" não encontrada — rode supabase/seed.sql primeiro.`);
    process.exit(1);
  }

  const descartados: Descarte[] = [];
  const revisaoEspecialidades: RevisaoEspecialidade[] = [];
  const telefonesExtras: string[] = [];
  let importados = 0;
  let whatsappParaConferir = 0;

  for (const linha of linhas) {
    const nome = (linha['NOME COMPLETO'] ?? '').trim();
    const crm = (linha['Nº CONSELHO'] ?? '').trim();
    const uf = (linha['UF CONSELHO'] ?? 'MG').trim() || 'MG';
    const especialidadeBruta = (linha['ESPECIALIDADE'] ?? '').trim();
    const localBruto = (linha['ATENDE EM QUAL CLÍNICA ?'] ?? '').trim();

    if (!nome || !crm) {
      descartados.push({ nome, crm, motivo: 'nome ou CRM ausente' });
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

    const { data: profissional, error: erroProfissional } = await supabase
      .from('profissionais')
      .upsert(
        {
          corretora_id: corretora.id,
          nome,
          crm,
          uf_crm: uf,
          situacao: situacao === 'inativo' ? 'inativo' : 'ativo',
          situacao_observacao: situacao === 'inativo' ? observacao : null,
        },
        { onConflict: 'crm,uf_crm,corretora_id' }
      )
      .select()
      .single();

    if (erroProfissional || !profissional) {
      descartados.push({ nome, crm, motivo: `erro ao gravar profissional: ${erroProfissional?.message}` });
      continue;
    }

    for (const nomeEspecialidade of especialidades) {
      const nomeFinal = NORMALIZACAO_ESPECIALIDADE[normalizar(nomeEspecialidade)] ?? nomeEspecialidade.trim();

      const { data: especialidade } = await supabase
        .from('especialidades')
        .upsert({ nome_normalizado: nomeFinal }, { onConflict: 'nome_normalizado' })
        .select()
        .single();

      if (especialidade) {
        await supabase
          .from('profissional_especialidades')
          .upsert({ profissional_id: profissional.id, especialidade_id: especialidade.id });
      }
    }

    if (situacao === 'ativo' && localBruto) {
      for (const contato of extrairLocais(localBruto, nome)) {
        if (!contato.nome) continue;

        const { data: local } = await supabase
          .from('locais')
          .upsert(
            { corretora_id: corretora.id, cidade_id: cidade.id, nome: contato.nome },
            { onConflict: 'nome,cidade_id' }
          )
          .select()
          .single();

        if (!local) continue;

        if (contato.whatsapp && !contato.whatsappValido) whatsappParaConferir += 1;
        if (contato.extras.length > 0) {
          telefonesExtras.push(
            `${nome} (CRM ${crm}) — ${contato.nome}: ${contato.extras.join(', ')}`
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
