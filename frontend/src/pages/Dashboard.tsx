import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import {
  Ban,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  Link2,
  MessageSquare,
  Plus,
  PlugZap,
  RefreshCcw,
  Send,
  Settings,
  Star,
  User,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '../store/appStore';

type TabKey =
  | 'workspace'
  | 'stats'
  | 'projects'
  | 'members'
  | 'backlog'
  | 'external'
  | 'aiShared'
  | 'aiPrivate';

const SidebarItem = ({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      backgroundColor: active ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
      color: active ? 'var(--notion-black)' : 'var(--warm-gray-500)',
      marginBottom: '2px',
    }}
    className="nav-link"
  >
    <Icon size={18} />
    <span className="body-medium" style={{ fontSize: '14px' }}>
      {label}
    </span>
  </div>
);

const panelStyle: CSSProperties = {
  padding: '24px',
  border: 'var(--whisper-border)',
  borderRadius: '12px',
  boxShadow: 'var(--card-shadow)',
  backgroundColor: 'white',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #dddddd',
  fontSize: '14px',
  outline: 'none',
  backgroundColor: 'white',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    error,
    clearError,
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspace,
    inviteInfo,
    projects,
    currentProjectId,
    setCurrentProject,
    members,
    dashboard,
    backlog,
    teamMessages,
    personalMessages,
    generatedTasks,
    assignments,
    confirmedAssignments,
    jiraSnapshot,
    linearSnapshot,
    workTrackingDashboard,
    loadWorkspaces,
    loadCurrentInvite,
    regenerateInvite,
    deactivateInvite,
    createProject,
    saveProfile,
    generateTasks,
    recommendAssignments,
    confirmAssignments,
    sendTeamMessage,
    sendPersonalMessage,
    fetchJiraSnapshot,
    fetchLinearSnapshot,
    fetchWorkTrackingDashboard,
    logout,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('workspace');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    goal: '',
    tech_stack: 'FastAPI, React, PostgreSQL',
    priority: 'HIGH',
    mvp_scope: '',
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
  const [trackingForm, setTrackingForm] = useState({
    jira_board_ids: '',
    linear_team_ids: '',
    sprint_state: 'active' as 'active' | 'future' | 'closed',
    group_by: 'project' as 'source' | 'scope' | 'project' | 'team' | 'assignee' | 'label' | 'status_category',
    include_items: true,
    include_backlog: true,
    include_current_cycle: true,
  });

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

  const handleCreateProject = async () => {
    clearError();
    if (!currentWorkspaceId) {
      return;
    }
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
    });
    await setCurrentProject(createdProject.id);
    setActiveTab('members');
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
  };

  const handleGenerateTasks = async () => {
    clearError();
    await generateTasks();
    if (backlog.length > 0) {
      const targetIds = backlog.slice(0, 3).map((item) => item.id);
      if (targetIds.length > 0) {
        await recommendAssignments(targetIds);
      }
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteInfo?.invite_url) return;
    await navigator.clipboard.writeText(inviteInfo.invite_url);
    setCopiedInvite(true);
    window.setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleLoadWorkTracking = async () => {
    clearError();
    const jiraBoards = splitCsv(trackingForm.jira_board_ids)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .map((board_id) => ({
        board_id,
        sprint_state: trackingForm.sprint_state,
        include_backlog: trackingForm.include_backlog,
        include_sprints: true,
      }));
    const linearTeams = splitCsv(trackingForm.linear_team_ids).map((value) => ({
      team_id: value,
      include_current_cycle: trackingForm.include_current_cycle,
      include_backlog: trackingForm.include_backlog,
    }));

    if (jiraBoards.length === 0 && linearTeams.length === 0) {
      throw new Error('Jira board ID 또는 Linear team ID를 하나 이상 입력해야 합니다.');
    }

    if (jiraBoards.length > 0) {
      await fetchJiraSnapshot({ boards: jiraBoards });
    }
    if (linearTeams.length > 0) {
      await fetchLinearSnapshot({ teams: linearTeams });
    }
    await fetchWorkTrackingDashboard({
      jira: jiraBoards.length > 0 ? { boards: jiraBoards } : undefined,
      linear: linearTeams.length > 0 ? { teams: linearTeams } : undefined,
      group_by: trackingForm.group_by,
      include_items: trackingForm.include_items,
      exclude_canceled_from_progress: true,
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'white', overflow: 'hidden' }}>
      <aside
        style={{
          width: '260px',
          borderRight: 'var(--whisper-border)',
          backgroundColor: 'var(--warm-white)',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div
            onClick={() => setWorkspaceMenuOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            className="btn-secondary"
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: 'var(--notion-black)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
              }}
            >
              {currentWorkspace?.name?.[0] ?? 'W'}
            </div>
            <span
              className="body-semibold"
              style={{
                flex: 1,
                fontSize: '14px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentWorkspace?.name ?? '워크스페이스 선택'}
            </span>
            <ChevronDown size={14} />
          </div>

          {workspaceMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '6px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: 'var(--whisper-border)',
                boxShadow: 'var(--deep-shadow)',
                padding: '6px',
                zIndex: 10,
              }}
            >
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  onClick={() => {
                    setWorkspaceMenuOpen(false);
                    void setCurrentWorkspace(workspace.id);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor:
                      workspace.id === currentWorkspaceId ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                  }}
                >
                  <div className="body-medium" style={{ fontSize: '14px' }}>
                    {workspace.name}
                  </div>
                  <div className="body-text" style={{ fontSize: '12px', color: 'var(--warm-gray-500)' }}>
                    {workspace.workspace_role} · 팀원 {workspace.member_count}명
                  </div>
                </div>
              ))}
              <div
                onClick={() => navigate('/onboarding')}
                style={{
                  marginTop: '6px',
                  borderTop: 'var(--whisper-border)',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  color: 'var(--warm-gray-500)',
                }}
              >
                <Plus size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                워크스페이스 추가
              </div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1 }}>
          <div style={{ padding: '0 12px', marginBottom: '8px' }}>
            <span className="badge-text" style={{ color: 'var(--warm-gray-300)', fontSize: '11px' }}>
              WORKSPACE
            </span>
          </div>
          <SidebarItem active={activeTab === 'workspace'} icon={Link2} label="초대 / 설정" onClick={() => setActiveTab('workspace')} />
          <SidebarItem active={activeTab === 'stats'} icon={LayoutDashboard} label="대시보드" onClick={() => setActiveTab('stats')} />
          <SidebarItem active={activeTab === 'projects'} icon={FolderKanban} label="프로젝트" onClick={() => setActiveTab('projects')} />
          <SidebarItem active={activeTab === 'members'} icon={Users} label="팀원 프로필" onClick={() => setActiveTab('members')} />
          <SidebarItem active={activeTab === 'backlog'} icon={Star} label="백로그 / 배정" onClick={() => setActiveTab('backlog')} />
          <SidebarItem active={activeTab === 'external'} icon={PlugZap} label="Jira / Linear" onClick={() => setActiveTab('external')} />
          <SidebarItem active={activeTab === 'aiShared'} icon={MessageSquare} label="AI PM 공유 채팅" onClick={() => setActiveTab('aiShared')} />
          <SidebarItem active={activeTab === 'aiPrivate'} icon={User} label="개인 AI 채팅" onClick={() => setActiveTab('aiPrivate')} />
        </nav>

        <div style={{ borderTop: 'var(--whisper-border)', paddingTop: '16px' }}>
          <SidebarItem icon={Settings} label="로그아웃" onClick={logout} />
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header
          style={{
            height: '52px',
            borderBottom: 'var(--whisper-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="body-text" style={{ color: 'var(--warm-gray-300)' }}>
              {currentWorkspace?.name ?? 'Workspace'}
            </span>
            <ChevronRight size={14} color="var(--warm-gray-300)" />
            <span className="body-medium">{currentProject?.name ?? '프로젝트 선택'}</span>
          </div>
          <div className="body-text" style={{ color: 'var(--warm-gray-500)', fontSize: '14px' }}>
            {user?.name}
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {error && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#fff3f3',
                color: '#b42318',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {activeTab === 'workspace' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '24px' }}>
              <div>
                <h2 className="section-heading" style={{ fontSize: '32px', marginBottom: '10px' }}>
                  워크스페이스 초대 관리
                </h2>
                <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                  현재 워크스페이스의 초대 링크를 복사하고, 재발급하거나 비활성화할 수 있습니다.
                </p>
              </div>

              <div style={panelStyle}>
                {!currentWorkspace ? (
                  <div className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                    먼저 워크스페이스를 선택하세요.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <div className="body-semibold" style={{ marginBottom: '6px' }}>
                        {currentWorkspace.name}
                      </div>
                      <div className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                        {currentWorkspace.description}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: 'var(--whisper-border)',
                        backgroundColor: 'var(--warm-white)',
                      }}
                    >
                      <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginBottom: '6px' }}>
                        초대 링크
                      </div>
                      <div className="body-semibold" style={{ wordBreak: 'break-all' }}>
                        {inviteInfo?.invite_url ?? '초대 링크를 불러오는 중입니다.'}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }}>
                      {[
                        ['초대 코드', inviteInfo?.invite_code ?? '-'],
                        ['활성 상태', inviteInfo?.invite_code_active ? '활성' : '비활성'],
                        ['팀원 수', `${inviteInfo?.member_count ?? currentWorkspace.member_count}명`],
                        ['사용 수', `${inviteInfo?.invite_code_used_count ?? 0}`],
                      ].map(([label, value]) => (
                        <div key={label} style={panelStyle}>
                          <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginBottom: '8px' }}>
                            {label}
                          </div>
                          <div className="body-semibold">{value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button className="btn-primary" onClick={() => void handleCopyInvite()} disabled={!inviteInfo?.invite_url}>
                        <Copy size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        {copiedInvite ? '복사됨' : '초대 링크 복사'}
                      </button>
                      <button className="btn-secondary" onClick={() => void regenerateInvite()}>
                        <RefreshCcw size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        링크 재발급
                      </button>
                      <button className="btn-secondary" onClick={() => void deactivateInvite()}>
                        <Ban size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        링크 비활성화
                      </button>
                      <button className="btn-secondary" onClick={() => void loadCurrentInvite()}>
                        새로고침
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '24px' }}>
              <div>
                <h2 className="section-heading" style={{ fontSize: '32px', marginBottom: '10px' }}>
                  {currentWorkspace?.name ?? '워크스페이스'} 대시보드
                </h2>
                <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                  현재 선택한 프로젝트의 상태와 병목 구간을 백엔드 API 기준으로 불러옵니다.
                </p>
              </div>

              {dashboard ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
                    {[
                      ['전체 이슈', dashboard.total_issues],
                      ['완료', dashboard.completed_issues],
                      ['진행 중', dashboard.in_progress_issues],
                      ['스프린트 진행률', `${dashboard.sprint_progress}%`],
                    ].map(([label, value]) => (
                      <div key={label} style={panelStyle}>
                        <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginBottom: '8px' }}>
                          {label}
                        </div>
                        <div className="section-heading" style={{ fontSize: '28px' }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={panelStyle}>
                    <h3 className="card-title" style={{ marginBottom: '12px' }}>
                      AI 병목 분석
                    </h3>
                    <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                      {dashboard.bottleneck_summary}
                    </p>
                    {dashboard.recommended_next_issue && (
                      <div
                        style={{
                          marginTop: '16px',
                          padding: '14px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--warm-white)',
                          border: 'var(--whisper-border)',
                        }}
                      >
                        <div className="body-semibold">추천 다음 이슈</div>
                        <div className="body-text" style={{ marginTop: '6px' }}>
                          #{dashboard.recommended_next_issue.id} {dashboard.recommended_next_issue.title}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={panelStyle}>프로젝트를 선택하면 대시보드 데이터가 표시됩니다.</div>
              )}
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '24px' }}>
              <div style={panelStyle}>
                <h3 className="card-title" style={{ marginBottom: '12px' }}>
                  프로젝트 목록
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => void setCurrentProject(project.id)}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: 'var(--whisper-border)',
                        backgroundColor:
                          project.id === currentProjectId ? 'var(--warm-white)' : 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <div className="body-semibold" style={{ marginBottom: '6px' }}>
                        {project.name}
                      </div>
                      <div className="body-text" style={{ color: 'var(--warm-gray-500)', fontSize: '14px' }}>
                        {project.goal}
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                      아직 프로젝트가 없습니다.
                    </div>
                  )}
                </div>
              </div>

              <div style={panelStyle}>
                <h3 className="card-title" style={{ marginBottom: '12px' }}>
                  새 프로젝트 만들기
                </h3>
                {!currentWorkspaceId && (
                  <div
                    style={{
                      marginBottom: '12px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--warm-white)',
                      border: 'var(--whisper-border)',
                      color: 'var(--warm-gray-500)',
                      fontSize: '14px',
                    }}
                  >
                    프로젝트를 만들려면 먼저 워크스페이스를 생성하거나 선택해야 합니다.
                  </div>
                )}
                <div style={{ display: 'grid', gap: '12px', opacity: currentWorkspaceId ? 1 : 0.6 }}>
                  <input
                    value={projectForm.name}
                    onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="프로젝트 이름"
                    style={inputStyle}
                    disabled={!currentWorkspaceId}
                  />
                  <textarea
                    value={projectForm.description}
                    onChange={(event) =>
                      setProjectForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="프로젝트 설명"
                    style={{ ...inputStyle, minHeight: '88px', resize: 'vertical' }}
                    disabled={!currentWorkspaceId}
                  />
                  <input
                    value={projectForm.goal}
                    onChange={(event) => setProjectForm((prev) => ({ ...prev, goal: event.target.value }))}
                    placeholder="프로젝트 목표"
                    style={inputStyle}
                    disabled={!currentWorkspaceId}
                  />
                  <input
                    value={projectForm.tech_stack}
                    onChange={(event) =>
                      setProjectForm((prev) => ({ ...prev, tech_stack: event.target.value }))
                    }
                    placeholder="기술 스택 (쉼표 구분)"
                    style={inputStyle}
                    disabled={!currentWorkspaceId}
                  />
                  <input
                    value={projectForm.mvp_scope}
                    onChange={(event) =>
                      setProjectForm((prev) => ({ ...prev, mvp_scope: event.target.value }))
                    }
                    placeholder="MVP 범위"
                    style={inputStyle}
                    disabled={!currentWorkspaceId}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => void handleCreateProject()}
                    disabled={!currentWorkspaceId}
                  >
                    프로젝트 생성
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '24px' }}>
              <div style={panelStyle}>
                <h3 className="card-title" style={{ marginBottom: '12px' }}>
                  내 프로젝트 참여 프로필
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <input
                    value={profileForm.project_role}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, project_role: event.target.value }))
                    }
                    placeholder="역할"
                    style={inputStyle}
                  />
                  <input
                    value={profileForm.tech_stack}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, tech_stack: event.target.value }))
                    }
                    placeholder="기술 스택 (쉼표 구분)"
                    style={inputStyle}
                  />
                  <input
                    value={profileForm.strong_tasks}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, strong_tasks: event.target.value }))
                    }
                    placeholder="자신 있는 업무"
                    style={inputStyle}
                  />
                  <input
                    value={profileForm.disliked_tasks}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, disliked_tasks: event.target.value }))
                    }
                    placeholder="선호하지 않는 업무"
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    value={profileForm.available_hours_per_day}
                    onChange={(event) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        available_hours_per_day: Number(event.target.value),
                      }))
                    }
                    placeholder="하루 작업 가능 시간"
                    style={inputStyle}
                  />
                  <input
                    value={profileForm.experience_level}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, experience_level: event.target.value }))
                    }
                    placeholder="경험 수준"
                    style={inputStyle}
                  />
                  <button className="btn-primary" onClick={() => void handleSaveProfile()}>
                    참여 프로필 저장
                  </button>
                </div>
                {myProjectProfile && (
                  <p className="body-text" style={{ marginTop: '12px', color: 'var(--warm-gray-500)' }}>
                    현재 저장됨: {myProjectProfile.project_role} · {myProjectProfile.tech_stack.join(', ')}
                  </p>
                )}
              </div>

              <div style={panelStyle}>
                <h3 className="card-title" style={{ marginBottom: '12px' }}>
                  팀원 목록
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {members.map((member) => (
                    <div
                      key={member.user_id}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: 'var(--whisper-border)',
                        backgroundColor: 'var(--warm-white)',
                      }}
                    >
                      <div className="body-semibold">
                        {member.user_name} · {member.workspace_role}
                      </div>
                      <div className="body-text" style={{ fontSize: '14px', color: 'var(--warm-gray-500)' }}>
                        {member.project_profile
                          ? `${member.project_profile.project_role} / ${member.project_profile.tech_stack.join(', ')}`
                          : '아직 프로젝트 참여 프로필 없음'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'backlog' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '24px' }}>
              <div style={panelStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <h3 className="card-title">백로그 / AI 배정</h3>
                  <button className="btn-primary" onClick={() => void handleGenerateTasks()}>
                    AI로 태스크 생성
                  </button>
                </div>
                {assignments && assignments.assignments.length > 0 && (
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                      추천 담당자를 실제 이슈로 확정할 수 있습니다.
                    </p>
                    <button className="btn-secondary" onClick={() => void confirmAssignments()}>
                      추천 배정 확정
                    </button>
                  </div>
                )}
                {confirmedAssignments && (
                  <div
                    style={{
                      marginBottom: '12px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#eef9f1',
                      color: '#067647',
                      fontSize: '14px',
                    }}
                  >
                    이슈 {confirmedAssignments.created_issue_ids.length}개가 생성되었습니다.
                  </div>
                )}
                <div style={{ display: 'grid', gap: '12px' }}>
                  {backlog.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: 'var(--whisper-border)',
                        backgroundColor: 'white',
                      }}
                    >
                      <div className="body-semibold" style={{ marginBottom: '6px' }}>
                        {item.title}
                      </div>
                      <div className="body-text" style={{ color: 'var(--warm-gray-500)', fontSize: '14px' }}>
                        {item.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {generatedTasks && (
                <div style={panelStyle}>
                  <h3 className="card-title" style={{ marginBottom: '12px' }}>
                    생성된 AI 태스크 요약
                  </h3>
                  <p className="body-text" style={{ color: 'var(--warm-gray-500)', marginBottom: '12px' }}>
                    {generatedTasks.project_summary}
                  </p>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {generatedTasks.tasks.map((task) => (
                      <div key={task.title} style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--warm-white)' }}>
                        <div className="body-semibold">{task.title}</div>
                        <div className="body-text" style={{ fontSize: '14px', color: 'var(--warm-gray-500)' }}>
                          {task.required_role} · {task.priority} · {task.estimated_hours}h
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assignments && (
                <div style={panelStyle}>
                  <h3 className="card-title" style={{ marginBottom: '12px' }}>
                    추천 담당자
                  </h3>
                  <div style={{ display: 'grid', gap: '14px' }}>
                    {assignments.assignments.map((assignment) => (
                      <div key={assignment.backlog_item_id} style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--warm-white)' }}>
                        <div className="body-semibold" style={{ marginBottom: '6px' }}>
                          {assignment.title}
                        </div>
                        <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginBottom: '10px' }}>
                          최종 추천: {assignment.recommended_assignee_name ?? '없음'}
                        </div>
                        {assignment.candidates.map((candidate) => (
                          <div key={candidate.user_id} className="body-text" style={{ fontSize: '14px', marginTop: '4px' }}>
                            {candidate.user_name} {candidate.stars} · {candidate.reasons.join(', ')}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'external' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '24px' }}>
              <div>
                <h2 className="section-heading" style={{ fontSize: '32px', marginBottom: '10px' }}>
                  Jira / Linear 연동
                </h2>
                <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                  보드 ID와 팀 ID를 입력하면 외부 이슈를 스냅샷으로 가져오고 통합 진행률을 볼 수 있습니다.
                </p>
              </div>

              <div style={panelStyle}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <input
                    value={trackingForm.jira_board_ids}
                    onChange={(event) => setTrackingForm((prev) => ({ ...prev, jira_board_ids: event.target.value }))}
                    placeholder="Jira board IDs (예: 12, 18)"
                    style={inputStyle}
                  />
                  <input
                    value={trackingForm.linear_team_ids}
                    onChange={(event) => setTrackingForm((prev) => ({ ...prev, linear_team_ids: event.target.value }))}
                    placeholder="Linear team IDs (예: abc123, def456)"
                    style={inputStyle}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                    <select
                      value={trackingForm.sprint_state}
                      onChange={(event) =>
                        setTrackingForm((prev) => ({
                          ...prev,
                          sprint_state: event.target.value as 'active' | 'future' | 'closed',
                        }))
                      }
                      style={inputStyle}
                    >
                      <option value="active">Jira Active Sprint</option>
                      <option value="future">Jira Future Sprint</option>
                      <option value="closed">Jira Closed Sprint</option>
                    </select>
                    <select
                      value={trackingForm.group_by}
                      onChange={(event) =>
                        setTrackingForm((prev) => ({
                          ...prev,
                          group_by: event.target.value as 'source' | 'scope' | 'project' | 'team' | 'assignee' | 'label' | 'status_category',
                        }))
                      }
                      style={inputStyle}
                    >
                      <option value="project">프로젝트별</option>
                      <option value="team">팀별</option>
                      <option value="assignee">담당자별</option>
                      <option value="label">라벨별</option>
                      <option value="source">소스별</option>
                      <option value="scope">스코프별</option>
                      <option value="status_category">상태별</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                    <label className="body-text">
                      <input
                        type="checkbox"
                        checked={trackingForm.include_backlog}
                        onChange={(event) => setTrackingForm((prev) => ({ ...prev, include_backlog: event.target.checked }))}
                        style={{ marginRight: '8px' }}
                      />
                      백로그 포함
                    </label>
                    <label className="body-text">
                      <input
                        type="checkbox"
                        checked={trackingForm.include_current_cycle}
                        onChange={(event) => setTrackingForm((prev) => ({ ...prev, include_current_cycle: event.target.checked }))}
                        style={{ marginRight: '8px' }}
                      />
                      Linear 현재 사이클 포함
                    </label>
                    <label className="body-text">
                      <input
                        type="checkbox"
                        checked={trackingForm.include_items}
                        onChange={(event) => setTrackingForm((prev) => ({ ...prev, include_items: event.target.checked }))}
                        style={{ marginRight: '8px' }}
                      />
                      상세 아이템 표시
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="btn-primary" onClick={() => void handleLoadWorkTracking()}>
                      통합 대시보드 불러오기
                    </button>
                    {jiraSnapshot?.scopes[0]?.items[0]?.url && (
                      <a
                        href={jiraSnapshot.scopes[0].items[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ textDecoration: 'none' }}
                      >
                        <ExternalLink size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Jira 이슈 열기
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {workTrackingDashboard && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
                    {[
                      ['전체 업무', workTrackingDashboard.summary.total_items],
                      ['진행 중', workTrackingDashboard.summary.in_progress_items],
                      ['완료', workTrackingDashboard.summary.done_items],
                      ['완료율', `${Math.round(workTrackingDashboard.summary.completion_rate * 100)}%`],
                    ].map(([label, value]) => (
                      <div key={label} style={panelStyle}>
                        <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginBottom: '8px' }}>
                          {label}
                        </div>
                        <div className="section-heading" style={{ fontSize: '28px' }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={panelStyle}>
                    <h3 className="card-title" style={{ marginBottom: '12px' }}>
                      그룹별 현황
                    </h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {workTrackingDashboard.areas.map((area) => (
                        <div key={area.key} style={{ padding: '14px', borderRadius: '10px', border: 'var(--whisper-border)' }}>
                          <div className="body-semibold">{area.label}</div>
                          <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginTop: '6px' }}>
                            전체 {area.summary.total_items} · 진행 {area.summary.in_progress_items} · 완료 {area.summary.done_items}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={panelStyle}>
                    <h3 className="card-title" style={{ marginBottom: '12px' }}>
                      스코프 스냅샷
                    </h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {workTrackingDashboard.scopes.map((scope) => (
                        <div key={`${scope.source}-${scope.scope_id}`} style={{ padding: '14px', borderRadius: '10px', border: 'var(--whisper-border)' }}>
                          <div className="body-semibold">
                            {scope.scope_name} · {scope.source.toUpperCase()}
                          </div>
                          <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginTop: '6px' }}>
                            전체 {scope.summary.total_items} · 백로그 {scope.summary.backlog_items} · 진행 {scope.summary.in_progress_items} · 완료 {scope.summary.done_items}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {trackingForm.include_items && workTrackingDashboard.items.length > 0 && (
                    <div style={panelStyle}>
                      <h3 className="card-title" style={{ marginBottom: '12px' }}>
                        외부 업무 아이템
                      </h3>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {workTrackingDashboard.items.slice(0, 20).map((item) => (
                          <div key={`${item.source}-${item.external_id}`} style={{ padding: '14px', borderRadius: '10px', border: 'var(--whisper-border)' }}>
                            <div className="body-semibold">
                              {item.external_id} · {item.title}
                            </div>
                            <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginTop: '6px' }}>
                              {item.source.toUpperCase()} · {item.status_name} · {item.assignee_name ?? 'Unassigned'} · {item.project_name ?? item.scope_name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(jiraSnapshot || linearSnapshot) && (
                    <div style={panelStyle}>
                      <h3 className="card-title" style={{ marginBottom: '12px' }}>
                        소스별 스냅샷 요약
                      </h3>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {jiraSnapshot && (
                          <div style={{ padding: '14px', borderRadius: '10px', border: 'var(--whisper-border)' }}>
                            <div className="body-semibold">Jira</div>
                            <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginTop: '6px' }}>
                              스코프 {jiraSnapshot.scopes.length}개 · 이슈 {jiraSnapshot.summary.total_items}개
                            </div>
                          </div>
                        )}
                        {linearSnapshot && (
                          <div style={{ padding: '14px', borderRadius: '10px', border: 'var(--whisper-border)' }}>
                            <div className="body-semibold">Linear</div>
                            <div className="body-text" style={{ color: 'var(--warm-gray-500)', marginTop: '6px' }}>
                              스코프 {linearSnapshot.scopes.length}개 · 이슈 {linearSnapshot.summary.total_items}개
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {(activeTab === 'aiShared' || activeTab === 'aiPrivate') && (
            <ChatPanel
              activeTab={activeTab}
              messages={activeTab === 'aiShared' ? teamMessages : personalMessages}
              prompt={activeTab === 'aiShared' ? teamPrompt : personalPrompt}
              onChangePrompt={activeTab === 'aiShared' ? setTeamPrompt : setPersonalPrompt}
              onSend={() => {
                if (activeTab === 'aiShared') {
                  void sendTeamMessage(teamPrompt).then(() => setTeamPrompt(''));
                } else {
                  void sendPersonalMessage(personalPrompt).then(() => setPersonalPrompt(''));
                }
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

function ChatPanel({
  activeTab,
  messages,
  prompt,
  onChangePrompt,
  onSend,
}: {
  activeTab: 'aiShared' | 'aiPrivate';
  messages: Array<{ role: 'user' | 'ai'; content: string; payload?: Record<string, unknown> }>;
  prompt: string;
  onChangePrompt: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '920px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 className="card-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
          {activeTab === 'aiShared' ? 'AI PM 공유 채팅' : '개인 AI 채팅'}
        </h2>
        <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
          {activeTab === 'aiShared'
            ? '프로젝트 전체 문맥을 기준으로 AI PM이 답변합니다.'
            : '내 담당 업무와 우선순위를 기준으로 개인화된 답변을 받습니다.'}
        </p>
      </div>

      <div style={{ ...panelStyle, flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '420px' }}>
        {messages.length === 0 ? (
          <div className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
            아직 메시지가 없습니다. 질문을 보내면 백엔드 AI 채팅 API 응답이 이곳에 표시됩니다.
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              style={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '12px 14px',
                borderRadius: message.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                backgroundColor: message.role === 'user' ? 'var(--notion-blue)' : 'var(--warm-white)',
                color: message.role === 'user' ? 'white' : 'var(--notion-black)',
                border: message.role === 'user' ? 'none' : 'var(--whisper-border)',
              }}
            >
              <div className="body-text" style={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </div>
              {message.payload && (
                <pre
                  style={{
                    marginTop: '10px',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    fontSize: '12px',
                    overflowX: 'auto',
                  }}
                >
                  {JSON.stringify(message.payload, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '18px', display: 'flex', gap: '10px', border: 'var(--whisper-border)', borderRadius: '10px', padding: '10px 12px' }}>
        <input
          type="text"
          value={prompt}
          onChange={(event) => onChangePrompt(event.target.value)}
          placeholder={
            activeTab === 'aiShared'
              ? '예: 지금 가장 먼저 해야 할 일이 뭐야?'
              : '예: 오늘 안에 내 업무를 끝내려면 어떤 순서로 해야 해?'
          }
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px' }}
        />
        <button style={{ backgroundColor: 'transparent', color: 'var(--notion-blue)' }} onClick={onSend}>
          <Send size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default Dashboard;
