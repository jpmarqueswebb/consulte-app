import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const dados = await req.json();

    if (!dados.nome || !dados.slug || !dados.desconto_descricao || !dados.cidade_id) {
      return NextResponse.json({ error: 'Campos obrigatórios não informados.' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: corretora } = await supabase.from('corretoras').select('id').limit(1).single();
    if (!corretora) {
      return NextResponse.json({ error: 'Nenhuma corretora encontrada.' }, { status: 500 });
    }

    const { data: parceiro, error } = await supabase
      .from('parceiros_beneficios')
      .insert({
        corretora_id: corretora.id,
        cidade_id: dados.cidade_id,
        nome: dados.nome,
        slug: dados.slug,
        categoria: dados.categoria,
        desconto_descricao: dados.desconto_descricao,
        telefone: dados.telefone || null,
        whatsapp: dados.whatsapp || null,
        endereco: dados.endereco || null,
        ativo: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, parceiro });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
