import { motion } from 'framer-motion';
import { User, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Invitation = () => {
  const { t } = useTranslation();

  // Mock data for the invitation
  const inviterName = "Alex Kim";
  const workspaceName = t('invitation.workspaceName');
  const memberCount = 12;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--warm-white)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          maxWidth: '480px', 
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: 'var(--whisper-border)',
          boxShadow: 'var(--deep-shadow)',
          padding: '48px 40px',
          textAlign: 'center'
        }}
      >
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '32px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: 'var(--warm-white)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: 'var(--whisper-border)'
          }}>
            <Users size={40} color="var(--notion-black)" />
          </div>
          <div style={{ 
            position: 'absolute', 
            bottom: '-4px', 
            right: '-4px', 
            backgroundColor: 'white', 
            borderRadius: '50%', 
            padding: '2px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <CheckCircle2 size={24} color="var(--notion-blue)" fill="white" />
          </div>
        </div>

        <h1 className="card-title" style={{ fontSize: '26px', marginBottom: '12px' }}>
          {t('invitation.title')}
        </h1>
        
        <p className="body-text" style={{ color: 'var(--warm-gray-500)', marginBottom: '32px', wordBreak: 'keep-all' }}>
          {t('invitation.subtitle', { inviter: inviterName })}
        </p>

        <div style={{ 
          backgroundColor: 'var(--warm-white)', 
          borderRadius: '8px', 
          padding: '20px', 
          marginBottom: '40px',
          textAlign: 'left',
          border: 'var(--whisper-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--notion-black)', borderRadius: '4px' }} />
            <span className="body-semibold" style={{ fontSize: '18px' }}>{workspaceName}</span>
          </div>
          <p className="body-text" style={{ color: 'var(--warm-gray-500)', fontSize: '14px', marginLeft: '44px' }}>
            {t('invitation.memberCount', { count: memberCount })}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn-primary" style={{ padding: '14px', width: '100%', fontSize: '16px' }}>
            {t('invitation.acceptBtn')}
          </button>
          <button className="btn-secondary" style={{ padding: '14px', width: '100%', fontSize: '16px', backgroundColor: 'transparent' }}>
            {t('invitation.declineBtn')}
          </button>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#ddd' }}>
            <User size={24} color="#888" />
          </div>
          <span className="body-text" style={{ fontSize: '14px', color: 'var(--warm-gray-300)' }}>
            Signed in as alex.kim@example.com
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Invitation;
