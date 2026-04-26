import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Star,
  User,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '../store/appStore';

type TabKey = 'stats' | 'projects' | 'members' | 'backlog' | 'aiShared' | 'aiPrivate';

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
    loadWorkspaces,
    createProject,
    saveProfile,
    generateTasks,
    recommendAssignments,
    sendTeamMessage,
    sendPersonalMessage,
    logout,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('stats');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
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

  useEffect(() => {
    if (workspaces.length === 0) {
      void loadWorkspaces();
    }
  }, [loadWorkspaces, workspaces.length]);

  const currentWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === currentWorkspaceId) ?? null,
    [currentWorkspaceId, workspaces]
  );
  const currentProject = useMemo(
    () => projects.find((project) => project.id === currentProjectId) ?? null,
    [currentProjectId, projects]
  );
  const myProjectProfile = useMemo(
    () =>
      members.find((member) => member.user_id === user?.id)?.project_profile ?? null,
    [members, user?.id]
  );

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
          <SidebarItem active={activeTab === 'stats'} icon={LayoutDashboard} label="대시보드" onClick={() => setActiveTab('stats')} />
          <SidebarItem active={activeTab === 'projects'} icon={FolderKanban} label="프로젝트" onClick={() => setActiveTab('projects')} />
          <SidebarItem active={activeTab === 'members'} icon={Users} label="팀원 프로필" onClick={() => setActiveTab('members')} />
          <SidebarItem active={activeTab === 'backlog'} icon={Star} label="백로그 / 배정" onClick={() => setActiveTab('backlog')} />
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
            {user?.name} · {user?.email}
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
                <div style={{ display: 'grid', gap: '12px' }}>
                  <input
                    value={projectForm.name}
                    onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="프로젝트 이름"
                    style={inputStyle}
                  />
                  <textarea
                    value={projectForm.description}
                    onChange={(event) =>
                      setProjectForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="프로젝트 설명"
                    style={{ ...inputStyle, minHeight: '88px', resize: 'vertical' }}
                  />
                  <input
                    value={projectForm.goal}
                    onChange={(event) => setProjectForm((prev) => ({ ...prev, goal: event.target.value }))}
                    placeholder="프로젝트 목표"
                    style={inputStyle}
                  />
                  <input
                    value={projectForm.tech_stack}
                    onChange={(event) =>
                      setProjectForm((prev) => ({ ...prev, tech_stack: event.target.value }))
                    }
                    placeholder="기술 스택 (쉼표 구분)"
                    style={inputStyle}
                  />
                  <input
                    value={projectForm.mvp_scope}
                    onChange={(event) =>
                      setProjectForm((prev) => ({ ...prev, mvp_scope: event.target.value }))
                    }
                    placeholder="MVP 범위"
                    style={inputStyle}
                  />
                  <button className="btn-primary" onClick={() => void handleCreateProject()}>
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
