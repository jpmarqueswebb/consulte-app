import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function limparCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cpfParam = searchParams.get('cpf');

  if (!cpfParam) {
    return NextResponse.json({ error: 'Informe o CPF para consulta.' }, { status: 400 });
  }

  const cpfNumeros = limparCpf(cpfParam);
  if (cpfNumeros.length < 11) {
    return NextResponse.json({ error: 'CPF inválido.' }, { status: 400 });
  }

  const supabase = await createClient();

  // 1. Tentar encontrar como Titular (buscando formato exato ou somente números)
  const { data: titulares } = await supabase
    .from('beneficiarios')
    .select('*');

  // Filtra em memória para ser tolerante a formatos com ou sem pontuação gravados no banco
  const titularEncontrado = titulares?.find(
    (b) => limparCpf(b.cpf) === cpfNumeros
  );

  if (titularEncontrado) {
    // Buscar dependentes vinculados
    const { data: dependentes } = await supabase
      .from('beneficiarios_dependentes')
      .select('*')
      .eq('titular_id', titularEncontrado.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      tipo_encontrado: 'titular',
      titular: titularEncontrado,
      dependentes: dependentes || [],
    });
  }

  // 2. Tentar encontrar como Dependente
  const { data: todosDependentes } = await supabase
    .from('beneficiarios_dependentes')
    .select('*');

  const dependenteEncontrado = todosDependentes?.find(
    (d) => d.cpf && limparCpf(d.cpf) === cpfNumeros
  );

  if (dependenteEncontrado) {
    // Buscar o titular dele
    const { data: titularPai } = await supabase
      .from('beneficiarios')
      .select('*')
      .eq('id', dependenteEncontrado.titular_id)
      .maybeSingle();

    if (titularPai) {
      // Buscar todos os dependentes desse titular
      const { data: dependentesFamilia } = await supabase
        .from('beneficiarios_dependentes')
        .select('*')
        .eq('titular_id', titularPai.id)
        .order('created_at', { ascending: true });

      return NextResponse.json({
        tipo_encontrado: 'dependente',
        dependente_direto: dependenteEncontrado,
        titular: titularPai,
        dependentes: dependentesFamilia || [],
      });
    }
  }

  return NextResponse.json(
    { error: 'Nenhum beneficiário ativo encontrado para este CPF.' },
    { status: 404 }
  );
}
