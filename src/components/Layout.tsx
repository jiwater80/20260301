import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: '대시보드' },
  { to: '/transactions', label: '거래내역' },
  { to: '/settings', label: '설정' },
]

export default function Layout() {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <header className="sticky top-0 z-10 bg-primary text-white shadow">
        <h1 className="text-lg font-semibold py-3 px-4 text-center">한-중 가계부</h1>
      </header>
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb">
        <ul className="flex justify-around py-2">
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-primary bg-primary/10' : 'text-slate-600 hover:text-primary'
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
