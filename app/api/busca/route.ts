import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buscarPorTermo } from '@/lib/busca';
import type { TipoProfissional } from '@/types/database';

export async function GET(request: NextRequest) {
  const termo = request.nextUrl.searchParams.get('q') ?? '';
  const tipoParam = request.nextUrl.searchParams.get('tipo');
  const tipo: TipoProfissional | undefined =
    tipoParam === 'medico' || tipoParam === 'dentista' ? tipoParam : undefined;

  if (!termo.trim()) {
    return NextResponse.json({ especialidade: null, profissionais: [] });
  }

  const supabase = await createClient();
  const resultado = await buscarPorTermo(supabase, termo, { tipo });

  return NextResponse.json(resultado);
}
