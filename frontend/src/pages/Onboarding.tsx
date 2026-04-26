import { motion } from 'framer-motion';
import { Building2, GraduationCap, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--warm-white)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 24px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          maxWidth: '560px', 
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: 'var(--whisper-border)',
          boxShadow: 'var(--card-shadow)',
          padding: '56px 48px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="section-heading" style={{ fontSize: '32px', marginBottom: '16px' }}>{t('onboarding.title')}</h1>
          <p className="body-text" style={{ color: 'var(--warm-gray-500)' }}>
            {t('onboarding.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* 전공 입력 섹션 */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <GraduationCap size={20} color="var(--notion-blue)" />
              <label className="body-semibold">{t('onboarding.majorLabel')}</label>
            </div>
            <input 
              type="text" 
              placeholder={t('onboarding.majorPlaceholder')}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '4px', 
                border: '1px solid #dddddd',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </section>

          {/* 회사 워크스페이스 섹션 */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Building2 size={20} color="var(--notion-blue)" />
              <label className="body-semibold">{t('onboarding.companyTitle')}</label>
            </div>
            <input 
              type="text" 
              placeholder="Your Company Name"
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '4px', 
                border: '1px solid #dddddd',
                fontSize: '16px',
                outline: 'none',
                marginBottom: '8px'
              }}
            />
            <p className="body-text" style={{ color: 'var(--warm-gray-300)', fontSize: '13px' }}>
              {t('onboarding.companyDesc')}
            </p>
          </section>

          <button 
            className="btn-primary" 
            onClick={() => navigate('/dashboard')}
            style={{ 
              padding: '14px', 
              fontSize: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              marginTop: '16px'
            }}
          >
            {t('onboarding.startBtn')}
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
