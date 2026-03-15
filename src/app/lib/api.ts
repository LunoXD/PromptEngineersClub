export type Project = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  repoUrl?: string;
  tags: string[];
  status: 'Completed' | 'In Progress' | 'Planning';
};

export type TeamMember = {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  linkedin?: string;
  github?: string;
  email?: string;
  order?: number;
};

export type Plan = {
  _id: string;
  title: string;
  type: string;
  attendees?: number;
  description: string;
  category: 'upcoming' | 'recurring';
  order?: number;
};

export type AuthUser = {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  avatarUrl?: string;
};

export type ChatServer = {
  _id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  isMember: boolean;
};

export type ChatServerMember = {
  _id: string;
  username: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
};

export type AdminManagedUser = {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  avatarUrl?: string;
  createdAt: string;
};

export type AdminManagedServer = {
  _id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  owner?: {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
  };
  members: Array<{
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    avatarUrl?: string;
  }>;
  memberCount: number;
  createdAt: string;
};

export type ChatMessage = {
  _id: string;
  serverId: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  user: AuthUser;
  replyTo?: {
    _id: string;
    content: string;
    user: AuthUser | null;
  } | null;
  reactions?: Array<{
    emoji: string;
    users: string[];
    count: number;
  }>;
};

export type HomeStat = {
  label: string;
  value: string;
};

export type HomeFeature = {
  icon?: string;
  title: string;
  desc: string;
  link?: string;
  cta?: string;
};

export type HomeContent = {
  _id?: string;
  heroBadge: string;
  heroDescription: string;
  stats: HomeStat[];
  features: HomeFeature[];
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getProjects: () => request<Project[]>('/api/projects'),
  createProject: (payload: Partial<Project>, token: string) =>
    request<Project>('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateProject: (id: string, payload: Partial<Project>, token: string) =>
    request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  deleteProject: (id: string, token: string) =>
    request<void>(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getTeam: () => request<TeamMember[]>('/api/team'),
  createTeamMember: (payload: Partial<TeamMember>, token: string) =>
    request<TeamMember>('/api/team', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateTeamMember: (id: string, payload: Partial<TeamMember>, token: string) =>
    request<TeamMember>(`/api/team/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  deleteTeamMember: (id: string, token: string) =>
    request<void>(`/api/team/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getPlans: () => request<Plan[]>('/api/plans'),
  createPlan: (payload: Partial<Plan>, token: string) =>
    request<Plan>('/api/plans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updatePlan: (id: string, payload: Partial<Plan>, token: string) =>
    request<Plan>(`/api/plans/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  deletePlan: (id: string, token: string) =>
    request<void>(`/api/plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getHomeContent: () => request<HomeContent>('/api/content/home'),
  updateHomeContent: (payload: HomeContent, token: string) =>
    request<HomeContent>('/api/content/home', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),

  adminLogin: async (email: string, password: string) => {
    const result = await request<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.user.role !== 'admin') {
      throw new Error('Admin access required');
    }
    return { token: result.token, username: result.user.username };
  },
  verifyAdmin: async (token: string) => {
    const result = await request<{ user: AuthUser }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: result.user.role === 'admin' };
  },
  getAdminUsers: (token: string) =>
    request<AdminManagedUser[]>('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateAdminUserRole: (userId: string, role: 'admin' | 'user', token: string) =>
    request<AdminManagedUser>(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    }),
  deleteAdminUser: (userId: string, token: string) =>
    request<{ ok: boolean }>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
  getAdminServers: (token: string) =>
    request<AdminManagedServer[]>('/api/admin/servers', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  setAdminServerAccess: (
    serverId: string,
    userId: string,
    action: 'grant' | 'revoke',
    token: string
  ) =>
    request<AdminManagedServer>(`/api/admin/servers/${serverId}/access`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, action }),
    }),
  deleteAdminServer: (serverId: string, token: string) =>
    request<{ ok: boolean }>(`/api/admin/servers/${serverId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  uploadImage: async (file: File, token: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },

  signup: (payload: { username: string; email: string; password: string }) =>
    request<{ message: string; user: AuthUser }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  googleLogin: (credential: string) =>
    request<{ token: string; user: AuthUser }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),
  me: (token: string) =>
    request<{ user: AuthUser }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  logout: (token: string) =>
    request<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateProfile: (
    payload: { username?: string; avatarUrl?: string },
    token: string
  ) =>
    request<{ user: AuthUser }>('/api/auth/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),

  getChatServers: (token: string) =>
    request<ChatServer[]>('/api/chat/servers', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  createChatServer: (
    payload: { name: string; description?: string },
    token: string
  ) =>
    request<ChatServer>('/api/chat/servers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  joinChatServer: (serverId: string, token: string) =>
    request<{ ok: boolean }>(`/api/chat/servers/${serverId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),
  getChatMessages: (serverId: string, token: string) =>
    request<ChatMessage[]>(`/api/chat/servers/${serverId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getChatServerMembers: (serverId: string, token: string) =>
    request<ChatServerMember[]>(`/api/chat/servers/${serverId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  sendChatMessage: (serverId: string, content: string, token: string) =>
    request<ChatMessage>(`/api/chat/servers/${serverId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    }),
  sendChatReplyMessage: (serverId: string, content: string, replyToMessageId: string, token: string) =>
    request<ChatMessage>(`/api/chat/servers/${serverId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content, replyToMessageId }),
    }),
  editChatMessage: (serverId: string, messageId: string, content: string, token: string) =>
    request<ChatMessage>(`/api/chat/servers/${serverId}/messages/${messageId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    }),
  deleteChatMessage: (serverId: string, messageId: string, token: string) =>
    request<{ ok: boolean }>(`/api/chat/servers/${serverId}/messages/${messageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
  toggleChatMessageReaction: (serverId: string, messageId: string, emoji: string, token: string) =>
    request<{ _id: string; serverId: string; reactions: Array<{ emoji: string; users: string[]; count: number }> }>(
      `/api/chat/servers/${serverId}/messages/${messageId}/reactions`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emoji }),
      }
    ),
};
