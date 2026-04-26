import { create } from 'zustand';

import {
  api,
  type AssignmentResponse,
  type BacklogItem,
  type ChatResponse,
  type DashboardData,
  type InviteInfo,
  type Project,
  type ProjectProfile,
  type TaskGenerationResponse,
  type TeamMember,
  type User,
  type Workspace,
} from '../lib/api';

const TOKEN_KEY = 'uns_token';
const USER_KEY = 'uns_user';
const WORKSPACE_KEY = 'uns_workspace_id';
const PROJECT_KEY = 'uns_project_id';

type MessageItem = {
  role: 'user' | 'ai';
  content: string;
  payload?: Record<string, unknown>;
};

type AppState = {
  token: string | null;
  user: User | null;
  workspaces: Workspace[];
  currentWorkspaceId: number | null;
  inviteInfo: InviteInfo | null;
  projects: Project[];
  currentProjectId: number | null;
  members: TeamMember[];
  dashboard: DashboardData | null;
  backlog: BacklogItem[];
  teamMessages: MessageItem[];
  personalMessages: MessageItem[];
  generatedTasks: TaskGenerationResponse | null;
  assignments: AssignmentResponse | null;
  loading: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  loadWorkspaces: () => Promise<void>;
  createWorkspace: (payload: { name: string; description: string; team_type: string }) => Promise<Workspace>;
  setCurrentWorkspace: (workspaceId: number) => Promise<void>;
  validateInvite: (inviteCode: string) => Promise<void>;
  joinInvite: (inviteCode: string) => Promise<void>;
  loadProjects: (workspaceId?: number) => Promise<void>;
  createProject: (payload: {
    name: string;
    description: string;
    goal: string;
    tech_stack: string[];
    priority: string;
    mvp_scope: string;
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
  generateTasks: () => Promise<void>;
  recommendAssignments: (backlogItemIds: number[]) => Promise<void>;
  sendTeamMessage: (content: string) => Promise<void>;
  sendPersonalMessage: (content: string) => Promise<void>;
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

export const useAppStore = create<AppState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: (() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  })(),
  workspaces: [],
  currentWorkspaceId: parseStoredNumber(WORKSPACE_KEY),
  inviteInfo: null,
  projects: [],
  currentProjectId: parseStoredNumber(PROJECT_KEY),
  members: [],
  dashboard: null,
  backlog: [],
  teamMessages: [],
  personalMessages: [],
  generatedTasks: null,
  assignments: null,
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
      set({
        token: null,
        user: null,
        workspaces: [],
        projects: [],
        currentWorkspaceId: null,
        currentProjectId: null,
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
      workspaces: [],
      currentWorkspaceId: null,
      inviteInfo: null,
      projects: [],
      currentProjectId: null,
      members: [],
      dashboard: null,
      backlog: [],
      teamMessages: [],
      personalMessages: [],
      generatedTasks: null,
      assignments: null,
      error: null,
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
      await get().loadProjects(currentWorkspaceId);
    } else {
      set({ projects: [], currentProjectId: null });
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
      set({
        workspaces,
        currentWorkspaceId: workspace.id,
        projects: [],
        currentProjectId: null,
      });
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
    set({ currentWorkspaceId: workspaceId, currentProjectId: null, members: [], backlog: [], dashboard: null });
    await get().loadProjects(workspaceId);
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
      set({ members: [], backlog: [], dashboard: null, generatedTasks: null, assignments: null });
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
    set({ currentProjectId: projectId });
    await get().loadProjectBundle(projectId);
  },

  loadProjectBundle: async (projectId) => {
    const token = get().token;
    const targetProjectId = projectId ?? get().currentProjectId;
    if (!token || !targetProjectId) return;

    const [members, dashboard, backlog] = await Promise.all([
      api.listMembers(token, targetProjectId),
      api.getDashboard(token, targetProjectId),
      api.listBacklog(token, targetProjectId),
    ]);

    set({ members, dashboard, backlog });
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
      set({ generatedTasks });
      await get().loadProjectBundle(projectId);
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
      set({ assignments });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to recommend assignments' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  sendTeamMessage: async (content) => {
    const token = get().token;
    const projectId = get().currentProjectId;
    if (!token || !projectId || !content.trim()) return;

    set((state) => ({
      teamMessages: [...state.teamMessages, { role: 'user', content }],
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
    const projectId = get().currentProjectId;
    if (!token || !projectId || !content.trim()) return;

    set((state) => ({
      personalMessages: [...state.personalMessages, { role: 'user', content }],
    }));

    try {
      const response = await api.sendPersonalMessage(token, projectId, content);
      appendAiMessage(set, 'personalMessages', response);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to send personal message' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

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
      },
    ],
  }));
}

function stringifyAnswer(answer: Record<string, unknown>): string {
  if (typeof answer.summary === 'string') {
    return answer.summary;
  }
  return JSON.stringify(answer, null, 2);
}
