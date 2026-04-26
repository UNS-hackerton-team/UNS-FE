import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  User, 
  Users, 
  FolderKanban, 
  Settings,
  ChevronRight,
  Send,
  Star,
  ChevronDown,
  Plus,
  Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: any) => (
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
      marginBottom: '2px'
    }}
    className="nav-link"
  >
    <Icon size={18} />
    <span className="body-medium" style={{ fontSize: '14px' }}>{label}</span>
  </div>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('aiShared');
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  
  // Mock Workspace Data
  const workspaces = [
    { id: 1, name: 'UNS Corp.', role: 'Admin' },
    { id: 2, name: 'Personal Lab', role: 'Owner' },
    { id: 3, name: 'Design Team', role: 'Member' }
  ];
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'white', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '240px', 
        borderRight: 'var(--whisper-border)', 
        backgroundColor: 'var(--warm-white)',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Workspace Switcher */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div 
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px', 
              borderRadius: '6px', 
              cursor: 'pointer' 
            }}
            className="btn-secondary"
          >
            <div style={{ width: '22px', height: '22px', backgroundColor: 'var(--notion-black)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
              {currentWorkspace.name[0]}
            </div>
            <span className="body-semibold" style={{ flex: 1, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentWorkspace.name}
            </span>
            <ChevronDown size={14} color="var(--warm-gray-500)" />
          </div>

          {/* Workspace Dropdown Menu */}
          <AnimatePresence>
            {isWorkspaceMenuOpen && (
              <>
                <div 
                  onClick={() => setIsWorkspaceMenuOpen(false)}
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                />
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    border: 'var(--whisper-border)', 
                    boxShadow: 'var(--deep-shadow)',
                    zIndex: 11,
                    marginTop: '4px',
                    padding: '6px'
                  }}
                >
                  <div style={{ padding: '8px 12px' }}>
                    <span className="badge-text" style={{ color: 'var(--warm-gray-300)', fontSize: '10px' }}>WORKSPACES</span>
                  </div>
                  {workspaces.map(ws => (
                    <div 
                      key={ws.id}
                      onClick={() => {
                        setCurrentWorkspace(ws);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '8px 12px', 
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: ws.id === currentWorkspace.id ? 'rgba(0, 0, 0, 0.03)' : 'transparent'
                      }}
                      className="nav-link-hover"
                    >
                      <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--warm-dark)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>
                        {ws.name[0]}
                      </div>
                      <span className="body-medium" style={{ flex: 1, fontSize: '13px' }}>{ws.name}</span>
                      {ws.id === currentWorkspace.id && <Check size={14} color="var(--notion-blue)" />}
                    </div>
                  ))}
                  <div style={{ borderTop: 'var(--whisper-border)', marginTop: '6px', paddingTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: 'var(--warm-gray-500)' }}>
                      <Plus size={16} />
                      <span className="body-medium" style={{ fontSize: '13px' }}>Add a workspace</span>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <nav style={{ flex: 1 }}>
          <div style={{ padding: '0 12px', marginBottom: '8px' }}>
            <span className="badge-text" style={{ color: 'var(--warm-gray-300)', fontSize: '11px' }}>WORKSPACE</span>
          </div>
          <SidebarItem icon={LayoutDashboard} label={t('dashboard.sidebar.stats')} active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
          <SidebarItem icon={FolderKanban} label={t('dashboard.sidebar.projects')} active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
          <SidebarItem icon={Users} label={t('dashboard.sidebar.members')} active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
          
          <div style={{ padding: '0 12px', marginBottom: '8px', marginTop: '24px' }}>
            <span className="badge-text" style={{ color: 'var(--warm-gray-300)', fontSize: '11px' }}>AI PM ASSISTANT</span>
          </div>
          <SidebarItem icon={MessageSquare} label={t('dashboard.sidebar.aiShared')} active={activeTab === 'aiShared'} onClick={() => setActiveTab('aiShared')} />
          <SidebarItem icon={User} label={t('dashboard.sidebar.aiPrivate')} active={activeTab === 'aiPrivate'} onClick={() => setActiveTab('aiPrivate')} />
        </nav>

        <div style={{ borderTop: 'var(--whisper-border)', paddingTop: '16px' }}>
          <SidebarItem icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ 
          height: '48px', 
          borderBottom: 'var(--whisper-border)', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 24px',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="body-text" style={{ color: 'var(--warm-gray-300)' }}>Projects</span>
            <ChevronRight size={14} color="var(--warm-gray-300)" />
            <span className="body-medium">UNS Global App</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= 4 ? "var(--notion-blue)" : "none"} color="var(--notion-blue)" />)}
            </div>
            <span className="badge-text" style={{ color: 'var(--notion-blue)' }}>AI Allocation Score: 4.2</span>
          </div>
        </header>

        {/* Content Render */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          {activeTab === 'aiShared' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 className="card-title" style={{ fontSize: '28px', marginBottom: '8px' }}>AI PM Shared Room</h2>
                <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>AI PM is analyzing "{currentWorkspace.name}" data to assist your team.</p>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--warm-white)', padding: '12px 16px', borderRadius: '12px 12px 12px 2px', maxWidth: '80%', border: 'var(--whisper-border)' }}>
                  <p className="body-text">안녕하세요! {currentWorkspace.name}의 AI PM입니다. 현재 프로젝트의 마일스톤 달성률은 68%입니다. 회원가입 모듈 개발 태스크를 '컴퓨터공학' 전공자인 Alex님께 할당하는 것을 추천드립니다.</p>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '8px', border: 'var(--whisper-border)', borderRadius: '8px', padding: '8px 12px' }}>
                <input type="text" placeholder="Ask AI PM anything..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px' }} />
                <button style={{ backgroundColor: 'transparent', color: 'var(--notion-blue)' }}><Send size={18} /></button>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="section-heading" style={{ fontSize: '32px', marginBottom: '32px' }}>{currentWorkspace.name} Dashboard</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                <div style={{ padding: '24px', border: 'var(--whisper-border)', borderRadius: '12px', boxShadow: 'var(--card-shadow)' }}>
                  <h3 className="body-semibold" style={{ marginBottom: '16px' }}>Task Distribution (Expertise-based)</h3>
                  <div style={{ height: '200px', backgroundColor: 'var(--warm-white)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warm-gray-300)' }}>
                    [ AI Graph Placeholder: 45% Tech / 30% Design / 25% Biz ]
                  </div>
                </div>
                <div style={{ padding: '24px', border: 'var(--whisper-border)', borderRadius: '12px', boxShadow: 'var(--card-shadow)' }}>
                  <h3 className="body-semibold" style={{ marginBottom: '16px' }}>Sprint Velocity (Linear Sync)</h3>
                  <div style={{ height: '200px', backgroundColor: 'var(--warm-white)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warm-gray-300)' }}>
                    [ Linear API Graph Placeholder ]
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      {/* Global CSS for hover effects */}
      <style>{`
        .nav-link-hover:hover {
          background-color: rgba(0, 0, 0, 0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
