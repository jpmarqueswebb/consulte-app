import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { titular, dependentes } = await req.json();

    if (!titular?.nome || !titular?.cpf || !titular?.data_nascimento) {
      return NextResponse.json({ error: 'Dados do titular incompletos.' }, { status: 400 });
    }

    const supabase = await createClient();

    // Obter corretora
    const { data: corretora } = await supabase.from('corretoras').select('id').limit(1).single();
    if (!corretora) {
      return NextResponse.json({ error: 'Nenhuma corretora cadastrada.' }, { status: 500 });
    }

    // Inserir titular
    const { data: titularSalvo, error: erroTitular } = await supabase
      .from('beneficiarios')
      .insert({
        corretora_id: corretora.id,
        nome: titular.nome,
        cpf: titular.cpf,
        data_nascimento: titular.data_nascimento,
        endereco: titular.endereco || null,
        status: titular.status || 'ativo',
      })
      .select()
      .single();

    if (erroTitular) {
      return NextResponse.json({ error: erroTitular.message }, { status: 400 });
    }

    // Inserir dependentes (se houver, até 4)
    if (dependentes && Array.isArray(dependentes) && dependentes.length > 0) {
      const depParaSalvar = dependentes.slice(0, 4).map((d: any) => ({
        titular_id: titularSalvo.id,
        nome: d.nome,
        cpf: d.cpf || null,
        data_nascimento: d.data_nascimento,
        parentesco: d.parentesco || 'Dependente',
        endereco: titular.endereco || null,
      }));

      const { error: erroDep } = await supabase
        .from('beneficiarios_dependentes')
        .insert(depParaSalvar);

      if (erroDep) {
        return NextResponse.json({ error: `Titular salvo, mas erro nos dependentes: ${erroDep.message}` }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, titular: titularSalvo });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
