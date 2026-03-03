import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: '대시보드' },
  { to: '/transactions', label: '거래내역' },
  { to: '/settings', label: '설정' },
]

export default function Layout() {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50/80">
      <header className="sticky top-0 z-10 bg-primary text-white shadow-header">
        <div className="max-w-lg mx-auto px-4 py-3.5">
          <h1 className="text-lg font-semibold tracking-tight text-center">한-중 가계부</h1>
          <p className="text-xs text-white/80 text-center mt-0.5">전일 기준 환율 · 한국돈 환산</p>
        </div>
      </header>
      <main className="flex-1 overflow-auto pb-24 max-w-lg mx-auto w-full">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-t border-slate-200/80 safe-area-pb shadow-[0_-2px_10px_-2px_rgba(0,0,0,0.06)]">
        <ul className="flex justify-around items-center max-w-lg mx-auto h-14">
          {navItems.map(({ to, label }) => (
            <li key={to} className="flex-1 flex justify-center">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center justify-center w-full h-full text-sm font-medium transition-colors rounded-lg mx-1 ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-slate-500 hover:text-slate-700'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
