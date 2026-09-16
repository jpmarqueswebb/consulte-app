import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { linhas } = await req.json();

    if (!Array.isArray(linhas) || linhas.length === 0) {
      return NextResponse.json({ error: 'Nenhuma linha válida no CSV.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: corretora } = await supabase.from('corretoras').select('id').limit(1).single();
    if (!corretora) {
      return NextResponse.json({ error: 'Corretora não encontrada.' }, { status: 500 });
    }

    let importados = 0;
    const erros: string[] = [];

    for (const linha of linhas) {
      if (!linha.nome || !linha.cpf) continue;

      const cpfLimpo = linha.cpf.trim();
      const nomeLimpo = linha.nome.trim();
      const dataNasc = linha.data_nascimento?.trim() || '1990-01-01';
      const endereco = linha.endereco?.trim() || null;
      const status = linha.status?.trim()?.toLowerCase() === 'inativo' ? 'inativo' : 'ativo';

      const { error } = await supabase.from('beneficiarios').upsert(
        {
          corretora_id: corretora.id,
          nome: nomeLimpo,
          cpf: cpfLimpo,
          data_nascimento: dataNasc,
          endereco,
          status,
        },
        { onConflict: 'corretora_id, cpf' }
      );

      if (error) {
        erros.push(`Erro no CPF ${cpfLimpo}: ${error.message}`);
      } else {
        importados++;
      }
    }

    return NextResponse.json({ success: true, importados, erros });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
