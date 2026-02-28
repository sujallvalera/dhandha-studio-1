import React, { useState, useEffect } from 'react';

const MOCK_USERS = [
  { userId: 'usr_a1b2c3', name: 'Aryan Kumar', role: 'admin', credits: 150, email: 'aryan@dhandha.studio' },
  { userId: 'usr_d4e5f6', name: 'Priya Sharma', role: 'user', credits: 42, email: 'priya@example.com' },
  { userId: 'usr_g7h8i9', name: 'Rahul Verma', role: 'user', credits: 88, email: 'rahul@example.com' },
  { userId: 'usr_j0k1l2', name: 'Ananya Desai', role: 'user', credits: 15, email: 'ananya@example.com' },
  { userId: 'usr_m3n4o5', name: 'Vikram Singh', role: 'client', credits: 500, email: 'vikram@enterprise.co' },
  { userId: 'usr_p6q7r8', name: 'Sneha Patil', role: 'user', credits: 0, email: 'sneha@example.com' },
  { userId: 'usr_s9t0u1', name: 'Karan Mehta', role: 'client', credits: 1200, email: 'karan@bigbrand.in' },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${localStorage.getItem('ds_api_key') || ''}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((res) => setUsers(res.data || []))
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? users.filter((u) => u.role === filter) : users;
  const roleCounts = { all: users.length, admin: 0, user: 0, client: 0 };
  users.forEach((u) => { if (u.role in roleCounts) roleCounts[u.role]++; });

  const handleAdjust = (userId) => {
    const amount = prompt('Credit adjustment amount (positive to add, negative to deduct):');
    if (amount && !isNaN(amount)) {
      alert(`Would adjust ${amount} credits for ${userId} (requires backend)`);
    }
  };

  if (loading) return <div className="loading-page"><span className="spinner" /> Loading users...</div>;

  return (
    <div>
      <h1 className="page-title">User Management</h1>
      <p className="page-desc">Manage platform users, adjust credits, and view account details.</p>

      {/* Role filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['', 'All'], ['admin', 'Admins'], ['user', 'Users'], ['client', 'Clients']].map(([val, label]) => (
          <button key={val} className={`btn btn-sm ${filter === val ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(val)}>
            {label} ({val ? roleCounts[val] : roleCounts.all})
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Credits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.userId}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.userId}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name || '—'}</td>
                  <td>{u.email || '—'}</td>
                  <td>
                    <span className={`badge ${
                      u.role === 'admin' ? 'badge-danger' :
                      u.role === 'client' ? 'badge-warning' : 'badge-accent'
                    }`}>{u.role}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: u.credits > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {u.credits}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => handleAdjust(u.userId)}>
                      Adjust Credits
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
