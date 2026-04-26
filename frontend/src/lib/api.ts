export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export type User = {
  id: number;
  name: string;
  email?: string | null;
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
  user_email?: string | null;
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
  user_email?: string | null;
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

export type ProgressSummary = {
  total_items: number;
  effective_items: number;
  backlog_items: number;
  in_progress_items: number;
  done_items: number;
  canceled_items: number;
  total_estimate?: number | null;
  completed_estimate?: number | null;
  completion_rate: number;
  weighted_completion_rate?: number | null;
};

export type WorkIteration = {
  source: 'jira' | 'linear';
  external_id: string;
  name: string;
  state?: string | null;
  scope_id: string;
  scope_name: string;
  start_date?: string | null;
  end_date?: string | null;
  goal?: string | null;
  progress?: number | null;
};

export type WorkItem = {
  source: 'jira' | 'linear';
  scope_id: string;
  scope_name: string;
  external_id: string;
  title: string;
  url?: string | null;
  project_name?: string | null;
  team_name?: string | null;
  assignee_name?: string | null;
  status_name: string;
  status_category: 'backlog' | 'in_progress' | 'done' | 'canceled';
  labels: string[];
  estimate?: number | null;
  priority?: string | null;
  is_backlog: boolean;
  is_current_iteration: boolean;
  iteration_id?: string | null;
  iteration_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  completed_at?: string | null;
};

export type DashboardArea = {
  key: string;
  label: string;
  summary: ProgressSummary;
};

export type WorkspaceIntegration = {
  id: number;
  workspace_id: number;
  provider: string;
  external_workspace_id: string;
  external_workspace_name: string;
  external_workspace_url?: string | null;
  scope?: string | null;
  status: string;
  connected_by?: number | null;
  token_expires_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type IntegrationConnectUrlResponse = {
  provider: string;
  configured: boolean;
  authorization_url?: string | null;
  message?: string | null;
};

export type IntegrationCatalogItem = {
  id: string;
  name: string;
  key?: string | null;
  url?: string | null;
};

export type IntegrationCatalogResponse = {
  provider: string;
  items: IntegrationCatalogItem[];
};

export type ProjectIntegration = {
  id: number;
  project_id: number;
  workspace_integration_id: number;
  provider: string;
  scope_type: string;
  scope_id: string;
  scope_name: string;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
};

export type ProjectSettings = {
  id: number;
  project_id: number;
  ai_prompt: string;
  tech_stack_notes: string;
  summary_cache: string;
  created_by?: number | null;
  updated_by?: number | null;
  created_at: string;
  updated_at: string;
};

export type ProjectPermission = {
  current_user_id: number;
  pm_user_id: number;
  is_pm: boolean;
};

export type ProjectDomain = {
  id: number;
  project_id: number;
  code: string;
  name: string;
  color: string;
  is_active: boolean;
  created_at: string;
};

export type ProjectDomainMapping = {
  id: number;
  project_id: number;
  domain_id: number;
  source: string;
  match_field: string;
  match_value: string;
  created_at: string;
};

export type ProjectMemoryEntry = {
  id: number;
  project_id: number;
  memory_type: string;
  title: string;
  content: string;
  status: string;
  created_by?: number | null;
  created_at: string;
};

export type DomainProgress = {
  domain_id: number;
  code: string;
  name: string;
  color: string;
  summary: ProgressSummary;
  sources: string[];
};

export type ProjectDeliveryDashboard = {
  summary: ProgressSummary;
  sources: DashboardArea[];
  domains: DomainProgress[];
  active_items: WorkItem[];
  unmapped_items: number;
  integration_warnings: string[];
};

export type PersonalRecommendation = {
  summary: string;
  current_assignments: Array<Record<string, unknown>>;
  recommended_backlog: Array<Record<string, unknown>>;
  context_notes: string[];
  excluded_titles: string[];
};

export type ProjectHubResponse = {
  project: Project;
  settings: ProjectSettings;
  permissions: ProjectPermission;
  members: TeamMember[];
  backlog: BacklogItem[];
  internal_dashboard: DashboardData;
  delivery_dashboard: ProjectDeliveryDashboard;
  domains: ProjectDomain[];
  domain_mappings: ProjectDomainMapping[];
  workspace_integrations: WorkspaceIntegration[];
  project_integrations: ProjectIntegration[];
  memories: ProjectMemoryEntry[];
  personal_recommendation: PersonalRecommendation;
};

export type ChatResponse = {
  user_message_id: number;
  ai_message_id: number;
  room_type: string;
  answer: Record<string, unknown>;
};

export type ChatHistoryMessage = {
  id: number;
  chat_room_id: number;
  sender_id?: number | null;
  sender_type: string;
  content: string;
  metadata?: string | null;
  created_at: string;
};

export type ChatHistoryResponse = {
  room_type: string;
  messages: ChatHistoryMessage[];
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

export type AssignmentConfirmResponse = {
  created_issue_ids: number[];
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
      const data = (await response.json()) as { detail?: string };
      if (typeof data.detail === 'string' && data.detail.trim()) {
        message = data.detail;
      }
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
  signup: (payload: { name: string; password: string }) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { name: string; password: string }) =>
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

  regenerateInvite: (
    token: string,
    workspaceId: number,
    payload: { expires_at?: string | null; max_uses?: number | null } = {}
  ) =>
    request<InviteInfo>(`/workspaces/${workspaceId}/invite/regenerate`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    }),

  deactivateInvite: (token: string, workspaceId: number) =>
    request<InviteInfo>(`/workspaces/${workspaceId}/invite/deactivate`, {
      method: 'PATCH',
      token,
    }),

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
      start_date?: string | null;
      end_date?: string | null;
      ai_prompt?: string;
    }
  ) =>
    request<Project>(`/workspaces/${workspaceId}/projects`, {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),

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

  getProjectHub: (token: string, projectId: number) =>
    request<ProjectHubResponse>(`/projects/${projectId}/hub`, { token }),

  getPersonalFocus: (token: string, projectId: number) =>
    request<PersonalRecommendation>(`/projects/${projectId}/ai/focus`, { token }),

  listWorkspaceIntegrations: (token: string, workspaceId: number) =>
    request<WorkspaceIntegration[]>(`/workspaces/${workspaceId}/integrations`, { token }),

  getIntegrationConnectUrl: (
    token: string,
    workspaceId: number,
    provider: string,
    redirectTo?: string
  ) => {
    const params = new URLSearchParams();
    if (redirectTo) params.set('redirect_to', redirectTo);
    const query = params.toString();
    return request<IntegrationConnectUrlResponse>(
      `/workspaces/${workspaceId}/integrations/${provider}/connect${query ? `?${query}` : ''}`,
      { token }
    );
  },

  getIntegrationCatalog: (token: string, integrationId: number) =>
    request<IntegrationCatalogResponse>(`/workspace-integrations/${integrationId}/catalog`, {
      token,
    }),

  attachProjectIntegration: (
    token: string,
    projectId: number,
    payload: {
      workspace_integration_id: number;
      scope_type: string;
      scope_id: string;
      scope_name: string;
      settings?: Record<string, unknown>;
    }
  ) =>
    request<ProjectIntegration>(`/projects/${projectId}/integrations`, {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),

  removeProjectIntegration: (token: string, bindingId: number) =>
    request<void>(`/project-integrations/${bindingId}`, {
      method: 'DELETE',
      token,
    }),

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

  confirmAssignments: (
    token: string,
    projectId: number,
    assignments: Array<{
      backlog_item_id: number;
      assignee_id: number;
      assignment_reason: string;
      sprint_id?: number | null;
    }>
  ) =>
    request<AssignmentConfirmResponse>(`/projects/${projectId}/ai/assignments/confirm`, {
      method: 'POST',
      token,
      body: JSON.stringify({ assignments }),
    }),

  getTeamHistory: (token: string, projectId: number) =>
    request<ChatHistoryResponse>(`/projects/${projectId}/chat/team/history`, { token }),

  getPersonalHistory: (token: string, projectId: number) =>
    request<ChatHistoryResponse>(`/projects/${projectId}/chat/personal/history`, { token }),

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
