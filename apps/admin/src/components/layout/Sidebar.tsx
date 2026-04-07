import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/blog', label: 'Blog' },
  { to: '/projects', label: 'Projects' },
  { to: '/contacts', label: 'Contacts' },
];

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-56 flex-shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col">
      <div className="p-5 border-b border-[var(--border)]">
        <span className="text-accent font-bold text-lg">Admin</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'block px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[var(--accent-glow)] text-accent font-medium'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-[var(--border)]">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => logout().catch(() => {})}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
