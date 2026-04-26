import { create } from 'zustand';

import {
  api,
  type AssignmentConfirmResponse,
  type AssignmentResponse,
  type BacklogItem,
  type ChatHistoryMessage,
  type ChatResponse,
  type DashboardData,
  type IntegrationConnectUrlResponse,
  type InviteInfo,
  type PersonalRecommendation,
  type Project,
  type ProjectDeliveryDashboard,
  type ProjectDomain,
  type ProjectDomainMapping,
  type ProjectIntegration,
  type ProjectMemoryEntry,
  type ProjectPermission,
  type ProjectProfile,
  type ProjectSettings,
  type TaskGenerationResponse,
  type TeamMember,
  type User,
  type Workspace,
  type WorkspaceIntegration,
} from '../lib/api';

const TOKEN_KEY = 'uns_token';
const USER_KEY = 'uns_user';
const WORKSPACE_KEY = 'uns_workspace_id';
const PROJECT_KEY = 'uns_project_id';

export type MessageItem = {
  id?: number;
  role: 'user' | 'ai';
  content: string;
  payload?: Record<string, unknown>;
  senderId?: number | null;
  senderType?: string;
  createdAt?: string;
};

type AppState = {
  token: string | null;
  user: User | null;
  workspaces: Workspace[];
  currentWorkspaceId: number | null;
  inviteInfo: InviteInfo | null;
  workspaceIntegrations: WorkspaceIntegration[];
  projects: Project[];
  currentProjectId: number | null;
  projectSettings: ProjectSettings | null;
  projectPermissions: ProjectPermission | null;
  members: TeamMember[];
  dashboard: DashboardData | null;
  deliveryDashboard: ProjectDeliveryDashboard | null;
  personalRecommendation: PersonalRecommendation | null;
  domains: ProjectDomain[];
  domainMappings: ProjectDomainMapping[];
  memories: ProjectMemoryEntry[];
  backlog: BacklogItem[];
  projectIntegrations: ProjectIntegration[];
  teamMessages: MessageItem[];
  personalMessages: MessageItem[];
  generatedTasks: TaskGenerationResponse | null;
  assignments: AssignmentResponse | null;
  confirmedAssignments: AssignmentConfirmResponse | null;
  loading: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  signup: (payload: { name: string; password: string }) => Promise<void>;
  login: (payload: { name: string; password: string }) => Promise<void>;
  logout: () => void;
  loadWorkspaces: () => Promise<void>;
  createWorkspace: (payload: { name: string; description: string; team_type: string }) => Promise<Workspace>;
  setCurrentWorkspace: (workspaceId: number) => Promise<void>;
  loadCurrentInvite: () => Promise<void>;
  regenerateInvite: () => Promise<void>;
  deactivateInvite: () => Promise<void>;
  validateInvite: (inviteCode: string) => Promise<void>;
  joinInvite: (inviteCode: string) => Promise<void>;
  loadWorkspaceIntegrations: (workspaceId?: number) => Promise<void>;
  loadProjects: (workspaceId?: number) => Promise<void>;
  createProject: (payload: {
    name: string;
    description: string;
    goal: string;
    tech_stack: string[];
    priority: string;
    mvp_scope: string;
    start_date?: string | null;
    end_date?: string | null;
    ai_prompt?: string;
  }) => Promise<Project>;
  setCurrentProject: (projectId: number) => Promise<void>;
  loadProjectBundle: (projectId?: number) => Promise<void>;
  saveProfile: (payload: {
    project_role: string;
    tech_stack: string[];
    strong_tasks: string[];
    disliked_tasks: string[];
    available_hours_per_day: number;
    experience_level: string;
  }) => Promise<ProjectProfile>;
  generateTasks: () => Promise<TaskGenerationResponse>;
  recommendAssignments: (backlogItemIds: number[]) => Promise<AssignmentResponse>;
  confirmAssignments: () => Promise<AssignmentConfirmResponse>;
  sendTeamMessage: (content: string) => Promise<void>;
  sendPersonalMessage: (content: string) => Promise<void>;
  refreshPersonalRecommendation: () => Promise<void>;
  getIntegrationConnectUrl: (
    provider: string,
    redirectTo?: string
  ) => Promise<IntegrationConnectUrlResponse>;
  attachProjectIntegration: (payload: {
    workspace_integration_id: number;
    scope_type: string;
    scope_id: string;
    scope_name: string;
    settings?: Record<string, unknown>;
  }) => Promise<ProjectIntegration>;
  removeProjectIntegration: (bindingId: number) => Promise<void>;
  clearError: () => void;
};

function parseStoredNumber(key: string): number | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function persistAuth(token: string | null, user: User | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);

  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function projectScopedState(): Pick<
  AppState,
  | 'projectSettings'
  | 'projectPermissions'
  | 'members'
  | 'dashboard'
  | 'deliveryDashboard'
  | 'personalRecommendation'
  | 'domains'
  | 'domainMappings'
  | 'memories'
  | 'backlog'
  | 'projectIntegrations'
  | 'teamMessages'
  | 'personalMessages'
  | 'generatedTasks'
  | 'assignments'
  | 'confirmedAssignments'
> {
  return {
    projectSettings: null,
    projectPermissions: null,
    members: [],
    dashboard: null,
    deliveryDashboard: null,
    personalRecommendation: null,
    domains: [],
    domainMappings: [],
    memories: [],
    backlog: [],
    projectIntegrations: [],
    teamMessages: [],
    personalMessages: [],
    generatedTasks: null,
    assignments: null,
    confirmedAssignments: null,
  };
}

function fullSessionState(): Pick<
  AppState,
  | 'workspaces'
  | 'currentWorkspaceId'
  | 'inviteInfo'
  | 'workspaceIntegrations'
  | 'projects'
  | 'currentProjectId'
  | 'projectSettings'
  | 'projectPermissions'
  | 'members'
  | 'dashboard'
  | 'deliveryDashboard'
  | 'personalRecommendation'
  | 'domains'
  | 'domainMappings'
  | 'memories'
  | 'backlog'
  | 'projectIntegrations'
  | 'teamMessages'
  | 'personalMessages'
  | 'generatedTasks'
  | 'assignments'
  | 'confirmedAssignments'
> {
  return {
    workspaces: [],
    currentWorkspaceId: null,
    inviteInfo: null,
    workspaceIntegrations: [],
    projects: [],
    currentProjectId: null,
    ...projectScopedState(),
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: (() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  })(),
  workspaces: [],
  currentWorkspaceId: parseStoredNumber(WORKSPACE_KEY),
  inviteInfo: null,
  workspaceIntegrations: [],
  projects: [],
  currentProjectId: parseStoredNumber(PROJECT_KEY),
  projectSettings: null,
  projectPermissions: null,
  members: [],
  dashboard: null,
  deliveryDashboard: null,
  personalRecommendation: null,
  domains: [],
  domainMappings: [],
  memories: [],
  backlog: [],
  projectIntegrations: [],
  teamMessages: [],
  personalMessages: [],
  generatedTasks: null,
  assignments: null,
  confirmedAssignments: null,
  loading: false,
  error: null,

  bootstrap: async () => {
    const token = get().token;
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const user = await api.me(token);
      persistAuth(token, user);
      set({ user });
      await get().loadWorkspaces();
    } catch (error) {
      persistAuth(null, null);
      localStorage.removeItem(WORKSPACE_KEY);
      localStorage.removeItem(PROJECT_KEY);
      set({
        token: null,
        user: null,
        ...fullSessionState(),
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to restore session',
      });
      return;
    }
    set({ loading: false });
  },

  signup: async (payload) => {
    set({ loading: true, error: null });
    try {
      const response = await api.signup(payload);
      persistAuth(response.access_token, response.user);
      set({ token: response.access_token, user: response.user });
      await get().loadWorkspaces();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Signup failed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const response = await api.login(payload);
      persistAuth(response.access_token, response.user);
      set({ token: response.access_token, user: response.user });
      await get().loadWorkspaces();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    persistAuth(null, null);
    localStorage.removeItem(WORKSPACE_KEY);
    localStorage.removeItem(PROJECT_KEY);
    set({
      token: null,
      user: null,
      error: null,
      loading: false,
      ...fullSessionState(),
    });
  },

  loadWorkspaces: async () => {
    const token = get().token;
    if (!token) return;

    const workspaces = await api.listWorkspaces(token);
    const currentWorkspaceId =
      get().currentWorkspaceId && workspaces.some((workspace) => workspace.id === get().currentWorkspaceId)
        ? get().currentWorkspaceId
        : workspaces[0]?.id ?? null;

    if (currentWorkspaceId) localStorage.setItem(WORKSPACE_KEY, String(currentWorkspaceId));
    else localStorage.removeItem(WORKSPACE_KEY);

    set({ workspaces, currentWorkspaceId });

    if (currentWorkspaceId) {
      await Promise.allSettled([
        get().loadCurrentInvite(),
        get().loadWorkspaceIntegrations(currentWorkspaceId),
        get().loadProjects(currentWorkspaceId),
      ]);
    } else {
      set({
        inviteInfo: null,
        workspaceIntegrations: [],
        projects: [],
        currentProjectId: null,
        ...projectScopedState(),
      });
    }
  },

  createWorkspace: async (payload) => {
    const token = get().token;
    if (!token) throw new Error('Login required');

    set({ loading: true, error: null });
    try {
      const workspace = await api.createWorkspace(token, payload);
      const workspaces = [workspace, ...get().workspaces];
      localStorage.setItem(WORKSPACE_KEY, String(workspace.id));
      localStorage.removeItem(PROJECT_KEY);
      set({
        workspaces,
        currentWorkspaceId: workspace.id,
        inviteInfo: null,
        workspaceIntegrations: [],
        projects: [],
        currentProjectId: null,
        ...projectScopedState(),
      });
      await Promise.allSettled([get().loadCurrentInvite(), get().loadWorkspaceIntegrations(workspace.id)]);
      return workspace;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create workspace' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setCurrentWorkspace: async (workspaceId) => {
    localStorage.setItem(WORKSPACE_KEY, String(workspaceId));
    localStorage.removeItem(PROJECT_KEY);
    set({
      currentWorkspaceId: workspaceId,
      inviteInfo: null,
      workspaceIntegrations: [],
      projects: [],
      currentProjectId: null,
      ...projectScopedState(),
    });

    await Promise.allSettled([
      get().loadCurrentInvite(),
      get().loadWorkspaceIntegrations(workspaceId),
      get().loadProjects(workspaceId),
    ]);
  },

  loadCurrentInvite: async () => {
    const token = get().token;
    const workspaceId = get().currentWorkspaceId;
    if (!token || !workspaceId) return;

    try {
      const inviteInfo = await api.getInvite(token, workspaceId);
      set({ inviteInfo });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load invite link' });
      throw error;
    }
  },

  regenerateInvite: async () => {
    const token = get().token;
    const workspaceId = get().currentWorkspaceId;
    if (!token || !workspaceId) throw new Error('Workspace is required');

    set({ loading: true, error: null });
    try {
      const inviteInfo = await api.regenerateInvite(token, workspaceId);
      set({ inviteInfo });
      await get().loadWorkspaces();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to regenerate invite' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deactivateInvite: async () => {
    const token = get().token;
    const workspaceId = get().currentWorkspaceId;
    if (!token || !workspaceId) throw new Error('Workspace is required');

    set({ loading: true, error: null });
    try {
      const inviteInfo = await api.deactivateInvite(token, workspaceId);
      set({ inviteInfo });
      await get().loadWorkspaces();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to deactivate invite' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  validateInvite: async (inviteCode) => {
    set({ loading: true, error: null });
    try {
      const inviteInfo = await api.validateInvite(inviteCode);
      set({ inviteInfo });
    } catch (error) {
      set({
        inviteInfo: null,
        error: error instanceof Error ? error.message : 'Failed to validate invite',
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  joinInvite: async (inviteCode) => {
    const token = get().token;
    if (!token) throw new Error('Login required');

    set({ loading: true, error: null });
    try {
      await api.joinInvite(token, inviteCode);
      await get().loadWorkspaces();
      const matchedWorkspace = get().workspaces.find(
        (workspace) => workspace.invite_code === inviteCode || workspace.name === get().inviteInfo?.workspace_name
      );
      if (matchedWorkspace) {
        await get().setCurrentWorkspace(matchedWorkspace.id);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to join workspace' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loadWorkspaceIntegrations: async (workspaceId) => {
    const token = get().token;
    const targetWorkspaceId = workspaceId ?? get().currentWorkspaceId;
    if (!token || !targetWorkspaceId) return;

    const workspaceIntegrations = await api.listWorkspaceIntegrations(token, targetWorkspaceId);
    set({ workspaceIntegrations });
  },

  loadProjects: async (workspaceId) => {
    const token = get().token;
    const targetWorkspaceId = workspaceId ?? get().currentWorkspaceId;
    if (!token || !targetWorkspaceId) return;

    const projects = await api.listProjects(token, targetWorkspaceId);
    const currentProjectId =
      get().currentProjectId && projects.some((project) => project.id === get().currentProjectId)
        ? get().currentProjectId
        : projects[0]?.id ?? null;

    if (currentProjectId) localStorage.setItem(PROJECT_KEY, String(currentProjectId));
    else localStorage.removeItem(PROJECT_KEY);

    set({ projects, currentProjectId });

    if (currentProjectId) {
      await get().loadProjectBundle(currentProjectId);
    } else {
      set(projectScopedState());
    }
  },

  createProject: async (payload) => {
    const token = get().token;
    const workspaceId = get().currentWorkspaceId;
    if (!token || !workspaceId) throw new Error('Workspace is required');

    set({ loading: true, error: null });
    try {
      const project = await api.createProject(token, workspaceId, payload);
      const projects = [project, ...get().projects];
      localStorage.setItem(PROJECT_KEY, String(project.id));
      set({ projects, currentProjectId: project.id });
      await get().loadProjectBundle(project.id);
      return project;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create project' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setCurrentProject: async (projectId) => {
    localStorage.setItem(PROJECT_KEY, String(projectId));
    set({
      currentProjectId: projectId,
      ...projectScopedState(),
    });
    await get().loadProjectBundle(projectId);
  },

  loadProjectBundle: async (projectId) => {
    const token = get().token;
    const targetProjectId = projectId ?? get().currentProjectId;
    if (!token || !targetProjectId) return;

    set({ loading: true, error: null });
    try {
      const [hub, teamHistoryResult, personalHistoryResult] = await Promise.all([
        api.getProjectHub(token, targetProjectId),
        api.getTeamHistory(token, targetProjectId).catch(() => null),
        api.getPersonalHistory(token, targetProjectId).catch(() => null),
      ]);

      set({
        projectSettings: hub.settings,
        projectPermissions: hub.permissions,
        members: hub.members,
        dashboard: hub.internal_dashboard,
        deliveryDashboard: hub.delivery_dashboard,
        personalRecommendation: hub.personal_recommendation,
        domains: hub.domains,
        domainMappings: hub.domain_mappings,
        memories: hub.memories,
        backlog: hub.backlog,
        workspaceIntegrations: hub.workspace_integrations,
        projectIntegrations: hub.project_integrations,
        teamMessages: teamHistoryResult ? teamHistoryResult.messages.map(normalizeHistoryMessage) : [],
        personalMessages: personalHistoryResult
          ? personalHistoryResult.messages.map(normalizeHistoryMessage)
          : [],
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load project hub' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  saveProfile: async (payload) => {
    const token = get().token;
    const projectId = get().currentProjectId;
    if (!token || !projectId) throw new Error('Project is required');

    set({ loading: true, error: null });
    try {
      const profile = await api.saveProfile(token, projectId, payload);
      await get().loadProjectBundle(projectId);
      return profile;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save profile' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  generateTasks: async () => {
    const token = get().token;
    const projectId = get().currentProjectId;
    if (!token || !projectId) throw new Error('Project is required');

    set({ loading: true, error: null });
    try {
      const generatedTasks = await api.generateTasks(token, projectId);
      set({
        generatedTasks,
        assignments: null,
        confirmedAssignments: null,
      });
      await get().loadProjectBundle(projectId);
      return generatedTasks;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to generate tasks' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  recommendAssignments: async (backlogItemIds) => {
    const token = get().token;
    const projectId = get().currentProjectId;
    if (!token || !projectId) throw new Error('Project is required');

    set({ loading: true, error: null });
    try {
      const assignments = await api.recommendAssignments(token, projectId, backlogItemIds);
      set({ assignments, confirmedAssignments: null });
      return assignments;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to recommend assignments' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  confirmAssignments: async () => {
    const token = get().token;
    const projectId = get().currentProjectId;
    const assignmentState = get().assignments;
    if (!token || !projectId || !assignmentState) throw new Error('Assignments are required');

    const payload = assignmentState.assignments
      .filter((assignment) => assignment.recommended_assignee_id !== null)
      .map((assignment) => ({
        backlog_item_id: assignment.backlog_item_id,
        assignee_id: assignment.recommended_assignee_id as number,
        assignment_reason: assignment.recommendation_reason,
      }));

    if (payload.length === 0) {
      throw new Error('No valid assignment recommendations to confirm');
    }

    set({ loading: true, error: null });
    try {
      const confirmedAssignments = await api.confirmAssignments(token, projectId, payload);
      set({ confirmedAssignments });
      await get().loadProjectBundle(projectId);
      return confirmedAssignments;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to confirm assignments' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  sendTeamMessage: async (content) => {
    const token = get().token;
    const user = get().user;
    const projectId = get().currentProjectId;
    if (!token || !user || !projectId || !content.trim()) return;

    set((state) => ({
      teamMessages: [
        ...state.teamMessages,
        {
          role: 'user',
          content,
          senderId: user.id,
          senderType: 'USER',
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    try {
      const response = await api.sendTeamMessage(token, projectId, content);
      appendAiMessage(set, 'teamMessages', response);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to send team message' });
      throw error;
    }
  },

  sendPersonalMessage: async (content) => {
    const token = get().token;
    const user = get().user;
    const projectId = get().currentProjectId;
    if (!token || !user || !projectId || !content.trim()) return;

    set((state) => ({
      personalMessages: [
        ...state.personalMessages,
        {
          role: 'user',
          content,
          senderId: user.id,
          senderType: 'USER',
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    try {
      const response = await api.sendPersonalMessage(token, projectId, content);
      appendAiMessage(set, 'personalMessages', response);
      await get().refreshPersonalRecommendation();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to send personal message' });
      throw error;
    }
  },

  refreshPersonalRecommendation: async () => {
    const token = get().token;
    const projectId = get().currentProjectId;
    if (!token || !projectId) return;

    const personalRecommendation = await api.getPersonalFocus(token, projectId);
    set({ personalRecommendation });
  },

  getIntegrationConnectUrl: async (provider, redirectTo) => {
    const token = get().token;
    const workspaceId = get().currentWorkspaceId;
    if (!token || !workspaceId) throw new Error('Workspace is required');

    set({ loading: true, error: null });
    try {
      return await api.getIntegrationConnectUrl(token, workspaceId, provider, redirectTo);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create connect URL' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  attachProjectIntegration: async (payload) => {
    const token = get().token;
    const projectId = get().currentProjectId;
    if (!token || !projectId) throw new Error('Project is required');

    set({ loading: true, error: null });
    try {
      const integration = await api.attachProjectIntegration(token, projectId, payload);
      await get().loadProjectBundle(projectId);
      return integration;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to attach integration' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeProjectIntegration: async (bindingId) => {
    const token = get().token;
    const projectId = get().currentProjectId;
    if (!token) throw new Error('Login required');

    set({ loading: true, error: null });
    try {
      await api.removeProjectIntegration(token, bindingId);
      if (projectId) {
        await get().loadProjectBundle(projectId);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove integration' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

function normalizeHistoryMessage(message: ChatHistoryMessage): MessageItem {
  return {
    id: message.id,
    role: message.sender_type === 'AI' ? 'ai' : 'user',
    content: message.content,
    payload: parsePayload(message.metadata),
    senderId: message.sender_id ?? null,
    senderType: message.sender_type,
    createdAt: message.created_at,
  };
}

function parsePayload(raw?: string | null): Record<string, unknown> | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

function appendAiMessage(
  set: (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void,
  key: 'teamMessages' | 'personalMessages',
  response: ChatResponse
) {
  set((state) => ({
    [key]: [
      ...state[key],
      {
        role: 'ai',
        content: stringifyAnswer(response.answer),
        payload: response.answer,
        senderType: 'AI',
        createdAt: new Date().toISOString(),
      },
    ],
  }));
}

function stringifyAnswer(answer: Record<string, unknown>): string {
  if (typeof answer.summary === 'string' && answer.summary.trim()) {
    return answer.summary;
  }
  if (typeof answer.next_action === 'string' && answer.next_action.trim()) {
    return answer.next_action;
  }
  return JSON.stringify(answer, null, 2);
}
