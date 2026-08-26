import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buscarPorTermo } from '@/lib/busca';

export async function GET(request: NextRequest) {
  const termo = request.nextUrl.searchParams.get('q') ?? '';

  if (!termo.trim()) {
    return NextResponse.json({ especialidade: null, profissionais: [] });
  }

  const supabase = await createClient();
  const resultado = await buscarPorTermo(supabase, termo);

  return NextResponse.json(resultado);
}
