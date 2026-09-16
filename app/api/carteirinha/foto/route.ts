import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get('id') as string;
    const tipo = formData.get('tipo') as 'titular' | 'dependente';
    const foto = formData.get('foto') as File | null;

    if (!id || !tipo || !foto) {
      return NextResponse.json({ error: 'Dados incompletos para envio da foto.' }, { status: 400 });
    }

    const supabase = await createClient();

    // Tentar upload para o Supabase Storage
    const ext = foto.name.split('.').pop() || 'jpg';
    const fileName = `${tipo}-${id}-${Date.now()}.${ext}`;
    const arrayBuffer = await foto.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fotoUrl: string | null = null;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fotos-carteirinhas')
      .upload(fileName, buffer, {
        contentType: foto.type || 'image/jpeg',
        upsert: true,
      });

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from('fotos-carteirinhas')
        .getPublicUrl(fileName);
      fotoUrl = publicUrlData.publicUrl;
    } else {
      // Fallback: se o bucket não estiver criado ainda no Supabase, salvar como base64
      fotoUrl = `data:${foto.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    }

    // Atualizar registro no banco
    if (tipo === 'titular') {
      const { error: updateError } = await supabase
        .from('beneficiarios')
        .update({ foto_url: fotoUrl, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      const { error: updateError } = await supabase
        .from('beneficiarios_dependentes')
        .update({ foto_url: fotoUrl, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, foto_url: fotoUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno ao salvar foto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
