import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * DashboardLayout — Shared shell for all three dashboards.
 * 
 * @param {object} props
 * @param {'admin'|'user'|'client'} props.role        Current dashboard role
 * @param {string} props.pageTitle                     Title shown in the top bar
 * @param {React.ReactNode} props.children             Page content
 * @param {function} props.onRoleChange                Callback when role is changed
 */
export default function DashboardLayout({ role, pageTitle, children, onRoleChange }) {
  const navItems = getNavItems(role);
  const roleMeta = getRoleMeta(role);

  return (
    <div className="layout">
      {/* ── SIDEBAR ──────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">Dhandha Studio</div>
          <div className="sidebar-subtitle">{roleMeta.subtitle}</div>
        </div>

        {/* Role Switcher */}
        <div className="sidebar-section">
          <div className="sidebar-section-label">Dashboard</div>
          <div className="role-switcher" style={{ margin: '0 4px' }}>
            {['admin', 'user', 'client'].map((r) => (
              <button
                key={r}
                className={`role-btn ${role === r ? 'active' : ''}`}
                onClick={() => onRoleChange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-section">
          <div className="sidebar-section-label">{roleMeta.sectionLabel}</div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                end={item.end}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            v2.0 · KIE Pipeline
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────── */}
      <div className="main">
        <header className="top-bar">
          <div className="top-bar-title">{pageTitle}</div>
          <div className="top-bar-actions">
            <span className="badge badge-accent">{roleMeta.label}</span>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function getRoleMeta(role) {
  const meta = {
    admin: { label: 'Admin', subtitle: 'Platform Admin', sectionLabel: 'Management' },
    user:  { label: 'User', subtitle: 'AI Photoshoot', sectionLabel: 'Studio' },
    client: { label: 'API Client', subtitle: 'Enterprise API', sectionLabel: 'Developer' },
  };
  return meta[role] || meta.user;
}

function getNavItems(role) {
  const items = {
    admin: [
      { to: '/admin',          icon: '📊', label: 'Analytics',  end: true },
      { to: '/admin/users',    icon: '👥', label: 'Users' },
      { to: '/admin/clients',  icon: '🏢', label: 'API Clients' },
      { to: '/admin/refunds',  icon: '💸', label: 'Refunds' },
      { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
    ],
    user: [
      { to: '/user',          icon: '📸', label: 'Upload',   end: true },
      { to: '/user/history',  icon: '🗂️', label: 'History' },
      { to: '/user/credits',  icon: '💳', label: 'Credits' },
      { to: '/user/profile',  icon: '👤', label: 'Profile' },
    ],
    client: [
      { to: '/client',           icon: '🔑', label: 'API Keys', end: true },
      { to: '/client/analytics', icon: '📈', label: 'Analytics' },
      { to: '/client/billing',   icon: '💰', label: 'Billing' },
      { to: '/client/assets',    icon: '🖼️', label: 'Assets' },
      { to: '/client/docs',      icon: '📖', label: 'Documentation' },
    ],
  };
  return items[role] || items.user;
}
