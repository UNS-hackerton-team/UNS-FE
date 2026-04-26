import { useEffect, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, LogIn, UserPlus, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAppStore } from '../store/appStore';

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #dddddd',
  fontSize: '15px',
  outline: 'none',
};

const Invitation = () => {
  const navigate = useNavigate();
  const { inviteCode = '' } = useParams();
  const {
    token,
    user,
    inviteInfo,
    loading,
    error,
    validateInvite,
    signup,
    login,
    joinInvite,
    clearError,
  } = useAppStore();
  const [mode, setMode] = useState<'signup' | 'login'>('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (inviteCode) {
      void validateInvite(inviteCode);
    }
  }, [inviteCode, validateInvite]);

  const handleAuth = async () => {
    clearError();
    if (mode === 'signup') {
      await signup(form);
    } else {
      await login({ email: form.email, password: form.password });
    }
  };

  const handleJoin = async () => {
    clearError();
    await joinInvite(inviteCode);
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
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: 'var(--whisper-border)',
          boxShadow: 'var(--deep-shadow)',
          padding: '40px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--warm-white)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'var(--whisper-border)',
              }}
            >
              <Users size={40} color="var(--notion-black)" />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '2px',
              }}
            >
              <CheckCircle2 size={24} color="var(--notion-blue)" fill="white" />
            </div>
          </div>

          <h1 className="card-title" style={{ fontSize: '26px', marginBottom: '12px' }}>
            워크스페이스 초대
          </h1>
          <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
            {inviteInfo?.workspace_name
              ? `${inviteInfo.workspace_name} 워크스페이스에 초대되었습니다.`
              : '초대 링크를 확인하고 있습니다.'}
          </p>
        </div>

        {inviteInfo && (
          <div
            style={{
              backgroundColor: 'var(--warm-white)',
              borderRadius: '10px',
              padding: '18px',
              marginBottom: '24px',
              border: 'var(--whisper-border)',
            }}
          >
            <div className="body-semibold" style={{ marginBottom: '8px' }}>
              {inviteInfo.workspace_name}
            </div>
            <div className="body-text" style={{ color: 'var(--warm-gray-500)', fontSize: '14px' }}>
              상태: {inviteInfo.valid === false ? inviteInfo.message : '참여 가능'}
            </div>
          </div>
        )}

        {!token ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={mode === 'login' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setMode('login')}
              >
                <LogIn size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                로그인
              </button>
              <button
                className={mode === 'signup' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setMode('signup')}
              >
                <UserPlus size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                회원가입
              </button>
            </div>

            {mode === 'signup' && (
              <input
                type="text"
                placeholder="이름"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                style={inputStyle}
              />
            )}
            <input
              type="email"
              placeholder="이메일"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              style={inputStyle}
            />

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
              onClick={() => void handleAuth()}
              disabled={loading}
              style={{ padding: '14px', width: '100%', fontSize: '16px' }}
            >
              {loading ? '처리 중...' : mode === 'signup' ? '회원가입 후 참여 준비' : '로그인'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: 'var(--warm-white)',
                border: 'var(--whisper-border)',
              }}
            >
              <div className="body-semibold" style={{ marginBottom: '6px' }}>
                현재 로그인
              </div>
              <div className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
                {user?.name} · {user?.email}
              </div>
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
              onClick={() => void handleJoin()}
              disabled={loading || inviteInfo?.valid === false}
              style={{ padding: '14px', width: '100%', fontSize: '16px' }}
            >
              {loading ? '참여 중...' : '워크스페이스 참여하기'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Invitation;
