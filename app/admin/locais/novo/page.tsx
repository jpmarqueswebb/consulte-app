import { createClient } from '@/lib/supabase/server';
import { LocalForm } from '@/components/admin/LocalForm';

export default async function NovoLocalPage() {
  const supabase = await createClient();

  const [{ data: cidades }, {
    data: { user },
  }] = await Promise.all([supabase.from('cidades').select('*').order('nome'), supabase.auth.getUser()]);

  const { data: adminUser } = user
    ? await supabase.from('admin_users').select('corretora_id').eq('id', user.id).single()
    : { data: null };

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-gray-900">Novo local</h1>
      <LocalForm cidades={cidades ?? []} corretoraId={adminUser?.corretora_id ?? ''} />
    </div>
  );
}
