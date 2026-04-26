export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export type User = {
  id: number;
  name: string;
  email: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type Workspace = {
  id: number;
  name: string;
  description: string;
  team_type: string;
  owner_id: number;
  workspace_role?: string;
  invite_code?: string;
  invite_code_active: boolean;
  invite_code_expires_at?: string | null;
  invite_code_max_uses?: number | null;
  invite_code_used_count?: number;
  member_count: number;
  created_at: string;
};

export type InviteInfo = {
  workspace_id: number;
  workspace_name: string;
  invite_code: string;
  invite_url?: string;
  invite_code_active: boolean;
  invite_code_expires_at?: string | null;
  invite_code_max_uses?: number | null;
  invite_code_used_count?: number;
  member_count?: number;
  valid?: boolean;
  message?: string;
};

export type Project = {
  id: number;
  workspace_id: number;
  name: string;
  description: string;
  goal: string;
  tech_stack: string[];
  start_date?: string | null;
  end_date?: string | null;
  pm_id: number;
  priority: string;
  mvp_scope: string;
  created_at: string;
};

export type ProjectProfile = {
  id: number;
  project_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  project_role: string;
  tech_stack: string[];
  strong_tasks: string[];
  disliked_tasks: string[];
  available_hours_per_day: number;
  experience_level: string;
  joined_at: string;
};

export type TeamMember = {
  user_id: number;
  user_name: string;
  user_email: string;
  workspace_role: string;
  joined_at: string;
  project_profile: ProjectProfile | null;
};

export type DashboardData = {
  total_issues: number;
  completed_issues: number;
  in_progress_issues: number;
  remaining_issues: number;
  sprint_progress: number;
  team_workload: Array<{ user_id: number; user_name: string; issue_count: number }>;
  risk_issues: Array<{ id: number; title: string; priority: string; status: string }>;
  bottleneck_summary: string;
  recommended_next_issue?: { id: number; title: string; priority: string; status: string } | null;
};

export type BacklogItem = {
  id: number;
  project_id: number;
  title: string;
  description: string;
  priority: string;
  required_role?: string | null;
  required_tech_stack: string[];
  difficulty: string;
  estimated_hours: number;
  status: string;
  linked_issue_id?: number | null;
  created_at: string;
};

export type ChatResponse = {
  user_message_id: number;
  ai_message_id: number;
  room_type: string;
  answer: Record<string, unknown>;
};

export type TaskGenerationResponse = {
  project_summary: string;
  tasks: Array<{
    title: string;
    description: string;
    required_role: string;
    required_tech_stack: string[];
    difficulty: string;
    estimated_hours: number;
    priority: string;
  }>;
  created_backlog_items: number[];
};

export type AssignmentResponse = {
  assignments: Array<{
    backlog_item_id: number;
    title: string;
    recommended_assignee_id: number | null;
    recommended_assignee_name: string | null;
    recommendation_reason: string;
    candidates: Array<{
      user_id: number;
      user_name: string;
      score: number;
      stars: string;
      reasons: string[];
    }>;
  }>;
};

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const errorData = (await response.json()) as { detail?: string };
      message = errorData.detail ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  signup: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: (token: string) => request<User>('/auth/me', { token }),
  listWorkspaces: (token: string) => request<Workspace[]>('/workspaces', { token }),
  createWorkspace: (
    token: string,
    payload: { name: string; description: string; team_type: string }
  ) =>
    request<Workspace>('/workspaces', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
  getInvite: (token: string, workspaceId: number) =>
    request<InviteInfo>(`/workspaces/${workspaceId}/invite`, { token }),
  validateInvite: (inviteCode: string) => request<InviteInfo>(`/invites/${inviteCode}`),
  joinInvite: (token: string, inviteCode: string) =>
    request<{ workspace_id: number; workspace_name: string; joined: boolean; workspace_role: string }>(
      `/invites/${inviteCode}/join`,
      { method: 'POST', token }
    ),
  listProjects: (token: string, workspaceId: number) =>
    request<Project[]>(`/workspaces/${workspaceId}/projects`, { token }),
  createProject: (
    token: string,
    workspaceId: number,
    payload: {
      name: string;
      description: string;
      goal: string;
      tech_stack: string[];
      priority: string;
      mvp_scope: string;
    }
  ) =>
    request<Project>(`/workspaces/${workspaceId}/projects`, {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
  listMembers: (token: string, projectId: number) =>
    request<TeamMember[]>(`/projects/${projectId}/members`, { token }),
  saveProfile: (
    token: string,
    projectId: number,
    payload: {
      project_role: string;
      tech_stack: string[];
      strong_tasks: string[];
      disliked_tasks: string[];
      available_hours_per_day: number;
      experience_level: string;
    }
  ) =>
    request<ProjectProfile>(`/projects/${projectId}/members/profile`, {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
  getDashboard: (token: string, projectId: number) =>
    request<DashboardData>(`/projects/${projectId}/dashboard`, { token }),
  listBacklog: (token: string, projectId: number) =>
    request<BacklogItem[]>(`/projects/${projectId}/backlog`, { token }),
  generateTasks: (token: string, projectId: number) =>
    request<TaskGenerationResponse>(`/projects/${projectId}/ai/tasks`, {
      method: 'POST',
      token,
      body: JSON.stringify({ create_backlog: true }),
    }),
  recommendAssignments: (token: string, projectId: number, backlogItemIds: number[]) =>
    request<AssignmentResponse>(`/projects/${projectId}/ai/assignments`, {
      method: 'POST',
      token,
      body: JSON.stringify({ backlog_item_ids: backlogItemIds }),
    }),
  sendTeamMessage: (token: string, projectId: number, content: string) =>
    request<ChatResponse>(`/projects/${projectId}/chat/team/messages`, {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    }),
  sendPersonalMessage: (token: string, projectId: number, content: string) =>
    request<ChatResponse>(`/projects/${projectId}/chat/personal/messages`, {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    }),
};
