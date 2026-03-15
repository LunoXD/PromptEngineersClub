import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Shield, Users, Server, LayoutDashboard, Newspaper, FolderKanban, UserCog, CalendarDays } from 'lucide-react';
import {
  api,
  AdminManagedServer,
  AdminManagedUser,
  HomeContent,
  Plan,
  Project,
  TeamMember,
} from '../lib/api';

const TOKEN_KEY = 'admin_token';

const emptyProject: Partial<Project> = {
  title: '',
  description: '',
  image: '',
  link: '',
  repoUrl: '',
  tags: [],
  status: 'Planning',
};

const emptyMember: Partial<TeamMember> = {
  name: '',
  role: '',
  bio: '',
  image: '',
  linkedin: '',
  github: '',
  email: '',
  order: 0,
};

const emptyPlan: Partial<Plan> = {
  title: '',
  type: '',
  attendees: 0,
  description: '',
  category: 'upcoming',
  order: 0,
};

function parseCommaList(value: string) {
  return value
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

export function Admin() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [servers, setServers] = useState<AdminManagedServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState('');
  const [accessUserId, setAccessUserId] = useState('');
  const [activeSection, setActiveSection] = useState<
    'overview' | 'home' | 'projects' | 'team' | 'plans' | 'users' | 'servers'
  >('overview');
  const [home, setHome] = useState<HomeContent>({
    heroBadge: '',
    heroDescription: '',
    stats: [],
    features: [],
  });
  const [newProject, setNewProject] = useState<Partial<Project>>(emptyProject);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>(emptyMember);
  const [newPlan, setNewPlan] = useState<Partial<Plan>>(emptyPlan);

  const panelClass = 'space-y-4 rounded-2xl border border-border p-5 bg-card/70 text-foreground';
  const inputClass = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground';
  const primaryButtonClass = 'rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed';
  const ghostButtonClass = 'rounded-lg border border-border bg-background/30 px-3 py-2 text-sm hover:bg-accent/60';

  const loggedIn = useMemo(() => Boolean(token), [token]);
  const selectedServer = useMemo(
    () => servers.find((server) => server._id === selectedServerId) || null,
    [servers, selectedServerId]
  );
  const usersWithoutAccess = useMemo(() => {
    if (!selectedServer) return users;
    const memberIds = new Set((selectedServer.members || []).map((member) => member._id));
    return users.filter((user) => !memberIds.has(user._id));
  }, [selectedServer, users]);
  const totalServerMembers = useMemo(
    () => servers.reduce((acc, server) => acc + (server.memberCount || 0), 0),
    [servers]
  );

  const loadAll = async () => {
    const [projectsData, teamData, homeData, plansData, usersData, serversData] = await Promise.all([
      api.getProjects(),
      api.getTeam(),
      api.getHomeContent(),
      api.getPlans(),
      api.getAdminUsers(token),
      api.getAdminServers(token),
    ]);
    setProjects(projectsData);
    setTeam(teamData);
    setHome(homeData);
    setPlans(plansData);
    setUsers(usersData);
    setServers(serversData);
    if (serversData.length > 0) {
      setSelectedServerId((current) =>
        current && serversData.some((server) => server._id === current)
          ? current
          : serversData[0]._id
      );
    } else {
      setSelectedServerId('');
    }
  };

  useEffect(() => {
    if (!loggedIn) return;
    api.verifyAdmin(token)
      .then(async () => loadAll())
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken('');
      });
  }, [loggedIn, token]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const result = await api.adminLogin(normalizedEmail, password);
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
  };

  const saveHome = async () => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const updated = await api.updateHomeContent(home, token);
      setHome(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update content');
    } finally {
      setBusy(false);
    }
  };

  const createProject = async () => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.createProject(newProject, token);
      setNewProject(emptyProject);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setBusy(false);
    }
  };

  const updateProject = async (item: Project) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.updateProject(item._id, item, token);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setBusy(false);
    }
  };

  const removeProject = async (id: string) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.deleteProject(id, token);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setBusy(false);
    }
  };

  const createTeamMember = async () => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.createTeamMember(newMember, token);
      setNewMember(emptyMember);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member');
    } finally {
      setBusy(false);
    }
  };

  const updateTeamMember = async (item: TeamMember) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.updateTeamMember(item._id, item, token);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team member');
    } finally {
      setBusy(false);
    }
  };

  const removeTeamMember = async (id: string) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.deleteTeamMember(id, token);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
    } finally {
      setBusy(false);
    }
  };

  const createPlan = async () => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.createPlan(newPlan, token);
      setNewPlan(emptyPlan);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add plan');
    } finally {
      setBusy(false);
    }
  };

  const updatePlan = async (item: Plan) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.updatePlan(item._id, item, token);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan');
    } finally {
      setBusy(false);
    }
  };

  const removePlan = async (id: string) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.deletePlan(id, token);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove plan');
    } finally {
      setBusy(false);
    }
  };

  const updateUserRole = async (id: string, role: 'admin' | 'user') => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.updateAdminUserRole(id, role, token);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setBusy(false);
    }
  };

  const removeUser = async (id: string) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.deleteAdminUser(id, token);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setBusy(false);
    }
  };

  const grantServerAccess = async () => {
    if (!token || !selectedServerId || !accessUserId) return;
    setBusy(true);
    setError('');
    try {
      await api.setAdminServerAccess(selectedServerId, accessUserId, 'grant', token);
      setAccessUserId('');
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant server access');
    } finally {
      setBusy(false);
    }
  };

  const revokeServerAccess = async (userId: string) => {
    if (!token || !selectedServerId || !userId) return;
    setBusy(true);
    setError('');
    try {
      await api.setAdminServerAccess(selectedServerId, userId, 'revoke', token);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke server access');
    } finally {
      setBusy(false);
    }
  };

  const removeServer = async (serverId: string) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.deleteAdminServer(serverId, token);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete server');
    } finally {
      setBusy(false);
    }
  };

  const uploadImage = async (file: File, cb: (url: string) => void) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const result = await api.uploadImage(file, token);
      cb(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground mb-4">
            <Shield size={14} />
            Secure Admin Access
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in with your administrator credentials to manage content, servers, and user access.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button
            type="submit"
            disabled={busy}
            className={`${primaryButtonClass} w-full`}
          >
            {busy ? 'Signing in...' : 'Login'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
        </div>
      </div>
    );
  }

  const navItems: Array<{ key: typeof activeSection; label: string; icon: typeof Shield }> = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'home', label: 'Homepage', icon: Newspaper },
    { key: 'projects', label: 'Projects', icon: FolderKanban },
    { key: 'team', label: 'Team', icon: Users },
    { key: 'plans', label: 'Plans', icon: CalendarDays },
    { key: 'users', label: 'Users', icon: UserCog },
    { key: 'servers', label: 'Servers', icon: Server },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <div className="rounded-3xl border border-border bg-card/70 p-5 md:p-6">
        <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-1">Administration</p>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <button onClick={logout} className="rounded-lg border border-white/20 px-4 py-2">
          Logout
        </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border bg-background/50 hover:bg-accent/70'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {activeSection === 'overview' && (
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <article className="rounded-2xl border border-border bg-card/70 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Users</p>
            <p className="text-2xl font-semibold mt-2">{users.length}</p>
          </article>
          <article className="rounded-2xl border border-border bg-card/70 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Servers</p>
            <p className="text-2xl font-semibold mt-2">{servers.length}</p>
          </article>
          <article className="rounded-2xl border border-border bg-card/70 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Server Memberships</p>
            <p className="text-2xl font-semibold mt-2">{totalServerMembers}</p>
          </article>
          <article className="rounded-2xl border border-border bg-card/70 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Projects</p>
            <p className="text-2xl font-semibold mt-2">{projects.length}</p>
          </article>
        </section>
      )}

      {activeSection === 'home' && (
      <section className={panelClass}>
        <h2 className="text-xl font-semibold">Homepage Content</h2>
        <input
          className={inputClass}
          value={home.heroBadge}
          onChange={e => setHome(prev => ({ ...prev, heroBadge: e.target.value }))}
          placeholder="Hero badge"
        />
        <textarea
          className={inputClass}
          value={home.heroDescription}
          onChange={e => setHome(prev => ({ ...prev, heroDescription: e.target.value }))}
          placeholder="Hero description"
          rows={3}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">Stats (JSON array)</label>
            <textarea
              className={inputClass}
              rows={6}
              value={JSON.stringify(home.stats, null, 2)}
              onChange={e => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setHome(prev => ({ ...prev, stats: parsed }));
                } catch {
                  // ignore while typing
                }
              }}
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Features (JSON array)</label>
            <textarea
              className={inputClass}
              rows={6}
              value={JSON.stringify(home.features, null, 2)}
              onChange={e => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setHome(prev => ({ ...prev, features: parsed }));
                } catch {
                  // ignore while typing
                }
              }}
            />
          </div>
        </div>

        <button onClick={saveHome} disabled={busy} className={primaryButtonClass}>
          Save Homepage Content
        </button>
      </section>
      )}

      {activeSection === 'projects' && (
      <section className={panelClass}>
        <h2 className="text-xl font-semibold">Project Management</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Title" value={newProject.title || ''} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} />
          <select className={inputClass} value={newProject.status || 'Planning'} onChange={e => setNewProject(p => ({ ...p, status: e.target.value as Project['status'] }))}>
            <option>Planning</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
          <textarea className={`md:col-span-2 ${inputClass}`} rows={3} placeholder="Description" value={newProject.description || ''} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} />
          <input className={inputClass} placeholder="Project link" value={newProject.link || ''} onChange={e => setNewProject(p => ({ ...p, link: e.target.value }))} />
          <input className={inputClass} placeholder="Repo URL" value={newProject.repoUrl || ''} onChange={e => setNewProject(p => ({ ...p, repoUrl: e.target.value }))} />
          <input className={`md:col-span-2 ${inputClass}`} placeholder="Tags (comma separated)" value={(newProject.tags || []).join(', ')} onChange={e => setNewProject(p => ({ ...p, tags: parseCommaList(e.target.value) }))} />
          <input className={`md:col-span-2 ${inputClass}`} placeholder="Image URL (or upload below)" value={newProject.image || ''} onChange={e => setNewProject(p => ({ ...p, image: e.target.value }))} />
          <input className="md:col-span-2" type="file" accept="image/*" onChange={e => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file, url => setNewProject(p => ({ ...p, image: url })));
          }} />
          <button onClick={createProject} disabled={busy} className={`md:col-span-2 ${primaryButtonClass}`}>Create Project</button>
        </div>

        <div className="space-y-3">
          {projects.map(item => (
            <div key={item._id} className="rounded-xl border border-border p-3 space-y-2 bg-background/40">
              <input className={inputClass} value={item.title} onChange={e => setProjects(prev => prev.map(p => p._id === item._id ? { ...p, title: e.target.value } : p))} />
              <textarea className={inputClass} rows={2} value={item.description} onChange={e => setProjects(prev => prev.map(p => p._id === item._id ? { ...p, description: e.target.value } : p))} />
              <div className="flex gap-2">
                <button className={primaryButtonClass} onClick={() => updateProject(item)}>Save</button>
                <button className="rounded-lg border border-red-400 text-red-300 px-3 py-1" onClick={() => removeProject(item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {activeSection === 'team' && (
      <section className={panelClass}>
        <h2 className="text-xl font-semibold">Team Management</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Name" value={newMember.name || ''} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))} />
          <input className={inputClass} placeholder="Role" value={newMember.role || ''} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))} />
          <textarea className={`md:col-span-2 ${inputClass}`} rows={2} placeholder="Bio" value={newMember.bio || ''} onChange={e => setNewMember(p => ({ ...p, bio: e.target.value }))} />
          <input className={inputClass} placeholder="Image URL (or upload below)" value={newMember.image || ''} onChange={e => setNewMember(p => ({ ...p, image: e.target.value }))} />
          <input className={inputClass} placeholder="Email" value={newMember.email || ''} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} />
          <input className={inputClass} placeholder="LinkedIn URL" value={newMember.linkedin || ''} onChange={e => setNewMember(p => ({ ...p, linkedin: e.target.value }))} />
          <input className={inputClass} placeholder="GitHub URL" value={newMember.github || ''} onChange={e => setNewMember(p => ({ ...p, github: e.target.value }))} />
          <input className={inputClass} type="number" placeholder="Display order" value={newMember.order || 0} onChange={e => setNewMember(p => ({ ...p, order: Number(e.target.value) }))} />
          <input className="md:col-span-2" type="file" accept="image/*" onChange={e => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file, url => setNewMember(p => ({ ...p, image: url })));
          }} />
          <button onClick={createTeamMember} disabled={busy} className={`md:col-span-2 ${primaryButtonClass}`}>Add Team Member</button>
        </div>

        <div className="space-y-3">
          {team.map(item => (
            <div key={item._id} className="rounded-xl border border-border p-3 space-y-2 bg-background/40">
              <input className={inputClass} value={item.name} onChange={e => setTeam(prev => prev.map(m => m._id === item._id ? { ...m, name: e.target.value } : m))} />
              <input className={inputClass} value={item.role} onChange={e => setTeam(prev => prev.map(m => m._id === item._id ? { ...m, role: e.target.value } : m))} />
              <div className="flex gap-2">
                <button className={primaryButtonClass} onClick={() => updateTeamMember(item)}>Save</button>
                <button className="rounded-lg border border-red-400 text-red-300 px-3 py-1" onClick={() => removeTeamMember(item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {activeSection === 'plans' && (
      <section className={panelClass}>
        <h2 className="text-xl font-semibold">Plans Management</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Title" value={newPlan.title || ''} onChange={e => setNewPlan(p => ({ ...p, title: e.target.value }))} />
          <input className={inputClass} placeholder="Type (Prompt Lab, Expert Session...)" value={newPlan.type || ''} onChange={e => setNewPlan(p => ({ ...p, type: e.target.value }))} />
          <textarea className={`md:col-span-2 ${inputClass}`} rows={2} placeholder="Description" value={newPlan.description || ''} onChange={e => setNewPlan(p => ({ ...p, description: e.target.value }))} />
          <select className={inputClass} value={newPlan.category || 'upcoming'} onChange={e => setNewPlan(p => ({ ...p, category: e.target.value as Plan['category'] }))}>
            <option value="upcoming">upcoming</option>
            <option value="recurring">recurring</option>
          </select>
          <input className={inputClass} type="number" placeholder="Attendees" value={newPlan.attendees || 0} onChange={e => setNewPlan(p => ({ ...p, attendees: Number(e.target.value) }))} />
          <input className={inputClass} type="number" placeholder="Order" value={newPlan.order || 0} onChange={e => setNewPlan(p => ({ ...p, order: Number(e.target.value) }))} />
          <button onClick={createPlan} disabled={busy} className={`md:col-span-2 ${primaryButtonClass}`}>Create Plan</button>
        </div>

        <div className="space-y-3">
          {plans.map(item => (
            <div key={item._id} className="rounded-xl border border-border p-3 space-y-2 bg-background/40">
              <input className={inputClass} value={item.title} onChange={e => setPlans(prev => prev.map(p => p._id === item._id ? { ...p, title: e.target.value } : p))} />
              <textarea className={inputClass} rows={2} value={item.description} onChange={e => setPlans(prev => prev.map(p => p._id === item._id ? { ...p, description: e.target.value } : p))} />
              <div className="grid md:grid-cols-3 gap-2">
                <input className={inputClass} value={item.type} onChange={e => setPlans(prev => prev.map(p => p._id === item._id ? { ...p, type: e.target.value } : p))} />
                <select className={inputClass} value={item.category} onChange={e => setPlans(prev => prev.map(p => p._id === item._id ? { ...p, category: e.target.value as Plan['category'] } : p))}>
                  <option value="upcoming">upcoming</option>
                  <option value="recurring">recurring</option>
                </select>
                <input className={inputClass} type="number" value={item.attendees ?? 0} onChange={e => setPlans(prev => prev.map(p => p._id === item._id ? { ...p, attendees: Number(e.target.value) } : p))} />
              </div>
              <div className="flex gap-2">
                <button className={primaryButtonClass} onClick={() => updatePlan(item)}>Save</button>
                <button className="rounded-lg border border-red-400 text-red-300 px-3 py-1" onClick={() => removePlan(item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {activeSection === 'users' && (
        <section className={panelClass}>
          <h2 className="text-xl font-semibold">User Access Management</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user._id} className="rounded-xl border border-border bg-background/35 p-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className={inputClass}
                    value={user.role}
                    onChange={(event) => updateUserRole(user._id, event.target.value as 'admin' | 'user')}
                    disabled={busy}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeUser(user._id)}
                    disabled={busy}
                    className="rounded-lg border border-red-400 text-red-300 px-3 py-2 text-sm disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'servers' && (
        <section className={panelClass}>
          <h2 className="text-xl font-semibold">Server Access Management</h2>

          <div className="grid lg:grid-cols-[280px_1fr] gap-4">
            <div className="space-y-2">
              {servers.map((server) => (
                <button
                  key={server._id}
                  type="button"
                  onClick={() => setSelectedServerId(server._id)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors ${
                    selectedServerId === server._id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background/40 hover:bg-accent/60'
                  }`}
                >
                  <p className="font-semibold truncate">{server.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{server.memberCount} member(s)</p>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-background/30 p-4 space-y-4">
              {!selectedServer ? (
                <p className="text-sm text-muted-foreground">Select a server to manage member access.</p>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedServer.name}</h3>
                      <p className="text-xs text-muted-foreground">Owner: {selectedServer.owner?.username || 'Unknown'}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg border border-red-400 text-red-300 px-3 py-2 text-sm disabled:opacity-60"
                      disabled={busy || selectedServer.isDefault}
                      onClick={() => removeServer(selectedServer._id)}
                    >
                      Delete Server
                    </button>
                  </div>

                  <div className="rounded-xl border border-border p-3 space-y-2">
                    <p className="text-sm font-medium">Grant Access</p>
                    <div className="flex flex-col md:flex-row gap-2">
                      <select
                        className={inputClass}
                        value={accessUserId}
                        onChange={(e) => setAccessUserId(e.target.value)}
                      >
                        <option value="">Select user</option>
                        {usersWithoutAccess.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.username} ({user.email})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={grantServerAccess}
                        disabled={busy || !accessUserId}
                        className={primaryButtonClass}
                      >
                        Grant
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Current Members</p>
                    {selectedServer.members.map((member) => (
                      <div key={member._id} className="rounded-xl border border-border bg-background/40 p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{member.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email} - {member.role}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => revokeServerAccess(member._id)}
                          disabled={busy || selectedServer.owner?._id === member._id}
                          className={ghostButtonClass}
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
