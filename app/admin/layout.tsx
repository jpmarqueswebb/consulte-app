import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './LogoutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /admin/login não passa por aqui com usuário autenticado (o middleware redireciona antes),
  // mas sem usuário também é rota pública dentro de /admin — não renderiza a barra de admin.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <nav className="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
            <Link href="/admin" className="hover:text-blue-600">Profissionais</Link>
            <Link href="/admin/beneficiarios" className="hover:text-blue-600">Beneficiários</Link>
            <Link href="/admin/parceiros" className="hover:text-blue-600">Empresas Parceiras</Link>
            <Link href="/admin/logs" className="hover:text-blue-600">Consultas dos Parceiros</Link>
            <Link href="/admin/locais/novo" className="hover:text-blue-600">Novo local</Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-6">{children}</div>
    </div>
  );
}
