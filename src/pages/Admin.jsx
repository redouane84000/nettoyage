import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const SESSION_KEY = 'fc-admin-session';

const Admin = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [creds, setCreds] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = async (username, password) => {
    if (!supabase) {
      toast.error('Connexion admin indisponible.');
      return false;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_fast_clean_messages', {
      p_user: username,
      p_pass: password,
    });
    setLoading(false);
    if (error) {
      toast.error('Identifiants incorrects.');
      return false;
    }
    setMessages(data || []);
    return true;
  };

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.user && saved?.pass) {
        setCreds(saved);
        loadMessages(saved.user, saved.pass);
      }
    } catch {
      /* session illisible */
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const ok = await loadMessages(user.trim(), pass);
    if (!ok) return;
    const next = { user: user.trim(), pass };
    setCreds(next);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* rien */ }
  };

  const logout = () => {
    setCreds(null);
    setMessages([]);
    setPass('');
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* rien */ }
  };

  const fmt = (iso) => {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  if (!creds) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold text-primary mb-2">Administration</h1>
          <p className="text-gray-600 mb-8">Messages reçus depuis le formulaire Contact.</p>
          <form onSubmit={handleLogin} className="card space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Identifiant</label>
              <input
                className="field"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Mot de passe</label>
              <input
                type="password"
                className="field"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? 'Connexion…' : 'Connexion'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Messages</h1>
            <p className="text-gray-600 mt-1">{messages.length} demande{messages.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => loadMessages(creds.user, creds.pass)}
              disabled={loading}
            >
              Actualiser
            </button>
            <button type="button" className="btn-secondary" onClick={logout}>
              Déconnexion
            </button>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="card text-gray-600">Aucun message pour le moment.</div>
        ) : (
          <ul className="space-y-4">
            {messages.map((m) => (
              <li key={m.id} className="card">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <strong className="text-primary text-lg">{m.prenom} {m.nom}</strong>
                  <span className="text-sm text-slate-500">{fmt(m.created_at)}</span>
                </div>
                <p className="text-sm text-slate-600 mb-1">
                  <a className="hover:text-primary" href={`mailto:${m.email}`}>{m.email}</a>
                  {' · '}
                  <a className="hover:text-primary" href={`tel:${m.mobile}`}>{m.mobile}</a>
                </p>
                <p className="text-gray-700 whitespace-pre-wrap">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Admin;
