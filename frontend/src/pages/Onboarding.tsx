import { useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '../store/appStore';

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #dddddd',
  fontSize: '15px',
  outline: 'none',
  backgroundColor: 'white',
};

const Onboarding = () => {
  const navigate = useNavigate();
  const {
    token,
    user,
    workspaces,
    loading,
    error,
    signup,
    login,
    createWorkspace,
    clearError,
  } = useAppStore();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [workspaceForm, setWorkspaceForm] = useState({
    name: '',
    description: '',
    team_type: 'Hackathon Team',
  });

  const authTitle = useMemo(
    () => (mode === 'signup' ? '계정 만들기' : '로그인'),
    [mode]
  );

  const handleAuthSubmit = async () => {
    clearError();
    if (mode === 'signup') {
      await signup(authForm);
    } else {
      await login({ email: authForm.email, password: authForm.password });
    }
  };

  const handleWorkspaceSubmit = async () => {
    clearError();
    await createWorkspace(workspaceForm);
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--warm-white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: '720px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: 'var(--whisper-border)',
          boxShadow: 'var(--card-shadow)',
          padding: '40px',
        }}
      >
        {!token ? (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 className="section-heading" style={{ fontSize: '32px', marginBottom: '12px' }}>
                {authTitle}
              </h1>
              <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                AI PM Workspace에 접속할 계정을 먼저 만듭니다.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                className={mode === 'signup' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setMode('signup')}
              >
                <UserPlus size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                회원가입
              </button>
              <button
                className={mode === 'login' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setMode('login')}
              >
                <LogIn size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                로그인
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {mode === 'signup' && (
                <input
                  type="text"
                  placeholder="이름"
                  value={authForm.name}
                  onChange={(event) =>
                    setAuthForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  style={inputStyle}
                />
              )}
              <input
                type="email"
                placeholder="이메일"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm((prev) => ({ ...prev, email: event.target.value }))
                }
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm((prev) => ({ ...prev, password: event.target.value }))
                }
                style={inputStyle}
              />
            </div>

            {error && (
              <div
                style={{
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

            <button
              className="btn-primary"
              onClick={() => void handleAuthSubmit()}
              disabled={loading}
              style={{ padding: '14px', fontSize: '16px' }}
            >
              {loading ? '처리 중...' : authTitle}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '28px' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 className="section-heading" style={{ fontSize: '30px', marginBottom: '12px' }}>
                워크스페이스 시작하기
              </h1>
              <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                {user?.name}님 계정으로 로그인되었습니다. 새 워크스페이스를 만들거나
                기존 워크스페이스로 이동할 수 있습니다.
              </p>
            </div>

            {workspaces.length > 0 && (
              <section
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: 'var(--whisper-border)',
                  backgroundColor: 'var(--warm-white)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <h2 className="card-title" style={{ marginBottom: '6px' }}>
                      내가 속한 워크스페이스
                    </h2>
                    <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                      여러 동아리나 회사 워크스페이스를 전환할 수 있습니다.
                    </p>
                  </div>
                  <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                    대시보드로 이동
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {workspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: 'var(--whisper-border)',
                        backgroundColor: 'white',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '6px',
                        }}
                      >
                        <span className="body-semibold">{workspace.name}</span>
                        <span className="badge-text" style={{ color: 'var(--notion-blue)' }}>
                          {workspace.workspace_role}
                        </span>
                      </div>
                      <p className="body-text" style={{ color: 'var(--warm-gray-500)', fontSize: '14px' }}>
                        {workspace.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Building2 size={20} color="var(--notion-blue)" />
                <label className="body-semibold">새 워크스페이스 만들기</label>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="워크스페이스 이름"
                  value={workspaceForm.name}
                  onChange={(event) =>
                    setWorkspaceForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  style={inputStyle}
                />
                <textarea
                  placeholder="워크스페이스 설명"
                  value={workspaceForm.description}
                  onChange={(event) =>
                    setWorkspaceForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  style={{ ...inputStyle, minHeight: '96px', resize: 'vertical' }}
                />
                <input
                  type="text"
                  placeholder="팀/회사 유형"
                  value={workspaceForm.team_type}
                  onChange={(event) =>
                    setWorkspaceForm((prev) => ({ ...prev, team_type: event.target.value }))
                  }
                  style={inputStyle}
                />
              </div>
            </section>

            {error && (
              <div
                style={{
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

            <button
              className="btn-primary"
              onClick={() => void handleWorkspaceSubmit()}
              disabled={loading}
              style={{
                padding: '14px',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? '생성 중...' : '워크스페이스 생성 후 시작'}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;
