import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function limparCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const { slug, termo } = await req.json();

    if (!slug || !termo) {
      return NextResponse.json({ error: 'Parceiro e termo de busca são obrigatórios.' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Identificar o parceiro pelo slug
    const { data: parceiro, error: parceiroError } = await supabase
      .from('parceiros_beneficios')
      .select('*')
      .eq('slug', slug)
      .eq('ativo', true)
      .maybeSingle();

    if (parceiroError || !parceiro) {
      return NextResponse.json({ error: 'Empresa parceira não encontrada ou inativa.' }, { status: 404 });
    }

    const termoLimpo = termo.trim();
    const termoNumeros = limparCpf(termoLimpo);
    const buscaPorCpf = termoNumeros.length >= 11;

    // 2. Buscar como Titular
    const { data: todosTitulares } = await supabase.from('beneficiarios').select('*');

    const titularEncontrado = todosTitulares?.find((b) => {
      if (buscaPorCpf) {
        return limparCpf(b.cpf) === termoNumeros;
      }
      return b.nome.toLowerCase().includes(termoLimpo.toLowerCase());
    });

    if (titularEncontrado) {
      const statusFinal = titularEncontrado.status === 'ativo' ? 'ativo' : 'inativo';

      // Registrar log da consulta
      await supabase.from('consultas_parceiros_log').insert({
        parceiro_id: parceiro.id,
        termo_buscado: termoLimpo,
        status_resultado: statusFinal,
        titular_id: titularEncontrado.id,
      });

      return NextResponse.json({
        resultado: statusFinal,
        cliente: {
          id: titularEncontrado.id,
          nome: titularEncontrado.nome,
          cpf: titularEncontrado.cpf,
          tipo: 'Titular',
          foto_url: titularEncontrado.foto_url,
          status: titularEncontrado.status,
        },
      });
    }

    // 3. Buscar como Dependente
    const { data: todosDependentes } = await supabase.from('beneficiarios_dependentes').select('*');

    const dependenteEncontrado = todosDependentes?.find((d) => {
      if (buscaPorCpf && d.cpf) {
        return limparCpf(d.cpf) === termoNumeros;
      }
      return d.nome.toLowerCase().includes(termoLimpo.toLowerCase());
    });

    if (dependenteEncontrado) {
      // Buscar titular pai para verificar status
      const { data: titularPai } = await supabase
        .from('beneficiarios')
        .select('*')
        .eq('id', dependenteEncontrado.titular_id)
        .maybeSingle();

      const statusFinal = titularPai?.status === 'ativo' ? 'ativo' : 'inativo';

      // Registrar log da consulta
      await supabase.from('consultas_parceiros_log').insert({
        parceiro_id: parceiro.id,
        termo_buscado: termoLimpo,
        status_resultado: statusFinal,
        titular_id: titularPai?.id || null,
        dependente_id: dependenteEncontrado.id,
      });

      return NextResponse.json({
        resultado: statusFinal,
        cliente: {
          id: dependenteEncontrado.id,
          nome: dependenteEncontrado.nome,
          cpf: dependenteEncontrado.cpf || 'Não informado',
          tipo: `Dependente (${dependenteEncontrado.parentesco})`,
          titular_nome: titularPai?.nome || 'Titular',
          foto_url: dependenteEncontrado.foto_url,
          status: statusFinal,
        },
      });
    }

    // 4. Não encontrado
    await supabase.from('consultas_parceiros_log').insert({
      parceiro_id: parceiro.id,
      termo_buscado: termoLimpo,
      status_resultado: 'nao_encontrado',
    });

    return NextResponse.json({
      resultado: 'nao_encontrado',
      mensagem: 'Nenhum cliente ou dependente localizado com este CPF ou Nome.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno na validação.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
