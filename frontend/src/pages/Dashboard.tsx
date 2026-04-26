import { useEffect, useMemo, useState, type CSSProperties, type ComponentType, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  MessageSquare,
  Plus,
  PlugZap,
  RefreshCcw,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Users,
  Workflow,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  api,
  type IntegrationCatalogItem,
  type TeamMember,
  type WorkspaceIntegration,
} from '../lib/api';
import { useAppStore, type MessageItem } from '../store/appStore';

type TabKey = 'workspace' | 'project' | 'delivery' | 'members' | 'sharedRoom' | 'privateRoom';

type CatalogState = {
  loading: boolean;
  error: string | null;
  open: boolean;
  items: IntegrationCatalogItem[];
};

const panelStyle: CSSProperties = {
  padding: '24px',
  border: 'var(--whisper-border)',
  borderRadius: '16px',
  boxShadow: 'var(--card-shadow)',
  backgroundColor: 'white',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  fontSize: '14px',
  outline: 'none',
  backgroundColor: 'white',
  color: 'var(--notion-black)',
};

const textAreaStyle: CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: '120px',
  lineHeight: 1.55,
};

const SidebarItem = ({
  active,
  icon: Icon,
  label,
  caption,
  onClick,
}: {
  active?: boolean;
  icon: ComponentType<{ size?: number }>;
  label: string;
  caption: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      width: '100%',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '14px',
      borderRadius: '14px',
      border: 'none',
      textAlign: 'left',
      backgroundColor: active ? 'rgba(0, 117, 222, 0.08)' : 'transparent',
      color: active ? 'var(--notion-black)' : 'var(--warm-gray-500)',
    }}
  >
    <div
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        backgroundColor: active ? 'var(--badge-blue-bg)' : 'rgba(0, 0, 0, 0.04)',
        color: active ? 'var(--notion-blue)' : 'var(--warm-gray-500)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={18} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div className="body-semibold" style={{ marginBottom: '4px' }}>
        {label}
      </div>
      <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
        {caption}
      </div>
    </div>
  </button>
);

const Surface = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.24 }}
    style={{ ...panelStyle, ...style }}
  >
    {children}
  </motion.section>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    token,
    user,
    loading,
    error,
    clearError,
    logout,
    workspaces,
    currentWorkspaceId,
    inviteInfo,
    workspaceIntegrations,
    projects,
    currentProjectId,
    projectSettings,
    projectPermissions,
    members,
    dashboard,
    deliveryDashboard,
    personalRecommendation,
    memories,
    projectIntegrations,
    teamMessages,
    personalMessages,
    generatedTasks,
    assignments,
    confirmedAssignments,
    loadWorkspaces,
    loadCurrentInvite,
    loadWorkspaceIntegrations,
    setCurrentWorkspace,
    regenerateInvite,
    deactivateInvite,
    createProject,
    setCurrentProject,
    loadProjectBundle,
    saveProfile,
    generateTasks,
    recommendAssignments,
    confirmAssignments,
    sendTeamMessage,
    sendPersonalMessage,
    getIntegrationConnectUrl,
    attachProjectIntegration,
    removeProjectIntegration,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('workspace');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [catalogs, setCatalogs] = useState<Record<number, CatalogState>>({});
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    goal: '',
    tech_stack: 'FastAPI, React, PostgreSQL',
    priority: 'HIGH',
    mvp_scope: '',
    ai_prompt: '',
  });
  const [profileForm, setProfileForm] = useState({
    project_role: 'BACKEND',
    tech_stack: 'FastAPI, PostgreSQL',
    strong_tasks: 'API 설계, 인증, 데이터 모델링',
    disliked_tasks: '디자인',
    available_hours_per_day: 6,
    experience_level: 'INTERMEDIATE',
  });
  const [teamPrompt, setTeamPrompt] = useState('');
  const [personalPrompt, setPersonalPrompt] = useState('');

  useEffect(() => {
    if (workspaces.length === 0) {
      void loadWorkspaces();
    }
  }, [loadWorkspaces, workspaces.length]);

  useEffect(() => {
    if (currentWorkspaceId && !inviteInfo) {
      void loadCurrentInvite();
    }
  }, [currentWorkspaceId, inviteInfo, loadCurrentInvite]);

  useEffect(() => {
    const provider = searchParams.get('integration');
    const status = searchParams.get('status');
    const count = searchParams.get('count');
    if (!provider || status !== 'connected') return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('integration');
    nextParams.delete('status');
    nextParams.delete('count');
    setSearchParams(nextParams, { replace: true });

    const connectedText = count ? ` · 연결된 워크스페이스 ${count}개` : '';
    setNotice(`${providerLabel(provider)} 연동이 완료되었습니다${connectedText}.`);
    if (currentWorkspaceId) {
      void loadWorkspaceIntegrations(currentWorkspaceId);
    }
    if (currentProjectId) {
      void loadProjectBundle(currentProjectId);
    }
  }, [
    currentProjectId,
    currentWorkspaceId,
    loadProjectBundle,
    loadWorkspaceIntegrations,
    searchParams,
    setSearchParams,
  ]);

  const currentWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === currentWorkspaceId) ?? null,
    [currentWorkspaceId, workspaces]
  );
  const currentProject = useMemo(
    () => projects.find((project) => project.id === currentProjectId) ?? null,
    [currentProjectId, projects]
  );
  const myProjectProfile = useMemo(
    () => members.find((member) => member.user_id === user?.id)?.project_profile ?? null,
    [members, user?.id]
  );
  const isPm = useMemo(() => {
    if (projectPermissions) return projectPermissions.is_pm;
    return currentProject?.pm_id === user?.id;
  }, [currentProject?.pm_id, projectPermissions, user?.id]);

  useEffect(() => {
    if (!myProjectProfile) return;
    setProfileForm({
      project_role: myProjectProfile.project_role,
      tech_stack: myProjectProfile.tech_stack.join(', '),
      strong_tasks: myProjectProfile.strong_tasks.join(', '),
      disliked_tasks: myProjectProfile.disliked_tasks.join(', '),
      available_hours_per_day: myProjectProfile.available_hours_per_day,
      experience_level: myProjectProfile.experience_level,
    });
  }, [myProjectProfile]);

  const handleCreateProject = async () => {
    clearError();
    const createdProject = await createProject({
      ...projectForm,
      tech_stack: splitCsv(projectForm.tech_stack),
    });
    setProjectForm({
      name: '',
      description: '',
      goal: '',
      tech_stack: 'FastAPI, React, PostgreSQL',
      priority: 'HIGH',
      mvp_scope: '',
      ai_prompt: '',
    });
    await setCurrentProject(createdProject.id);
    setActiveTab('project');
    setNotice(`${createdProject.name} 프로젝트가 생성되었습니다.`);
  };

  const handleSaveProfile = async () => {
    clearError();
    await saveProfile({
      project_role: profileForm.project_role,
      tech_stack: splitCsv(profileForm.tech_stack),
      strong_tasks: splitCsv(profileForm.strong_tasks),
      disliked_tasks: splitCsv(profileForm.disliked_tasks),
      available_hours_per_day: Number(profileForm.available_hours_per_day),
      experience_level: profileForm.experience_level,
    });
    setNotice('프로젝트 참여 프로필을 저장했습니다.');
  };

  const handleCopyInvite = async () => {
    if (!inviteInfo?.invite_url) return;
    await navigator.clipboard.writeText(inviteInfo.invite_url);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 1800);
  };

  const handleConnectProvider = async (provider: 'jira' | 'linear') => {
    clearError();
    setConnectingProvider(provider);
    try {
      const redirectTo = `${window.location.origin}/dashboard`;
      const response = await getIntegrationConnectUrl(provider, redirectTo);
      if (!response.configured || !response.authorization_url) {
        setNotice(response.message ?? `${providerLabel(provider)} 연동이 아직 설정되지 않았습니다.`);
        return;
      }
      window.location.assign(response.authorization_url);
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleLoadCatalog = async (integration: WorkspaceIntegration) => {
    if (!token) return;
    const current = catalogs[integration.id];
    if (current?.open && current.items.length > 0) {
      setCatalogs((prev) => ({
        ...prev,
        [integration.id]: {
          ...prev[integration.id],
          open: false,
        },
      }));
      return;
    }

    setCatalogs((prev) => ({
      ...prev,
      [integration.id]: {
        loading: true,
        error: null,
        open: true,
        items: prev[integration.id]?.items ?? [],
      },
    }));

    try {
      const response = await api.getIntegrationCatalog(token, integration.id);
      setCatalogs((prev) => ({
        ...prev,
        [integration.id]: {
          loading: false,
          error: null,
          open: true,
          items: response.items,
        },
      }));
    } catch (catalogError) {
      setCatalogs((prev) => ({
        ...prev,
        [integration.id]: {
          loading: false,
          error: catalogError instanceof Error ? catalogError.message : '카탈로그를 불러오지 못했습니다.',
          open: true,
          items: [],
        },
      }));
    }
  };

  const handleAttachScope = async (integration: WorkspaceIntegration, item: IntegrationCatalogItem) => {
    clearError();
    await attachProjectIntegration({
      workspace_integration_id: integration.id,
      scope_type: integration.provider === 'jira' ? 'board' : 'team',
      scope_id: item.id,
      scope_name: item.name,
      settings: {
        key: item.key,
        url: item.url,
      },
    });
    setNotice(`${providerLabel(integration.provider)} ${item.name}을(를) 프로젝트에 연결했습니다.`);
  };

  const handleRemoveProjectIntegration = async (bindingId: number) => {
    clearError();
    await removeProjectIntegration(bindingId);
    setNotice('프로젝트 연결을 해제했습니다.');
  };

  const handleGeneratePlan = async () => {
    clearError();
    const plan = await generateTasks();
    if (plan.created_backlog_items.length > 0) {
      await recommendAssignments(plan.created_backlog_items);
    }
    setNotice('AI가 초기 실행 계획과 담당자 추천을 준비했습니다.');
  };

  const handleConfirmAssignments = async () => {
    clearError();
    const response = await confirmAssignments();
    setNotice(`담당자 배정을 ${response.created_issue_ids.length}건 반영했습니다.`);
  };

  const handleSendTeam = async () => {
    const next = teamPrompt.trim();
    if (!next) return;
    await sendTeamMessage(next);
    setTeamPrompt('');
  };

  const handleSendPersonal = async () => {
    const next = personalPrompt.trim();
    if (!next) return;
    await sendPersonalMessage(next);
    setPersonalPrompt('');
  };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              backgroundColor: 'var(--notion-black)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            UNS
          </div>
          <div>
            <div className="body-semibold" style={{ fontSize: '18px' }}>
              Project Hub
            </div>
            <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
              연결, 실행, AI 협업을 한 화면에서
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '6px' }}>
          <SidebarItem
            active={activeTab === 'workspace'}
            icon={Link2}
            label="워크스페이스"
            caption="초대 링크와 Jira/Linear 연결"
            onClick={() => setActiveTab('workspace')}
          />
          <SidebarItem
            active={activeTab === 'project'}
            icon={LayoutDashboard}
            label="프로젝트"
            caption="프로젝트 개요와 AI 실행 계획"
            onClick={() => setActiveTab('project')}
          />
          <SidebarItem
            active={activeTab === 'delivery'}
            icon={Workflow}
            label="딜리버리 연결"
            caption="보드와 팀을 프로젝트에 붙이기"
            onClick={() => setActiveTab('delivery')}
          />
          <SidebarItem
            active={activeTab === 'members'}
            icon={Users}
            label="팀 멤버"
            caption="역할과 작업 선호도 관리"
            onClick={() => setActiveTab('members')}
          />
          <SidebarItem
            active={activeTab === 'sharedRoom'}
            icon={MessageSquare}
            label="공유 AI 룸"
            caption="프로젝트 멤버가 함께 쓰는 1:N 방"
            onClick={() => setActiveTab('sharedRoom')}
          />
          <SidebarItem
            active={activeTab === 'privateRoom'}
            icon={User}
            label="개인 AI 룸"
            caption="내 작업에 집중하는 1:1 방"
            onClick={() => setActiveTab('privateRoom')}
          />
        </div>

        <div
          style={{
            marginTop: 'auto',
            padding: '18px',
            borderRadius: '16px',
            backgroundColor: 'var(--warm-white)',
            border: 'var(--whisper-border)',
          }}
        >
          <div className="body-semibold" style={{ marginBottom: '6px' }}>
            {user?.name}
          </div>
          <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)', marginBottom: '14px' }}>
            {currentWorkspace?.name ?? '워크스페이스를 선택해주세요'}
          </div>
          <button
            className="btn-secondary"
            style={{ width: '100%', padding: '10px 14px' }}
            onClick={() => {
              logout();
              navigate('/onboarding');
            }}
          >
            로그아웃
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <DropdownButton
              label="워크스페이스"
              value={currentWorkspace?.name ?? '선택 없음'}
              open={workspaceMenuOpen}
              onToggle={() => setWorkspaceMenuOpen((prev) => !prev)}
            >
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  style={dropdownItemStyle}
                  onClick={() => {
                    setWorkspaceMenuOpen(false);
                    void setCurrentWorkspace(workspace.id);
                  }}
                >
                  <div className="body-semibold">{workspace.name}</div>
                  <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
                    {workspace.workspace_role} · 팀원 {workspace.member_count}명
                  </div>
                </button>
              ))}
            </DropdownButton>

            <DropdownButton
              label="프로젝트"
              value={currentProject?.name ?? '선택 없음'}
              open={projectMenuOpen}
              onToggle={() => setProjectMenuOpen((prev) => !prev)}
            >
              {projects.length === 0 ? (
                <div style={{ padding: '12px 14px' }} className="body-text">
                  먼저 프로젝트를 만들어주세요.
                </div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    style={dropdownItemStyle}
                    onClick={() => {
                      setProjectMenuOpen(false);
                      void setCurrentProject(project.id);
                    }}
                  >
                    <div className="body-semibold">{project.name}</div>
                    <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
                      {project.priority} · PM #{project.pm_id}
                    </div>
                  </button>
                ))
              )}
            </DropdownButton>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {loading && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--warm-white)',
                  color: 'var(--warm-gray-500)',
                }}
                className="body-text"
              >
                <LoaderCircle size={16} className="spin-slow" />
                동기화 중
              </div>
            )}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '999px',
                backgroundColor: 'var(--badge-blue-bg)',
                color: 'var(--notion-blue)',
              }}
              className="badge-text"
            >
              {isPm ? 'PM 권한' : currentWorkspace?.workspace_role ?? 'MEMBER'}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {notice && (
            <Banner
              tone="info"
              title="안내"
              body={notice}
              actionLabel="닫기"
              onAction={() => setNotice(null)}
            />
          )}

          {error && (
            <Banner
              tone="error"
              title="오류"
              body={error}
              actionLabel="확인"
              onAction={clearError}
            />
          )}

          {activeTab === 'workspace' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <Surface>
                <SectionHeader
                  eyebrow="Workspace"
                  title="초대와 연동을 한 번에 관리하세요"
                  description="워크스페이스 초대 링크를 공유하고, Jira/Linear는 버튼 한 번으로 연결합니다."
                />
                <div className="responsive-grid-2" style={{ marginTop: '24px' }}>
                  <div
                    style={{
                      padding: '18px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--warm-white)',
                      border: 'var(--whisper-border)',
                    }}
                  >
                    <div className="body-semibold" style={{ marginBottom: '8px' }}>
                      초대 링크
                    </div>
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        border: 'var(--whisper-border)',
                        wordBreak: 'break-all',
                        marginBottom: '12px',
                      }}
                      className="body-text"
                    >
                      {inviteInfo?.invite_url ?? '초대 링크를 불러오는 중입니다.'}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button className="btn-primary" onClick={() => void handleCopyInvite()} disabled={!inviteInfo?.invite_url}>
                        <Copy size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        {copiedInvite ? '복사됨' : '링크 복사'}
                      </button>
                      <button className="btn-secondary" onClick={() => void regenerateInvite()}>
                        <RefreshCcw size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        재발급
                      </button>
                      <button className="btn-secondary" onClick={() => void deactivateInvite()}>
                        <Ban size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        비활성화
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '18px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--warm-white)',
                      border: 'var(--whisper-border)',
                    }}
                  >
                    <div className="body-semibold" style={{ marginBottom: '12px' }}>
                      현재 상태
                    </div>
                    <InfoRow label="워크스페이스" value={currentWorkspace?.name ?? '-'} />
                    <InfoRow label="설명" value={currentWorkspace?.description ?? '-'} />
                    <InfoRow label="역할" value={currentWorkspace?.workspace_role ?? '-'} />
                    <InfoRow label="팀원 수" value={`${inviteInfo?.member_count ?? currentWorkspace?.member_count ?? 0}명`} />
                    <InfoRow label="초대 상태" value={inviteInfo?.invite_code_active ? '활성' : '비활성'} />
                    <InfoRow label="최근 초대 사용" value={`${inviteInfo?.invite_code_used_count ?? 0}회`} />
                  </div>
                </div>
              </Surface>

              <Surface>
                <SectionHeader
                  eyebrow="Integrations"
                  title="Jira와 Linear를 Connect 버튼으로 연결하세요"
                  description="직접 ID를 입력하지 않고 OAuth로 먼저 연결한 뒤, 프로젝트에 필요한 보드나 팀만 선택해서 붙입니다."
                />

                <div className="responsive-grid-2" style={{ marginTop: '24px' }}>
                  {(['jira', 'linear'] as const).map((provider) => {
                    const connected = workspaceIntegrations.filter((item) => item.provider === provider);
                    const latest = connected[0];
                    return (
                      <ProviderCard
                        key={provider}
                        provider={provider}
                        connectedCount={connected.length}
                        subtitle={
                          latest
                            ? `${latest.external_workspace_name} · 마지막 갱신 ${formatDate(latest.updated_at)}`
                            : '아직 연결된 워크스페이스가 없습니다.'
                        }
                        actionLabel={latest ? '다시 연결하기' : 'Connect'}
                        loading={connectingProvider === provider}
                        onAction={() => void handleConnectProvider(provider)}
                      />
                    );
                  })}
                </div>

                <div style={{ marginTop: '24px', display: 'grid', gap: '14px' }}>
                  {workspaceIntegrations.length === 0 ? (
                    <EmptyState
                      icon={PlugZap}
                      title="아직 연결된 외부 워크스페이스가 없습니다"
                      description="위 Connect 버튼으로 Jira 또는 Linear 계정을 먼저 연결해 주세요."
                    />
                  ) : (
                    workspaceIntegrations.map((integration) => (
                      <div
                        key={integration.id}
                        style={{
                          padding: '18px',
                          borderRadius: '14px',
                          border: 'var(--whisper-border)',
                          backgroundColor: 'var(--warm-white)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <ProviderBadge provider={integration.provider} />
                            <span className="body-semibold">{integration.external_workspace_name}</span>
                          </div>
                          <div className="body-text" style={{ fontSize: '14px', color: 'var(--warm-gray-500)' }}>
                            상태 {integration.status.toLowerCase()} · 갱신 {formatDate(integration.updated_at)}
                          </div>
                        </div>
                        {integration.external_workspace_url && (
                          <a
                            href={integration.external_workspace_url}
                            target="_blank"
                            rel="noreferrer"
                            className="body-medium"
                            style={{ color: 'var(--notion-blue)', textDecoration: 'none' }}
                          >
                            워크스페이스 열기 <ExternalLink size={14} style={{ marginLeft: '6px', verticalAlign: 'middle' }} />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Surface>
            </div>
          )}

          {activeTab === 'project' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <Surface>
                <SectionHeader
                  eyebrow="Project"
                  title="프로젝트 기준으로 실행 흐름을 정리합니다"
                  description="프로젝트를 만들고, AI 실행 계획을 생성하고, 추천 담당자를 확정할 수 있습니다."
                />

                <div className="responsive-grid-2" style={{ marginTop: '24px' }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <input
                      placeholder="프로젝트 이름"
                      value={projectForm.name}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))}
                      style={inputStyle}
                    />
                    <textarea
                      placeholder="프로젝트 설명"
                      value={projectForm.description}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, description: event.target.value }))}
                      style={textAreaStyle}
                    />
                    <textarea
                      placeholder="이 프로젝트의 핵심 목표"
                      value={projectForm.goal}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, goal: event.target.value }))}
                      style={textAreaStyle}
                    />
                    <input
                      placeholder="기술 스택 (쉼표로 구분)"
                      value={projectForm.tech_stack}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, tech_stack: event.target.value }))}
                      style={inputStyle}
                    />
                    <textarea
                      placeholder="MVP 범위"
                      value={projectForm.mvp_scope}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, mvp_scope: event.target.value }))}
                      style={textAreaStyle}
                    />
                    <textarea
                      placeholder="AI에게 전달할 추가 컨텍스트"
                      value={projectForm.ai_prompt}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, ai_prompt: event.target.value }))}
                      style={{ ...textAreaStyle, minHeight: '96px' }}
                    />
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {['HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                        <button
                          key={priority}
                          className={projectForm.priority === priority ? 'btn-primary' : 'btn-secondary'}
                          onClick={() => setProjectForm((prev) => ({ ...prev, priority }))}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                    <button className="btn-primary" style={{ padding: '12px 18px' }} onClick={() => void handleCreateProject()}>
                      <Plus size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      프로젝트 만들기
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div
                      style={{
                        padding: '18px',
                        borderRadius: '14px',
                        backgroundColor: 'var(--warm-white)',
                        border: 'var(--whisper-border)',
                      }}
                    >
                      <div className="body-semibold" style={{ marginBottom: '6px' }}>
                        현재 프로젝트
                      </div>
                      <div className="card-title" style={{ marginBottom: '10px' }}>
                        {currentProject?.name ?? '선택된 프로젝트가 없습니다'}
                      </div>
                      <p className="body-text" style={{ color: 'var(--warm-gray-500)', marginBottom: '14px', wordBreak: 'keep-all' }}>
                        {currentProject?.description ?? '프로젝트를 만들면 여기에 개요와 실행 지표가 표시됩니다.'}
                      </p>
                      <TagList items={currentProject?.tech_stack ?? []} emptyText="기술 스택 없음" />
                      {projectSettings?.ai_prompt && (
                        <div
                          style={{
                            marginTop: '14px',
                            padding: '14px',
                            borderRadius: '12px',
                            backgroundColor: 'white',
                            border: 'var(--whisper-border)',
                          }}
                        >
                          <div className="body-semibold" style={{ marginBottom: '6px' }}>
                            AI 컨텍스트
                          </div>
                          <div className="body-text" style={{ fontSize: '14px', color: 'var(--warm-gray-500)' }}>
                            {projectSettings.ai_prompt}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="responsive-grid-2">
                      <MetricCard label="전체 작업" value={String(dashboard?.total_issues ?? 0)} />
                      <MetricCard label="완료 작업" value={String(dashboard?.completed_issues ?? 0)} />
                      <MetricCard label="진행 중" value={String(dashboard?.in_progress_issues ?? 0)} />
                      <MetricCard label="진척도" value={`${dashboard?.sprint_progress ?? deliveryDashboard?.summary.completion_rate ?? 0}%`} />
                    </div>

                    <div
                      style={{
                        padding: '18px',
                        borderRadius: '14px',
                        border: 'var(--whisper-border)',
                        backgroundColor: 'white',
                      }}
                    >
                      <div className="body-semibold" style={{ marginBottom: '8px' }}>
                        현재 병목
                      </div>
                      <div className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                        {dashboard?.bottleneck_summary ?? '프로젝트를 선택하면 현재 병목과 추천 작업이 표시됩니다.'}
                      </div>
                    </div>
                  </div>
                </div>
              </Surface>

              <Surface>
                <SectionHeader
                  eyebrow="AI Launch"
                  title="기존 백로그/스프린트 화면 대신 AI 실행 플로우로 정리했습니다"
                  description="AI가 실행 작업을 제안하고, 추천 담당자를 뽑고, PM이 최종 확정하는 흐름입니다."
                />

                {!currentProject ? (
                  <div style={{ marginTop: '24px' }}>
                    <EmptyState
                      icon={FolderKanban}
                      title="먼저 프로젝트를 선택해 주세요"
                      description="프로젝트가 있어야 AI가 팀 정보와 목표를 기반으로 실행 계획을 만들 수 있습니다."
                    />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '20px', marginTop: '24px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button className="btn-primary" onClick={() => void handleGeneratePlan()} disabled={!isPm}>
                        <Sparkles size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        AI 실행 계획 만들기
                      </button>
                      <button className="btn-secondary" onClick={() => setActiveTab('members')}>
                        팀 프로필 확인
                      </button>
                      {!isPm && (
                        <span className="body-text" style={{ color: 'var(--warm-gray-500)', alignSelf: 'center' }}>
                          계획 생성과 담당자 확정은 PM 권한에서 진행합니다.
                        </span>
                      )}
                    </div>

                    {generatedTasks && (
                      <div style={{ display: 'grid', gap: '14px' }}>
                        <div className="body-semibold">AI가 제안한 실행 작업</div>
                        <div className="responsive-grid-2">
                          {generatedTasks.tasks.map((task) => (
                            <div
                              key={`${task.title}-${task.required_role}`}
                              style={{
                                padding: '18px',
                                borderRadius: '14px',
                                backgroundColor: 'var(--warm-white)',
                                border: 'var(--whisper-border)',
                              }}
                            >
                              <div className="body-semibold" style={{ marginBottom: '8px' }}>
                                {task.title}
                              </div>
                              <div className="body-text" style={{ fontSize: '14px', color: 'var(--warm-gray-500)', marginBottom: '14px' }}>
                                {task.description}
                              </div>
                              <TagList
                                items={[
                                  task.required_role,
                                  ...task.required_tech_stack,
                                  `${task.estimated_hours}h`,
                                  task.priority,
                                  task.difficulty,
                                ]}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {assignments && (
                      <div style={{ display: 'grid', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                          <div className="body-semibold">추천 담당자</div>
                          <button className="btn-primary" onClick={() => void handleConfirmAssignments()} disabled={!isPm}>
                            <ShieldCheck size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            담당자 확정
                          </button>
                        </div>

                        <div style={{ display: 'grid', gap: '14px' }}>
                          {assignments.assignments.map((assignment) => (
                            <div
                              key={assignment.backlog_item_id}
                              style={{
                                padding: '18px',
                                borderRadius: '14px',
                                border: 'var(--whisper-border)',
                                backgroundColor: 'white',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                <div>
                                  <div className="body-semibold">{assignment.title}</div>
                                  <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
                                    추천 담당자 {assignment.recommended_assignee_name ?? '없음'}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '999px',
                                    backgroundColor: 'var(--badge-blue-bg)',
                                    color: 'var(--notion-blue)',
                                  }}
                                  className="badge-text"
                                >
                                  {assignment.recommended_assignee_name ? '추천 완료' : '재검토 필요'}
                                </div>
                              </div>
                              <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginBottom: '12px' }}>
                                {assignment.recommendation_reason}
                              </div>
                              <div className="responsive-grid-2">
                                {assignment.candidates.map((candidate) => (
                                  <div
                                    key={candidate.user_id}
                                    style={{
                                      padding: '14px',
                                      borderRadius: '12px',
                                      backgroundColor: 'var(--warm-white)',
                                      border: 'var(--whisper-border)',
                                    }}
                                  >
                                    <div className="body-semibold" style={{ marginBottom: '4px' }}>
                                      {candidate.user_name}
                                    </div>
                                    <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)', marginBottom: '8px' }}>
                                      {candidate.stars} · 점수 {candidate.score}
                                    </div>
                                    <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
                                      {candidate.reasons.join(' / ')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {confirmedAssignments && (
                      <div
                        style={{
                          padding: '16px 18px',
                          borderRadius: '14px',
                          backgroundColor: '#effaf3',
                          color: '#067647',
                          border: '1px solid rgba(6, 118, 71, 0.18)',
                        }}
                        className="body-medium"
                      >
                        <CheckCircle2 size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        추천 담당자 반영이 완료되었습니다. 총 {confirmedAssignments.created_issue_ids.length}건이 저장되었습니다.
                      </div>
                    )}
                  </div>
                )}
              </Surface>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <Surface>
                <SectionHeader
                  eyebrow="Delivery"
                  title="연결된 Jira/Linear 범위를 프로젝트에 붙여주세요"
                  description="워크스페이스 연결 후 보드나 팀을 선택해서 프로젝트 범위와 연결하면, 외부 진행 현황이 자동으로 집계됩니다."
                />

                {!currentProject ? (
                  <div style={{ marginTop: '24px' }}>
                    <EmptyState
                      icon={Target}
                      title="프로젝트를 먼저 선택해 주세요"
                      description="연결된 워크스페이스는 있어도, 프로젝트가 선택되어야 보드/팀을 붙일 수 있습니다."
                    />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '20px', marginTop: '24px' }}>
                    <div style={{ display: 'grid', gap: '14px' }}>
                      <div className="body-semibold">현재 프로젝트 연결</div>
                      {projectIntegrations.length === 0 ? (
                        <EmptyState
                          icon={Link2}
                          title="아직 연결된 보드나 팀이 없습니다"
                          description="아래 카탈로그에서 필요한 보드 또는 팀을 선택해 프로젝트에 연결하세요."
                        />
                      ) : (
                        <div className="responsive-grid-2">
                          {projectIntegrations.map((integration) => (
                            <div
                              key={integration.id}
                              style={{
                                padding: '18px',
                                borderRadius: '14px',
                                border: 'var(--whisper-border)',
                                backgroundColor: 'white',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                    <ProviderBadge provider={integration.provider} />
                                    <span className="body-semibold">{integration.scope_name}</span>
                                  </div>
                                  <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
                                    {integration.scope_type} · {integration.scope_id}
                                  </div>
                                </div>
                                {isPm && (
                                  <button className="btn-secondary" onClick={() => void handleRemoveProjectIntegration(integration.id)}>
                                    연결 해제
                                  </button>
                                )}
                              </div>
                              {typeof integration.settings.key === 'string' && integration.settings.key.trim().length > 0 && (
                                <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
                                  키 {String(integration.settings.key)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gap: '14px' }}>
                      <div className="body-semibold">연결 가능한 범위</div>
                      {workspaceIntegrations.length === 0 ? (
                        <EmptyState
                          icon={PlugZap}
                          title="먼저 워크스페이스 연동이 필요합니다"
                          description="Workspace 탭으로 이동해서 Jira 또는 Linear Connect 버튼을 눌러주세요."
                        />
                      ) : (
                        workspaceIntegrations.map((integration) => {
                          const catalog = catalogs[integration.id];
                          return (
                            <div
                              key={integration.id}
                              style={{
                                padding: '18px',
                                borderRadius: '14px',
                                backgroundColor: 'var(--warm-white)',
                                border: 'var(--whisper-border)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                    <ProviderBadge provider={integration.provider} />
                                    <span className="body-semibold">{integration.external_workspace_name}</span>
                                  </div>
                                  <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
                                    필요한 {integration.provider === 'jira' ? '보드' : '팀'}를 불러와서 프로젝트와 연결하세요.
                                  </div>
                                </div>
                                <button className="btn-secondary" onClick={() => void handleLoadCatalog(integration)}>
                                  {catalog?.loading ? '불러오는 중...' : integration.provider === 'jira' ? '보드 불러오기' : '팀 불러오기'}
                                </button>
                              </div>

                              {catalog?.open && (
                                <div style={{ display: 'grid', gap: '10px' }}>
                                  {catalog.error && (
                                    <div className="body-text" style={{ color: '#b42318' }}>
                                      {catalog.error}
                                    </div>
                                  )}
                                  {catalog.items.length === 0 && !catalog.loading && !catalog.error && (
                                    <div className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                                      표시할 항목이 없습니다.
                                    </div>
                                  )}
                                  {catalog.items.map((item) => {
                                    const alreadyConnected = projectIntegrations.some(
                                      (binding) => binding.provider === integration.provider && binding.scope_id === item.id
                                    );
                                    return (
                                      <div
                                        key={item.id}
                                        style={{
                                          padding: '14px',
                                          borderRadius: '12px',
                                          backgroundColor: 'white',
                                          border: 'var(--whisper-border)',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          gap: '12px',
                                          flexWrap: 'wrap',
                                        }}
                                      >
                                        <div>
                                          <div className="body-semibold">{item.name}</div>
                                          <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
                                            {item.key ? `${item.key} · ` : ''}
                                            {item.id}
                                          </div>
                                        </div>
                                        <button
                                          className={alreadyConnected ? 'btn-secondary' : 'btn-primary'}
                                          disabled={alreadyConnected || !isPm}
                                          onClick={() => void handleAttachScope(integration, item)}
                                        >
                                          {alreadyConnected ? '연결됨' : '프로젝트에 연결'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </Surface>

              <Surface>
                <SectionHeader
                  eyebrow="Delivery View"
                  title="프로젝트 외부 진행 상황"
                  description="Jira/Linear에서 연결된 범위를 한 번에 집계해 현재 딜리버리 상태를 보여줍니다."
                />

                {!deliveryDashboard ? (
                  <div style={{ marginTop: '24px' }}>
                    <EmptyState
                      icon={Rocket}
                      title="연결된 외부 진행 현황이 아직 없습니다"
                      description="보드나 팀을 프로젝트에 연결하면 여기서 작업 현황과 경고를 볼 수 있습니다."
                    />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '20px', marginTop: '24px' }}>
                    <div className="responsive-grid-3">
                      <MetricCard label="전체 외부 작업" value={String(deliveryDashboard.summary.total_items)} />
                      <MetricCard label="완료율" value={`${deliveryDashboard.summary.completion_rate}%`} />
                      <MetricCard label="미매핑 작업" value={String(deliveryDashboard.unmapped_items)} />
                    </div>

                    {deliveryDashboard.integration_warnings.length > 0 && (
                      <div
                        style={{
                          padding: '16px 18px',
                          borderRadius: '14px',
                          backgroundColor: '#fff6ed',
                          border: '1px solid rgba(234, 88, 12, 0.18)',
                        }}
                      >
                        <div className="body-semibold" style={{ marginBottom: '8px', color: '#c2410c' }}>
                          연동 경고
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {deliveryDashboard.integration_warnings.map((warning) => (
                            <div key={warning} className="body-text" style={{ color: '#9a3412' }}>
                              {warning}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {deliveryDashboard.sources.length > 0 && (
                      <div style={{ display: 'grid', gap: '14px' }}>
                        <div className="body-semibold">소스별 요약</div>
                        <div className="responsive-grid-2">
                          {deliveryDashboard.sources.map((source) => (
                            <div
                              key={source.key}
                              style={{
                                padding: '18px',
                                borderRadius: '14px',
                                backgroundColor: 'var(--warm-white)',
                                border: 'var(--whisper-border)',
                              }}
                            >
                              <div className="body-semibold" style={{ marginBottom: '10px' }}>
                                {source.label}
                              </div>
                              <div className="body-text" style={{ fontSize: '14px', color: 'var(--warm-gray-500)' }}>
                                전체 {source.summary.total_items} · 진행 {source.summary.in_progress_items} · 완료 {source.summary.done_items}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gap: '14px' }}>
                      <div className="body-semibold">활성 작업</div>
                      {deliveryDashboard.active_items.length === 0 ? (
                        <EmptyState
                          icon={Workflow}
                          title="현재 활성화된 작업이 없습니다"
                          description="연결된 보드/팀의 현재 진행 작업이 있으면 여기에 표시됩니다."
                        />
                      ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {deliveryDashboard.active_items.map((item) => (
                            <div
                              key={`${item.source}-${item.external_id}`}
                              style={{
                                padding: '18px',
                                borderRadius: '14px',
                                border: 'var(--whisper-border)',
                                backgroundColor: 'white',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                <div>
                                  <div className="body-semibold" style={{ marginBottom: '6px' }}>
                                    {item.title}
                                  </div>
                                  <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
                                    {providerLabel(item.source)} · {item.scope_name} · {item.status_name}
                                  </div>
                                </div>
                                <StatusChip label={humanizeStatus(item.status_category)} tone={item.status_category} />
                              </div>
                              <div className="body-text" style={{ fontSize: '14px', color: 'var(--warm-gray-500)' }}>
                                담당자 {item.assignee_name ?? '미지정'} · 우선순위 {item.priority ?? '미설정'} · 라벨 {item.labels.join(', ') || '없음'}
                              </div>
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="body-medium"
                                  style={{ color: 'var(--notion-blue)', textDecoration: 'none', marginTop: '10px', display: 'inline-flex', alignItems: 'center' }}
                                >
                                  원본 열기 <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Surface>
            </div>
          )}

          {activeTab === 'members' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <Surface>
                <SectionHeader
                  eyebrow="Members"
                  title="팀원의 역할과 선호도를 프로젝트 맥락에 맞게 정리하세요"
                  description="AI 추천 품질은 팀 프로필 정보에 크게 의존하므로, 기술 스택과 강점/비선호 업무를 프로젝트 기준으로 적어두는 것이 중요합니다."
                />

                {!currentProject ? (
                  <div style={{ marginTop: '24px' }}>
                    <EmptyState
                      icon={Users}
                      title="프로젝트를 먼저 선택해 주세요"
                      description="프로젝트가 있어야 참여 프로필을 저장하고 팀 구성을 확인할 수 있습니다."
                    />
                  </div>
                ) : (
                  <div className="responsive-grid-2" style={{ marginTop: '24px' }}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <input
                        value={profileForm.project_role}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, project_role: event.target.value }))}
                        style={inputStyle}
                        placeholder="프로젝트 역할"
                      />
                      <input
                        value={profileForm.tech_stack}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, tech_stack: event.target.value }))}
                        style={inputStyle}
                        placeholder="기술 스택 (쉼표로 구분)"
                      />
                      <textarea
                        value={profileForm.strong_tasks}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, strong_tasks: event.target.value }))}
                        style={{ ...textAreaStyle, minHeight: '100px' }}
                        placeholder="강점 업무"
                      />
                      <textarea
                        value={profileForm.disliked_tasks}
                        onChange={(event) => setProfileForm((prev) => ({ ...prev, disliked_tasks: event.target.value }))}
                        style={{ ...textAreaStyle, minHeight: '100px' }}
                        placeholder="비선호 업무"
                      />
                      <div className="responsive-grid-2" style={{ gap: '12px' }}>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={profileForm.available_hours_per_day}
                          onChange={(event) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              available_hours_per_day: Number(event.target.value),
                            }))
                          }
                          style={inputStyle}
                          placeholder="하루 가능 시간"
                        />
                        <input
                          value={profileForm.experience_level}
                          onChange={(event) =>
                            setProfileForm((prev) => ({ ...prev, experience_level: event.target.value }))
                          }
                          style={inputStyle}
                          placeholder="경험 수준"
                        />
                      </div>
                      <button className="btn-primary" onClick={() => void handleSaveProfile()}>
                        저장하기
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: '12px' }}>
                      {members.length === 0 ? (
                        <EmptyState
                          icon={Users}
                          title="아직 참여한 팀원이 없습니다"
                          description="초대 링크로 팀원을 먼저 모아주세요."
                        />
                      ) : (
                        members.map((member) => (
                          <div
                            key={member.user_id}
                            style={{
                              padding: '18px',
                              borderRadius: '14px',
                              backgroundColor: 'var(--warm-white)',
                              border: 'var(--whisper-border)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                              <div>
                                <div className="body-semibold">{member.user_name}</div>
                                <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
                                  {member.workspace_role} · {member.project_profile?.project_role ?? '프로필 미입력'}
                                </div>
                              </div>
                              {currentProject?.pm_id === member.user_id && <StatusChip label="PM" tone="done" />}
                            </div>
                            <TagList
                              items={[
                                ...(member.project_profile?.tech_stack ?? []),
                                member.project_profile
                                  ? `${member.project_profile.available_hours_per_day}h/day`
                                  : '시간 정보 없음',
                              ]}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </Surface>
            </div>
          )}

          {activeTab === 'sharedRoom' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <Surface>
                <SectionHeader
                  eyebrow="Shared AI Room"
                  title="프로젝트 멤버가 함께 쓰는 1:N AI 룸"
                  description="백엔드의 TEAM_AI 방을 기준으로, 프로젝트 전체 맥락을 공유하는 공동 대화방 구조로 정리했습니다."
                />
                {!currentProject ? (
                  <div style={{ marginTop: '24px' }}>
                    <EmptyState
                      icon={MessageSquare}
                      title="프로젝트를 먼저 선택해 주세요"
                      description="공유 AI 룸은 프로젝트 단위로 생성되고 모든 멤버가 같은 히스토리를 봅니다."
                    />
                  </div>
                ) : (
                  <div className="chat-layout" style={{ marginTop: '24px' }}>
                    <ChatSurface
                      title={`${currentProject.name} 공유 AI 룸`}
                      description="팀 방향, 우선순위, 다음 실행 조각을 함께 묻는 공간입니다."
                      messages={teamMessages}
                      members={members}
                      currentUserId={user?.id ?? null}
                      prompt={teamPrompt}
                      onChangePrompt={setTeamPrompt}
                      onSend={() => void handleSendTeam()}
                      placeholder="예: 지금 MVP에서 가장 먼저 끝내야 할 작업 순서를 정리해줘"
                    />
                    <SideContextPanel
                      title="이 방의 참여자"
                      subtitle={`${members.length}명이 같은 방을 공유합니다.`}
                      items={members.map((member) => ({
                        title: member.user_name,
                        description: `${member.project_profile?.project_role ?? '역할 미설정'} · ${member.workspace_role}`,
                      }))}
                      extra={
                        deliveryDashboard?.integration_warnings?.length ? (
                          <div
                            style={{
                              marginTop: '16px',
                              padding: '14px',
                              borderRadius: '12px',
                              backgroundColor: '#fff6ed',
                              color: '#9a3412',
                            }}
                            className="body-text"
                          >
                            {deliveryDashboard.integration_warnings[0]}
                          </div>
                        ) : null
                      }
                    />
                  </div>
                )}
              </Surface>
            </div>
          )}

          {activeTab === 'privateRoom' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <Surface>
                <SectionHeader
                  eyebrow="Private AI Room"
                  title="개인 집중을 위한 1:1 AI 룸"
                  description="개인 룸은 내 담당 업무와 다음 추천 작업을 바탕으로 응답합니다."
                />
                {!currentProject ? (
                  <div style={{ marginTop: '24px' }}>
                    <EmptyState
                      icon={User}
                      title="프로젝트를 먼저 선택해 주세요"
                      description="개인 AI 룸은 프로젝트별 컨텍스트 위에서 동작합니다."
                    />
                  </div>
                ) : (
                  <div className="chat-layout" style={{ marginTop: '24px' }}>
                    <div style={{ display: 'grid', gap: '18px' }}>
                      <div className="responsive-grid-2">
                        <MetricCard
                          label="현재 담당 작업"
                          value={String(personalRecommendation?.current_assignments.length ?? 0)}
                        />
                        <MetricCard
                          label="추천 다음 작업"
                          value={String(personalRecommendation?.recommended_backlog.length ?? 0)}
                        />
                      </div>

                      <div className="responsive-grid-2">
                        <ContextListCard
                          title="현재 담당"
                          items={(personalRecommendation?.current_assignments ?? []).map((item, index) => ({
                            key: `${index}-${pickText(item, ['title', 'name', 'external_id'])}`,
                            title: pickText(item, ['title', 'name', 'external_id']) ?? `현재 작업 ${index + 1}`,
                            description: joinValues([
                              pickText(item, ['status', 'status_name']),
                              pickText(item, ['priority', 'source']),
                            ]),
                          }))}
                          emptyText="현재 할당된 작업이 없습니다."
                        />
                        <ContextListCard
                          title="추천 다음 작업"
                          items={(personalRecommendation?.recommended_backlog ?? []).map((item, index) => ({
                            key: `${index}-${pickText(item, ['title', 'name', 'external_id'])}`,
                            title: pickText(item, ['title', 'name', 'external_id']) ?? `추천 작업 ${index + 1}`,
                            description: joinValues([
                              pickText(item, ['priority', 'required_role']),
                              pickText(item, ['status', 'source']),
                            ]),
                          }))}
                          emptyText="추천할 작업이 없습니다."
                        />
                      </div>

                      <ChatSurface
                        title="개인 AI 룸"
                        description={personalRecommendation?.summary ?? '현재 컨텍스트를 바탕으로 개인 실행 순서를 정리해드립니다.'}
                        messages={personalMessages}
                        members={members}
                        currentUserId={user?.id ?? null}
                        prompt={personalPrompt}
                        onChangePrompt={setPersonalPrompt}
                        onSend={() => void handleSendPersonal()}
                        placeholder="예: 오늘 3시간 안에 끝낼 수 있게 내 작업을 쪼개줘"
                      />
                    </div>
                    <SideContextPanel
                      title="최근 프로젝트 메모"
                      subtitle="최근 맥락이 AI 응답에 함께 반영됩니다."
                      items={memories.slice(0, 5).map((memory) => ({
                        title: memory.title,
                        description: memory.content,
                      }))}
                      extra={
                        personalRecommendation?.context_notes?.length ? (
                          <div style={{ marginTop: '16px', display: 'grid', gap: '8px' }}>
                            {personalRecommendation.context_notes.map((note) => (
                              <div
                                key={note}
                                style={{
                                  padding: '12px 14px',
                                  borderRadius: '12px',
                                  backgroundColor: 'var(--warm-white)',
                                }}
                                className="body-text"
                              >
                                {note}
                              </div>
                            ))}
                          </div>
                        ) : null
                      }
                    />
                  </div>
                )}
              </Surface>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const DropdownButton = ({
  label,
  value,
  open,
  onToggle,
  children,
}: {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) => (
  <div style={{ position: 'relative' }}>
    <button
      className="btn-secondary"
      onClick={onToggle}
      style={{
        minWidth: '220px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
      }}
    >
      <div style={{ textAlign: 'left' }}>
        <div className="badge-text" style={{ color: 'var(--warm-gray-500)', marginBottom: '2px' }}>
          {label}
        </div>
        <div className="body-semibold">{value}</div>
      </div>
      <ChevronDown size={16} />
    </button>

    {open && (
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          width: 'min(360px, 90vw)',
          backgroundColor: 'white',
          border: 'var(--whisper-border)',
          borderRadius: '16px',
          boxShadow: 'var(--deep-shadow)',
          padding: '8px',
          zIndex: 20,
          maxHeight: '360px',
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    )}
  </div>
);

const dropdownItemStyle: CSSProperties = {
  width: '100%',
  textAlign: 'left',
  padding: '12px 14px',
  borderRadius: '12px',
  backgroundColor: 'transparent',
  border: 'none',
};

const Banner = ({
  tone,
  title,
  body,
  actionLabel,
  onAction,
}: {
  tone: 'info' | 'error';
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) => {
  const palette =
    tone === 'info'
      ? { background: '#eef6ff', border: 'rgba(0, 117, 222, 0.16)', text: 'var(--notion-blue)' }
      : { background: '#fff4f4', border: 'rgba(180, 35, 24, 0.16)', text: '#b42318' };

  return (
    <div
      style={{
        marginBottom: '16px',
        padding: '14px 18px',
        borderRadius: '14px',
        backgroundColor: palette.background,
        border: `1px solid ${palette.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div className="body-semibold" style={{ color: palette.text, marginBottom: '4px' }}>
          {title}
        </div>
        <div className="body-text" style={{ color: tone === 'info' ? 'var(--warm-gray-500)' : '#7a271a' }}>
          {body}
        </div>
      </div>
      <button className="btn-secondary" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
};

const SectionHeader = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <div>
    <div className="badge-text" style={{ color: 'var(--notion-blue)', marginBottom: '10px' }}>
      {eyebrow}
    </div>
    <h2 className="card-title" style={{ fontSize: '28px', marginBottom: '10px' }}>
      {title}
    </h2>
    <p className="body-text" style={{ color: 'var(--warm-gray-500)', maxWidth: '860px', wordBreak: 'keep-all' }}>
      {description}
    </p>
  </div>
);

const ProviderCard = ({
  provider,
  connectedCount,
  subtitle,
  actionLabel,
  loading,
  onAction,
}: {
  provider: 'jira' | 'linear';
  connectedCount: number;
  subtitle: string;
  actionLabel: string;
  loading?: boolean;
  onAction: () => void;
}) => (
  <div
    style={{
      padding: '20px',
      borderRadius: '16px',
      background: provider === 'jira' ? 'linear-gradient(180deg, #f4f9ff 0%, white 100%)' : 'linear-gradient(180deg, #f7fbf4 0%, white 100%)',
      border: 'var(--whisper-border)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
      <ProviderBadge provider={provider} />
      <div
        style={{
          padding: '8px 12px',
          borderRadius: '999px',
          backgroundColor: 'white',
          border: 'var(--whisper-border)',
        }}
        className="badge-text"
      >
        {connectedCount} connected
      </div>
    </div>
    <div className="card-title" style={{ fontSize: '22px', marginBottom: '8px' }}>
      {providerLabel(provider)}
    </div>
    <div className="body-text" style={{ fontSize: '14px', color: 'var(--warm-gray-500)', marginBottom: '16px' }}>
      {subtitle}
    </div>
    <button className="btn-primary" onClick={onAction}>
      {loading ? '이동 준비 중...' : actionLabel}
    </button>
  </div>
);

const ProviderBadge = ({ provider }: { provider: string }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '999px',
      backgroundColor: provider === 'jira' ? '#e8f1ff' : '#eef9ec',
      color: provider === 'jira' ? '#0057d9' : '#2f6b22',
    }}
    className="badge-text"
  >
    <PlugZap size={14} />
    {providerLabel(provider)}
  </span>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '10px 0',
      borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    }}
  >
    <span className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
      {label}
    </span>
    <span className="body-medium" style={{ textAlign: 'right' }}>
      {value}
    </span>
  </div>
);

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      padding: '18px',
      borderRadius: '14px',
      backgroundColor: 'var(--warm-white)',
      border: 'var(--whisper-border)',
    }}
  >
    <div className="body-text" style={{ color: 'var(--warm-gray-500)', fontSize: '14px', marginBottom: '8px' }}>
      {label}
    </div>
    <div className="section-heading" style={{ fontSize: '34px', lineHeight: 1 }}>
      {value}
    </div>
  </div>
);

const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  description: string;
}) => (
  <div
    style={{
      padding: '28px',
      borderRadius: '16px',
      backgroundColor: 'var(--warm-white)',
      border: 'var(--whisper-border)',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: '56px',
        height: '56px',
        margin: '0 auto 16px',
        borderRadius: '16px',
        backgroundColor: 'white',
        border: 'var(--whisper-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--warm-gray-500)',
      }}
    >
      <Icon size={24} />
    </div>
    <div className="body-semibold" style={{ marginBottom: '8px' }}>
      {title}
    </div>
    <div className="body-text" style={{ color: 'var(--warm-gray-500)', wordBreak: 'keep-all' }}>
      {description}
    </div>
  </div>
);

const StatusChip = ({
  label,
  tone,
}: {
  label: string;
  tone: 'backlog' | 'in_progress' | 'done' | 'canceled';
}) => {
  const palette =
    tone === 'done'
      ? { background: '#effaf3', color: '#067647' }
      : tone === 'in_progress'
        ? { background: '#eef6ff', color: '#0057d9' }
        : tone === 'canceled'
          ? { background: '#f4f4f5', color: '#52525b' }
          : { background: '#fff6ed', color: '#c2410c' };

  return (
    <span
      style={{
        padding: '8px 12px',
        borderRadius: '999px',
        backgroundColor: palette.background,
        color: palette.color,
      }}
      className="badge-text"
    >
      {label}
    </span>
  );
};

const TagList = ({ items, emptyText }: { items: string[]; emptyText?: string }) => {
  if (items.length === 0) {
    return (
      <div className="body-text" style={{ color: 'var(--warm-gray-500)', fontSize: '14px' }}>
        {emptyText ?? '표시할 항목이 없습니다.'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {items.map((item) => (
        <span
          key={item}
          style={{
            padding: '7px 10px',
            borderRadius: '999px',
            backgroundColor: 'white',
            border: 'var(--whisper-border)',
          }}
          className="badge-text"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

const ChatSurface = ({
  title,
  description,
  messages,
  members,
  currentUserId,
  prompt,
  onChangePrompt,
  onSend,
  placeholder,
}: {
  title: string;
  description: string;
  messages: MessageItem[];
  members: TeamMember[];
  currentUserId: number | null;
  prompt: string;
  onChangePrompt: (value: string) => void;
  onSend: () => void;
  placeholder: string;
}) => (
  <div
    style={{
      ...panelStyle,
      padding: '20px',
      display: 'grid',
      gap: '16px',
    }}
  >
    <div>
      <div className="card-title" style={{ marginBottom: '8px' }}>
        {title}
      </div>
      <div className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
        {description}
      </div>
    </div>

    <div
      style={{
        minHeight: '420px',
        maxHeight: '620px',
        overflowY: 'auto',
        display: 'grid',
        gap: '12px',
        paddingRight: '4px',
      }}
    >
      {messages.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="첫 메시지를 보내보세요"
          description="대화가 시작되면 이 방의 히스토리가 여기에 쌓입니다."
        />
      ) : (
        messages.map((message, index) => (
          <MessageBubble
            key={`${message.id ?? index}-${message.createdAt ?? index}`}
            message={message}
            isMine={message.role === 'user' && message.senderId === currentUserId}
            senderName={resolveSenderName(message, members, currentUserId)}
          />
        ))
      )}
    </div>

    <div style={{ display: 'grid', gap: '10px' }}>
      <textarea
        value={prompt}
        onChange={(event) => onChangePrompt(event.target.value)}
        placeholder={placeholder}
        style={{ ...textAreaStyle, minHeight: '110px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
          Shift+Enter 없이 바로 전송됩니다.
        </div>
        <button className="btn-primary" onClick={onSend}>
          <Send size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          전송
        </button>
      </div>
    </div>
  </div>
);

const MessageBubble = ({
  message,
  isMine,
  senderName,
}: {
  message: MessageItem;
  isMine: boolean;
  senderName: string;
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: message.role === 'ai' ? 'flex-start' : isMine ? 'flex-end' : 'flex-start',
    }}
  >
    <div
      style={{
        maxWidth: 'min(720px, 100%)',
        padding: '16px',
        borderRadius: '18px',
        backgroundColor: message.role === 'ai' ? 'var(--warm-white)' : isMine ? 'var(--notion-blue)' : '#edf1f5',
        color: message.role === 'ai' ? 'var(--notion-black)' : isMine ? 'white' : 'var(--notion-black)',
        border: message.role === 'ai' ? 'var(--whisper-border)' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div className="badge-text" style={{ color: message.role === 'ai' ? 'var(--notion-blue)' : 'inherit', opacity: 0.9 }}>
          {message.role === 'ai' ? 'AI' : senderName}
        </div>
        {message.createdAt && (
          <div className="badge-text" style={{ opacity: 0.72 }}>
            {formatDate(message.createdAt, true)}
          </div>
        )}
      </div>

      <div className="body-text" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
        {message.content}
      </div>

      {message.role === 'ai' && message.payload && <PayloadPreview payload={message.payload} />}
    </div>
  </div>
);

const PayloadPreview = ({ payload }: { payload: Record<string, unknown> }) => {
  const notes = asStringArray(payload.context_notes);
  const order = asStringArray(payload.recommended_order);
  const nextAction = typeof payload.next_action === 'string' ? payload.next_action : null;
  const question = typeof payload.question === 'string' ? payload.question : null;

  return (
    <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
      {nextAction && (
        <PayloadCard icon={Rocket} title="다음 액션" body={nextAction} />
      )}
      {notes.length > 0 && (
        <PayloadListCard icon={AlertTriangle} title="컨텍스트 메모" items={notes} />
      )}
      {order.length > 0 && (
        <PayloadListCard icon={Target} title="추천 순서" items={order} />
      )}
      {question && (
        <PayloadCard icon={MessageSquare} title="질문 맥락" body={question} />
      )}
    </div>
  );
};

const PayloadCard = ({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  body: string;
}) => (
  <div
    style={{
      padding: '12px 14px',
      borderRadius: '12px',
      backgroundColor: 'white',
      border: 'var(--whisper-border)',
    }}
  >
    <div className="body-semibold" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Icon size={15} />
      {title}
    </div>
    <div className="body-text" style={{ fontSize: '14px', color: 'var(--warm-gray-500)' }}>
      {body}
    </div>
  </div>
);

const PayloadListCard = ({
  icon: Icon,
  title,
  items,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  items: string[];
}) => (
  <div
    style={{
      padding: '12px 14px',
      borderRadius: '12px',
      backgroundColor: 'white',
      border: 'var(--whisper-border)',
      display: 'grid',
      gap: '8px',
    }}
  >
    <div className="body-semibold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Icon size={15} />
      {title}
    </div>
    {items.map((item) => (
      <div key={item} className="body-text" style={{ fontSize: '14px', color: 'var(--warm-gray-500)' }}>
        {item}
      </div>
    ))}
  </div>
);

const SideContextPanel = ({
  title,
  subtitle,
  items,
  extra,
}: {
  title: string;
  subtitle: string;
  items: Array<{ title: string; description: string }>;
  extra?: ReactNode;
}) => (
  <div
    style={{
      ...panelStyle,
      padding: '20px',
      alignSelf: 'start',
    }}
  >
    <div className="body-semibold" style={{ marginBottom: '6px' }}>
      {title}
    </div>
    <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginBottom: '14px' }}>
      {subtitle}
    </div>
    <div style={{ display: 'grid', gap: '10px' }}>
      {items.length === 0 ? (
        <div className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
          아직 표시할 항목이 없습니다.
        </div>
      ) : (
        items.map((item) => (
          <div
            key={`${item.title}-${item.description}`}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--warm-white)',
              border: 'var(--whisper-border)',
            }}
          >
            <div className="body-semibold" style={{ marginBottom: '4px' }}>
              {item.title}
            </div>
            <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
              {item.description}
            </div>
          </div>
        ))
      )}
    </div>
    {extra}
  </div>
);

const ContextListCard = ({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: Array<{ key: string; title: string; description: string }>;
  emptyText: string;
}) => (
  <div
    style={{
      ...panelStyle,
      padding: '18px',
    }}
  >
    <div className="body-semibold" style={{ marginBottom: '12px' }}>
      {title}
    </div>
    {items.length === 0 ? (
      <div className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
        {emptyText}
      </div>
    ) : (
      <div style={{ display: 'grid', gap: '10px' }}>
        {items.map((item) => (
          <div
            key={item.key}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--warm-white)',
            }}
          >
            <div className="body-semibold" style={{ marginBottom: '4px' }}>
              {item.title}
            </div>
            <div className="body-text" style={{ fontSize: '13px', color: 'var(--warm-gray-500)' }}>
              {item.description}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function providerLabel(provider: string): string {
  if (provider.toLowerCase() === 'jira') return 'Jira';
  if (provider.toLowerCase() === 'linear') return 'Linear';
  return provider;
}

function humanizeStatus(status: string): '백로그' | '진행 중' | '완료' | '취소됨' {
  if (status === 'done') return '완료';
  if (status === 'in_progress') return '진행 중';
  if (status === 'canceled') return '취소됨';
  return '백로그';
}

function formatDate(value?: string | null, withTime = false): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    ...(withTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
        }
      : {}),
  }).format(date);
}

function resolveSenderName(message: MessageItem, members: TeamMember[], currentUserId: number | null): string {
  if (message.senderId === currentUserId) return '나';
  const matched = members.find((member) => member.user_id === message.senderId);
  return matched?.user_name ?? '팀 멤버';
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function pickText(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
  }
  return null;
}

function joinValues(values: Array<string | null>): string {
  return values.filter((value): value is string => Boolean(value)).join(' · ');
}

export default Dashboard;
