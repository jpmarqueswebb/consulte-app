import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /admin/login é tratado sem a sidebar do painel
  if (!user) {
    return <>{children}</>;
  }

  // Busca o nome do admin na tabela admin_users se existir
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('nome')
    .eq('id', user.id)
    .maybeSingle();

  const userName = adminUser?.nome || user.email?.split('@')[0] || 'Admin';

  return (
    <div className="relative min-h-screen bg-brand-navy text-white flex overflow-x-hidden">
      {/* Imagem de Fundo Oficial da Marca Consulte */}
      <div
        className="fixed inset-0 bg-cover bg-center md:hidden pointer-events-none opacity-30"
        style={{ backgroundImage: 'url(/FUNDO%20SEM%20TEXTO%20MOBILE.png)' }}
      />
      <div
        className="fixed inset-0 hidden bg-cover bg-center md:block pointer-events-none opacity-30"
        style={{ backgroundImage: 'url(/FUNDO%20SEM%20TEXTO.png)' }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-brand-navy/80 via-brand-navy/90 to-brand-navy pointer-events-none" />

      {/* Sidebar Lateral no estilo da imagem de referência */}
      <AdminSidebar userName={userName} userEmail={user.email} />

      {/* Área de Conteúdo Principal */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 lg:p-10">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
