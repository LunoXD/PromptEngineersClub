import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  AdminManagedServer,
  AdminManagedUser,
  api,
  HomeContent,
  Plan,
  Project,
  TeamMember,
} from "../lib/api";
import { getAuthToken } from "../lib/auth";

type TabKey = "projects" | "team" | "plans" | "home" | "users" | "servers";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "projects", label: "Projects" },
  { key: "team", label: "Team" },
  { key: "plans", label: "Plans" },
  { key: "home", label: "Home Content" },
  { key: "users", label: "Users" },
  { key: "servers", label: "Servers" },
];

const emptyProjectDraft: Omit<Project, "_id"> = {
  title: "",
  description: "",
  image: "",
  link: "",
  repoUrl: "",
  tags: [],
  status: "Planning",
};

const emptyTeamDraft: Omit<TeamMember, "_id"> = {
  name: "",
  role: "",
  bio: "",
  image: "",
  linkedin: "",
  github: "",
  email: "",
  order: 0,
};

const emptyPlanDraft: Omit<Plan, "_id"> = {
  title: "",
  type: "",
  attendees: 0,
  description: "",
  category: "upcoming",
  order: 0,
};

const emptyHomeDraft: HomeContent = {
  heroBadge: "",
  heroDescription: "",
  stats: [],
  features: [],
};

export function Admin() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("projects");

  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [servers, setServers] = useState<AdminManagedServer[]>([]);

  const [projectDraft, setProjectDraft] = useState<Omit<Project, "_id">>(emptyProjectDraft);
  const [projectEditId, setProjectEditId] = useState<string | null>(null);

  const [teamDraft, setTeamDraft] = useState<Omit<TeamMember, "_id">>(emptyTeamDraft);
  const [teamEditId, setTeamEditId] = useState<string | null>(null);

  const [planDraft, setPlanDraft] = useState<Omit<Plan, "_id">>(emptyPlanDraft);
  const [planEditId, setPlanEditId] = useState<string | null>(null);

  const [homeDraft, setHomeDraft] = useState<HomeContent>(emptyHomeDraft);

  const [accessUserByServer, setAccessUserByServer] = useState<Record<string, string>>({});

  const token = useMemo(() => getAuthToken(), []);

  const resetMessage = () => {
    setError("");
    setNotice("");
  };

  const loadAll = async () => {
    setLoadingData(true);
    resetMessage();
    try {
      const [projectsRes, teamRes, plansRes, homeRes, usersRes, serversRes] = await Promise.all([
        api.getProjects(),
        api.getTeam(),
        api.getPlans(),
        api.getHomeContent(),
        api.getAdminUsers(token),
        api.getAdminServers(token),
      ]);
      setProjects(projectsRes);
      setTeamMembers(teamRes);
      setPlans(plansRes);
      setHomeDraft({
        _id: homeRes._id,
        heroBadge: homeRes.heroBadge || "",
        heroDescription: homeRes.heroDescription || "",
        stats: Array.isArray(homeRes.stats) ? homeRes.stats : [],
        features: Array.isArray(homeRes.features) ? homeRes.features : [],
      });
      setUsers(usersRes);
      setServers(serversRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    let mounted = true;
    api
      .me(token)
      .then((res) => {
        if (!mounted) return;
        if (res.user.role !== "admin") {
          setAuthorized(false);
          setAuthChecked(true);
          navigate("/");
          return;
        }
        setAuthorized(true);
        setAuthChecked(true);
        loadAll();
      })
      .catch(() => {
        if (!mounted) return;
        navigate("/login");
      });

    return () => {
      mounted = false;
    };
  }, [navigate, token]);

  const handleProjectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    resetMessage();
    try {
      const payload = {
        ...projectDraft,
        tags: projectDraft.tags.filter(Boolean),
      };
      if (projectEditId) {
        await api.updateProject(projectEditId, payload, token);
        setNotice("Project updated");
      } else {
        await api.createProject(payload, token);
        setNotice("Project created");
      }
      setProjectDraft(emptyProjectDraft);
      setProjectEditId(null);
      setProjects(await api.getProjects());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleTeamSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    resetMessage();
    try {
      if (teamEditId) {
        await api.updateTeamMember(teamEditId, teamDraft, token);
        setNotice("Team member updated");
      } else {
        await api.createTeamMember(teamDraft, token);
        setNotice("Team member created");
      }
      setTeamDraft(emptyTeamDraft);
      setTeamEditId(null);
      setTeamMembers(await api.getTeam());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save team member");
    } finally {
      setSaving(false);
    }
  };

  const handlePlanSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    resetMessage();
    try {
      if (planEditId) {
        await api.updatePlan(planEditId, planDraft, token);
        setNotice("Plan updated");
      } else {
        await api.createPlan(planDraft, token);
        setNotice("Plan created");
      }
      setPlanDraft(emptyPlanDraft);
      setPlanEditId(null);
      setPlans(await api.getPlans());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const saveHomeContent = async () => {
    setSaving(true);
    resetMessage();
    try {
      const payload: HomeContent = {
        heroBadge: homeDraft.heroBadge,
        heroDescription: homeDraft.heroDescription,
        stats: homeDraft.stats,
        features: homeDraft.features,
      };
      const updated = await api.updateHomeContent(payload, token);
      setHomeDraft(updated);
      setNotice("Home content updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update home content");
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async (id: string) => {
    setSaving(true);
    resetMessage();
    try {
      await api.deleteProject(id, token);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setNotice("Project deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setSaving(false);
    }
  };

  const removeTeamMember = async (id: string) => {
    setSaving(true);
    resetMessage();
    try {
      await api.deleteTeamMember(id, token);
      setTeamMembers((prev) => prev.filter((m) => m._id !== id));
      setNotice("Team member deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete team member");
    } finally {
      setSaving(false);
    }
  };

  const removePlan = async (id: string) => {
    setSaving(true);
    resetMessage();
    try {
      await api.deletePlan(id, token);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      setNotice("Plan deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete plan");
    } finally {
      setSaving(false);
    }
  };

  const updateUserRole = async (id: string, role: "admin" | "user") => {
    setSaving(true);
    resetMessage();
    try {
      const updated = await api.updateAdminUserRole(id, role, token);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? { ...u, role: updated.role } : u)));
      setNotice("User role updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    setSaving(true);
    resetMessage();
    try {
      await api.deleteAdminUser(id, token);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setServers(await api.getAdminServers(token));
      setNotice("User deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  const deleteServer = async (id: string) => {
    setSaving(true);
    resetMessage();
    try {
      await api.deleteAdminServer(id, token);
      setServers((prev) => prev.filter((s) => s._id !== id));
      setNotice("Server deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete server");
    } finally {
      setSaving(false);
    }
  };

  const grantServerAccess = async (serverId: string) => {
    const userId = accessUserByServer[serverId];
    if (!userId) return;
    setSaving(true);
    resetMessage();
    try {
      const updated = await api.setAdminServerAccess(serverId, userId, "grant", token);
      setServers((prev) => prev.map((s) => (s._id === updated._id ? { ...s, ...updated } : s)));
      setNotice("Access granted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grant access");
    } finally {
      setSaving(false);
    }
  };

  const revokeServerAccess = async (serverId: string, userId: string) => {
    setSaving(true);
    resetMessage();
    try {
      const updated = await api.setAdminServerAccess(serverId, userId, "revoke", token);
      setServers((prev) => prev.map((s) => (s._id === updated._id ? { ...s, ...updated } : s)));
      setNotice("Access revoked");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke access");
    } finally {
      setSaving(false);
    }
  };

  if (!authChecked) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-sm text-gray-500">Checking admin access...</div>;
  }

  if (!authorized) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-sm text-red-500">Admin access required.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-sm text-slate-300">Manage projects, team members, plans, homepage content, users, and servers.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              activeTab === tab.key
                ? "bg-white text-black border-white"
                : "bg-black/40 text-white border-white/20 hover:bg-black/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={loadAll}
          className="ml-auto px-4 py-2 rounded-full text-sm border border-white/20 text-white hover:bg-black/40"
          disabled={loadingData}
        >
          {loadingData ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <p className="rounded-xl border border-red-500/40 bg-red-950/30 text-red-300 px-3 py-2 text-sm">{error}</p>}
      {notice && <p className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 px-3 py-2 text-sm">{notice}</p>}

      {activeTab === "projects" && (
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          <form onSubmit={handleProjectSubmit} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 space-y-3">
            <h2 className="text-lg font-semibold text-white">{projectEditId ? "Edit Project" : "Create Project"}</h2>
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Title" value={projectDraft.title} onChange={(e) => setProjectDraft((d) => ({ ...d, title: e.target.value }))} required />
            <textarea className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Description" value={projectDraft.description} onChange={(e) => setProjectDraft((d) => ({ ...d, description: e.target.value }))} required />
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Image URL" value={projectDraft.image || ""} onChange={(e) => setProjectDraft((d) => ({ ...d, image: e.target.value }))} />
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Details Link" value={projectDraft.link || ""} onChange={(e) => setProjectDraft((d) => ({ ...d, link: e.target.value }))} />
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Repo URL" value={projectDraft.repoUrl || ""} onChange={(e) => setProjectDraft((d) => ({ ...d, repoUrl: e.target.value }))} />
            <input
              className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2"
              placeholder="Tags (comma separated)"
              value={projectDraft.tags.join(", ")}
              onChange={(e) => setProjectDraft((d) => ({ ...d, tags: e.target.value.split(",").map((v) => v.trim()) }))}
            />
            <select className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" value={projectDraft.status} onChange={(e) => setProjectDraft((d) => ({ ...d, status: e.target.value as Project["status"] }))}>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="flex gap-2">
              <button disabled={saving} className="px-4 py-2 rounded-lg bg-white text-black font-medium">{projectEditId ? "Update" : "Create"}</button>
              {projectEditId && (
                <button type="button" onClick={() => { setProjectEditId(null); setProjectDraft(emptyProjectDraft); }} className="px-4 py-2 rounded-lg border border-white/20">Cancel</button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project._id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="flex flex-wrap items-start gap-2 justify-between">
                  <div>
                    <p className="font-semibold text-white">{project.title}</p>
                    <p className="text-xs text-slate-300">{project.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setProjectEditId(project._id); setProjectDraft({ ...project, tags: project.tags || [] }); }} className="px-3 py-1.5 rounded-md border border-white/20 text-sm">Edit</button>
                    <button type="button" onClick={() => removeProject(project._id)} className="px-3 py-1.5 rounded-md border border-red-400/40 text-sm text-red-300">Delete</button>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mt-2">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "team" && (
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          <form onSubmit={handleTeamSubmit} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 space-y-3">
            <h2 className="text-lg font-semibold text-white">{teamEditId ? "Edit Team Member" : "Add Team Member"}</h2>
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Name" value={teamDraft.name} onChange={(e) => setTeamDraft((d) => ({ ...d, name: e.target.value }))} required />
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Role" value={teamDraft.role} onChange={(e) => setTeamDraft((d) => ({ ...d, role: e.target.value }))} required />
            <textarea className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Bio" value={teamDraft.bio || ""} onChange={(e) => setTeamDraft((d) => ({ ...d, bio: e.target.value }))} />
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Image URL" value={teamDraft.image || ""} onChange={(e) => setTeamDraft((d) => ({ ...d, image: e.target.value }))} />
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="LinkedIn URL" value={teamDraft.linkedin || ""} onChange={(e) => setTeamDraft((d) => ({ ...d, linkedin: e.target.value }))} />
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="GitHub URL" value={teamDraft.github || ""} onChange={(e) => setTeamDraft((d) => ({ ...d, github: e.target.value }))} />
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Email" value={teamDraft.email || ""} onChange={(e) => setTeamDraft((d) => ({ ...d, email: e.target.value }))} />
            <input type="number" className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Order" value={teamDraft.order || 0} onChange={(e) => setTeamDraft((d) => ({ ...d, order: Number(e.target.value) }))} />
            <div className="flex gap-2">
              <button disabled={saving} className="px-4 py-2 rounded-lg bg-white text-black font-medium">{teamEditId ? "Update" : "Create"}</button>
              {teamEditId && (
                <button type="button" onClick={() => { setTeamEditId(null); setTeamDraft(emptyTeamDraft); }} className="px-4 py-2 rounded-lg border border-white/20">Cancel</button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member._id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="flex flex-wrap items-start gap-2 justify-between">
                  <div>
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-xs text-slate-300">{member.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setTeamEditId(member._id); setTeamDraft({ ...member }); }} className="px-3 py-1.5 rounded-md border border-white/20 text-sm">Edit</button>
                    <button type="button" onClick={() => removeTeamMember(member._id)} className="px-3 py-1.5 rounded-md border border-red-400/40 text-sm text-red-300">Delete</button>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mt-2">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "plans" && (
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          <form onSubmit={handlePlanSubmit} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 space-y-3">
            <h2 className="text-lg font-semibold text-white">{planEditId ? "Edit Plan" : "Create Plan"}</h2>
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Title" value={planDraft.title} onChange={(e) => setPlanDraft((d) => ({ ...d, title: e.target.value }))} required />
            <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Type" value={planDraft.type} onChange={(e) => setPlanDraft((d) => ({ ...d, type: e.target.value }))} required />
            <textarea className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Description" value={planDraft.description} onChange={(e) => setPlanDraft((d) => ({ ...d, description: e.target.value }))} required />
            <input type="number" className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Attendees" value={planDraft.attendees || 0} onChange={(e) => setPlanDraft((d) => ({ ...d, attendees: Number(e.target.value) }))} />
            <select className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" value={planDraft.category} onChange={(e) => setPlanDraft((d) => ({ ...d, category: e.target.value as Plan["category"] }))}>
              <option value="upcoming">Upcoming</option>
              <option value="recurring">Recurring</option>
            </select>
            <input type="number" className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Order" value={planDraft.order || 0} onChange={(e) => setPlanDraft((d) => ({ ...d, order: Number(e.target.value) }))} />
            <div className="flex gap-2">
              <button disabled={saving} className="px-4 py-2 rounded-lg bg-white text-black font-medium">{planEditId ? "Update" : "Create"}</button>
              {planEditId && (
                <button type="button" onClick={() => { setPlanEditId(null); setPlanDraft(emptyPlanDraft); }} className="px-4 py-2 rounded-lg border border-white/20">Cancel</button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan._id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="flex flex-wrap items-start gap-2 justify-between">
                  <div>
                    <p className="font-semibold text-white">{plan.title}</p>
                    <p className="text-xs text-slate-300">{plan.category} | {plan.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setPlanEditId(plan._id); setPlanDraft({ ...plan }); }} className="px-3 py-1.5 rounded-md border border-white/20 text-sm">Edit</button>
                    <button type="button" onClick={() => removePlan(plan._id)} className="px-3 py-1.5 rounded-md border border-red-400/40 text-sm text-red-300">Delete</button>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mt-2">{plan.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "home" && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 space-y-4">
          <h2 className="text-lg font-semibold text-white">Home Content</h2>
          <input className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Hero badge" value={homeDraft.heroBadge} onChange={(e) => setHomeDraft((d) => ({ ...d, heroBadge: e.target.value }))} />
          <textarea className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Hero description" value={homeDraft.heroDescription} onChange={(e) => setHomeDraft((d) => ({ ...d, heroDescription: e.target.value }))} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">Stats</h3>
              <button type="button" className="px-3 py-1.5 rounded-md border border-white/20 text-sm" onClick={() => setHomeDraft((d) => ({ ...d, stats: [...d.stats, { label: "", value: "" }] }))}>Add Stat</button>
            </div>
            {homeDraft.stats.map((stat, index) => (
              <div key={`${index}-${stat.label}`} className="grid md:grid-cols-[1fr_1fr_auto] gap-2">
                <input className="rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Label" value={stat.label} onChange={(e) => setHomeDraft((d) => ({ ...d, stats: d.stats.map((s, i) => (i === index ? { ...s, label: e.target.value } : s)) }))} />
                <input className="rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Value" value={stat.value} onChange={(e) => setHomeDraft((d) => ({ ...d, stats: d.stats.map((s, i) => (i === index ? { ...s, value: e.target.value } : s)) }))} />
                <button type="button" className="px-3 py-2 rounded-lg border border-red-400/40 text-red-300" onClick={() => setHomeDraft((d) => ({ ...d, stats: d.stats.filter((_, i) => i !== index) }))}>Remove</button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">Features</h3>
              <button type="button" className="px-3 py-1.5 rounded-md border border-white/20 text-sm" onClick={() => setHomeDraft((d) => ({ ...d, features: [...d.features, { icon: "Lightbulb", title: "", desc: "", link: "", cta: "" }] }))}>Add Feature</button>
            </div>
            {homeDraft.features.map((feature, index) => (
              <div key={`${index}-${feature.title}`} className="rounded-xl border border-white/10 p-3 space-y-2">
                <div className="grid md:grid-cols-2 gap-2">
                  <select className="rounded-lg bg-slate-800 border border-white/10 px-3 py-2" value={feature.icon || "Lightbulb"} onChange={(e) => setHomeDraft((d) => ({ ...d, features: d.features.map((f, i) => (i === index ? { ...f, icon: e.target.value } : f)) }))}>
                    <option value="Users">Users</option>
                    <option value="Lightbulb">Lightbulb</option>
                    <option value="Calendar">Calendar</option>
                  </select>
                  <input className="rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Title" value={feature.title} onChange={(e) => setHomeDraft((d) => ({ ...d, features: d.features.map((f, i) => (i === index ? { ...f, title: e.target.value } : f)) }))} />
                </div>
                <textarea className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Description" value={feature.desc} onChange={(e) => setHomeDraft((d) => ({ ...d, features: d.features.map((f, i) => (i === index ? { ...f, desc: e.target.value } : f)) }))} />
                <div className="grid md:grid-cols-2 gap-2">
                  <input className="rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="Link" value={feature.link || ""} onChange={(e) => setHomeDraft((d) => ({ ...d, features: d.features.map((f, i) => (i === index ? { ...f, link: e.target.value } : f)) }))} />
                  <input className="rounded-lg bg-slate-800 border border-white/10 px-3 py-2" placeholder="CTA text" value={feature.cta || ""} onChange={(e) => setHomeDraft((d) => ({ ...d, features: d.features.map((f, i) => (i === index ? { ...f, cta: e.target.value } : f)) }))} />
                </div>
                <button type="button" className="px-3 py-2 rounded-lg border border-red-400/40 text-red-300" onClick={() => setHomeDraft((d) => ({ ...d, features: d.features.filter((_, i) => i !== index) }))}>Remove Feature</button>
              </div>
            ))}
          </div>

          <button type="button" disabled={saving} onClick={saveHomeContent} className="px-4 py-2 rounded-lg bg-white text-black font-medium">Save Home Content</button>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user._id} className="rounded-xl border border-white/10 bg-black/40 p-4 flex flex-wrap items-center gap-3 justify-between">
              <div>
                <p className="font-medium text-white">{user.username}</p>
                <p className="text-xs text-slate-300">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="rounded-lg bg-slate-800 border border-white/10 px-3 py-2" value={user.role} onChange={(e) => updateUserRole(user._id, e.target.value as "admin" | "user") }>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <button type="button" onClick={() => deleteUser(user._id)} className="px-3 py-2 rounded-lg border border-red-400/40 text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "servers" && (
        <div className="space-y-4">
          {servers.map((server) => (
            <div key={server._id} className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{server.name}</p>
                  <p className="text-xs text-slate-300">Owner: {server.owner?.username || "Unknown"} | Members: {server.memberCount}</p>
                </div>
                <button type="button" onClick={() => deleteServer(server._id)} disabled={Boolean(server.isDefault)} className="px-3 py-2 rounded-lg border border-red-400/40 text-red-300 disabled:opacity-40">Delete Server</button>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <select className="rounded-lg bg-slate-800 border border-white/10 px-3 py-2" value={accessUserByServer[server._id] || ""} onChange={(e) => setAccessUserByServer((prev) => ({ ...prev, [server._id]: e.target.value }))}>
                  <option value="">Select user to grant access</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.username} ({user.email})</option>
                  ))}
                </select>
                <button type="button" onClick={() => grantServerAccess(server._id)} className="px-3 py-2 rounded-lg border border-white/20">Grant Access</button>
              </div>

              <div className="space-y-2">
                {server.members.map((member) => (
                  <div key={member._id} className="flex flex-wrap items-center justify-between gap-2 border border-white/10 rounded-lg px-3 py-2">
                    <p className="text-sm text-white">{member.username} <span className="text-xs text-slate-300">({member.role})</span></p>
                    <button type="button" onClick={() => revokeServerAccess(server._id, member._id)} className="text-xs px-2.5 py-1.5 rounded-md border border-red-400/40 text-red-300">Revoke</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
