import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ParceiroForm } from '@/components/admin/ParceiroForm';

export default async function NovoParceiroPage() {
  const supabase = await createClient();
  const { data: cidades } = await supabase.from('cidades').select('*').order('nome');

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/parceiros" className="text-xs text-blue-600 hover:underline">
          ← Voltar para parceiros
        </Link>
        <h1 className="mt-1 text-lg font-bold text-gray-900">Nova Empresa Parceira</h1>
      </div>
      <ParceiroForm cidades={cidades ?? []} />
    </div>
  );
}
