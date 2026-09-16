'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type AdminSidebarProps = {
  userName?: string;
  userEmail?: string;
};

type ItemMenu = {
  label: string;
  href: string;
  icone: (ativo: boolean) => React.ReactNode;
  subrotas?: string[];
};

export function AdminSidebar({ userName = 'Admin', userEmail = '' }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  const itens: ItemMenu[] = [
    {
      label: 'Profissionais',
      href: '/admin',
      subrotas: ['/admin/profissionais'],
      icone: (ativo) => (
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${ativo ? 'scale-110' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={ativo ? '2.5' : '2'}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      label: 'Beneficiários',
      href: '/admin/beneficiarios',
      icone: (ativo) => (
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${ativo ? 'scale-110' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={ativo ? '2.5' : '2'}
            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
          />
        </svg>
      ),
    },
    {
      label: 'Parceiros',
      href: '/admin/parceiros',
      icone: (ativo) => (
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${ativo ? 'scale-110' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={ativo ? '2.5' : '2'}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      label: 'Consultas / Logs',
      href: '/admin/logs',
      icone: (ativo) => (
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${ativo ? 'scale-110' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={ativo ? '2.5' : '2'}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      label: 'Locais',
      href: '/admin/locais/novo',
      subrotas: ['/admin/locais'],
      icone: (ativo) => (
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${ativo ? 'scale-110' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={ativo ? '2.5' : '2'}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={ativo ? '2.5' : '2'}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  function itemEstaAtivo(item: ItemMenu) {
    if (item.href === '/admin') {
      return pathname === '/admin' || pathname.startsWith('/admin/profissionais');
    }
    if (pathname === item.href) return true;
    if (item.subrotas && item.subrotas.some((s) => pathname.startsWith(s))) return true;
    return pathname.startsWith(item.href) && item.href !== '/admin';
  }

  const inicialNome = (userName?.trim().charAt(0) || userEmail?.charAt(0) || 'A').toUpperCase();

  return (
    <aside className="relative z-30 flex flex-col justify-between shrink-0 w-20 md:w-24 bg-[#071D36]/90 backdrop-blur-2xl border-r border-white/10 shadow-2xl select-none transition-all py-6 px-3">
      {/* Topo da Sidebar: Logo e Avatar */}
      <div className="flex flex-col items-center gap-6">
        {/* Logo C Consulte */}
        <Link
          href="/admin"
          title="Consulte Admin"
          className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-sky p-2 shadow-lg transition-transform duration-200 hover:scale-105"
        >
          <span className="font-black text-xl text-white tracking-tighter">C</span>
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        {/* Avatar do Usuário (sem sinal pulsante) */}
        <div className="relative group flex flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-sm shadow-md border border-white/20">
            {inicialNome}
          </div>
        </div>

        <div className="h-px w-8 bg-white/10" />

        {/* Navegação Vertical com Ícones e Efeito Ativo Idêntico ao Layout de Referência */}
        <nav className="flex flex-col items-center gap-3 w-full">
          {itens.map((item) => {
            const ativo = itemEstaAtivo(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ${
                  ativo
                    ? 'bg-white text-brand-navy shadow-xl scale-105 ring-2 ring-white/50'
                    : 'text-white/65 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icone(ativo)}

                {/* Tooltip Hover Lateral */}
                <span className="absolute left-full ml-3 hidden rounded-xl bg-slate-900/95 border border-white/10 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap shadow-xl backdrop-blur-md group-hover:block z-50">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Apenas Logout limpo */}
      <div className="flex flex-col items-center gap-3 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          title="Sair do Painel Admin"
          className="group relative flex h-11 w-11 items-center justify-center rounded-2xl text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 transition-all duration-200 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="absolute left-full ml-3 hidden rounded-xl bg-slate-900/95 border border-white/10 px-3 py-1.5 text-xs font-semibold text-rose-300 whitespace-nowrap shadow-xl backdrop-blur-md group-hover:block z-50">
            Encerrar Sessão
          </span>
        </button>
      </div>
    </aside>
  );
}
