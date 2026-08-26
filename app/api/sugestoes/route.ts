import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sugerirEspecialidades } from '@/lib/busca';

export async function GET(request: NextRequest) {
  const termo = request.nextUrl.searchParams.get('q') ?? '';

  if (!termo.trim()) {
    return NextResponse.json({ especialidades: [] });
  }

  const supabase = await createClient();
  const especialidades = await sugerirEspecialidades(supabase, termo);

  return NextResponse.json({ especialidades });
}
