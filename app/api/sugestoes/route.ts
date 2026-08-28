import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sugerirEspecialidades } from '@/lib/busca';
import type { TipoProfissional } from '@/types/database';

export async function GET(request: NextRequest) {
  const termo = request.nextUrl.searchParams.get('q') ?? '';
  const tipoParam = request.nextUrl.searchParams.get('tipo');
  const tipo: TipoProfissional | undefined =
    tipoParam === 'medico' || tipoParam === 'dentista' ? tipoParam : undefined;

  if (!termo.trim()) {
    return NextResponse.json({ especialidades: [] });
  }

  const supabase = await createClient();
  const especialidades = await sugerirEspecialidades(supabase, termo, 6, tipo);

  return NextResponse.json({ especialidades });
}
