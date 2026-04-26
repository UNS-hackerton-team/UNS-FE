import { motion } from 'framer-motion';
import {
  ArrowRight,
  BrainCircuit,
  Target,
  MessageSquare,
  LayoutDashboard,
  Languages,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const nextLng = i18n.language.startsWith('ko') ? 'en' : 'ko';
    i18n.changeLanguage(nextLng);
  };

  return (
    <nav style={{ 
      height: '64px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 24px',
      backgroundColor: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: 'var(--whisper-border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--notion-black)', borderRadius: '6px' }} />
        <span className="body-semibold" style={{ fontSize: '18px' }}>UNS</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <a href="#" className="nav-link" style={{ textDecoration: 'none', color: 'var(--notion-black)' }}>{t('nav.product')}</a>
        <a href="#" className="nav-link" style={{ textDecoration: 'none', color: 'var(--notion-black)' }}>{t('nav.solutions')}</a>
        <a href="#" className="nav-link" style={{ textDecoration: 'none', color: 'var(--notion-black)' }}>{t('nav.pricing')}</a>
        
        <button 
          onClick={toggleLanguage}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            background: 'none', 
            padding: '4px 8px',
            color: 'var(--warm-gray-500)'
          }}
          className="nav-link"
        >
          <Languages size={16} />
          {i18n.language.startsWith('ko') ? 'EN' : 'KO'}
        </button>

        <button onClick={() => navigate('/onboarding')} className="btn-primary nav-link">{t('nav.getStarted')}</button>
      </div>
    </nav>
  );
};

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <section className="section-padding" style={{ textAlign: 'center', backgroundColor: 'white' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', backgroundColor: 'var(--badge-blue-bg)', color: 'var(--notion-blue)', borderRadius: '9999px', marginBottom: '24px' }}>
            <span className="badge-text">{t('hero.badge')}</span>
          </div>
          <h1 className="display-hero" style={{ marginBottom: '24px', maxWidth: '1000px', margin: '0 auto 24px', wordBreak: 'keep-all' }}>
            {t('hero.title')}
          </h1>
          <p className="body-text" style={{ color: 'var(--warm-gray-500)', fontSize: '20px', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px', wordBreak: 'keep-all' }}>
            {t('hero.subtitle')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button onClick={() => navigate('/onboarding')} className="btn-primary" style={{ padding: '12px 24px', fontSize: '16px' }}>
              {t('hero.ctaPrimary')} <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
            </button>
            <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: '16px' }}>
              {t('hero.ctaSecondary')}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    style={{ 
      padding: '40px', 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      border: 'var(--whisper-border)', 
      boxShadow: 'var(--card-shadow)',
      textAlign: 'left'
    }}
  >
    <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--badge-blue-bg)', color: 'var(--notion-blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
      <Icon size={24} />
    </div>
    <h3 className="card-title" style={{ marginBottom: '16px' }}>{title}</h3>
    <p className="body-text" style={{ color: 'var(--warm-gray-500)', wordBreak: 'keep-all', lineHeight: '1.6' }}>{description}</p>
  </motion.div>
);

const Features = () => {
  const { t } = useTranslation();
  return (
    <section className="section-padding warm-section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 className="section-heading" style={{ marginBottom: '20px' }}>{t('features.heading')}</h2>
          <p className="body-text" style={{ color: 'var(--warm-gray-500)', fontSize: '18px' }}>{t('features.subheading')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <FeatureCard 
            icon={BrainCircuit} 
            title={t('features.f1_title')} 
            description={t('features.f1_desc')}
          />
          <FeatureCard 
            icon={Target} 
            title={t('features.f2_title')} 
            description={t('features.f2_desc')}
          />
          <FeatureCard 
            icon={MessageSquare} 
            title={t('features.f3_title')} 
            description={t('features.f3_desc')}
          />
          <FeatureCard 
            icon={LayoutDashboard} 
            title={t('features.f4_title')} 
            description={t('features.f4_desc')}
          />
        </div>
      </div>
    </section>
  );
};

const Landing = () => {
  const { t } = useTranslation();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <footer style={{ padding: '64px 0', borderTop: 'var(--whisper-border)', backgroundColor: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--notion-black)', borderRadius: '4px' }} />
            <span className="body-semibold">UNS</span>
          </div>
          <p className="body-text" style={{ color: 'var(--warm-gray-300)', fontSize: '14px' }}>{t('footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
