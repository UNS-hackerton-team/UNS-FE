import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ko: {
    translation: {
      nav: {
        product: '제품',
        solutions: 'AI PM 기능',
        pricing: '워크스페이스',
        getStarted: '시작하기'
      },
      hero: {
        badge: '지능형 업무 할당 엔진 탑재',
        title: '전공에 맞춘 태스크 분배, 팀의 AI PM이 시작합니다.',
        subtitle: 'UNS는 사용자의 데이터를 분석하여 최적의 업무를 제안합니다. AI PM과 함께 스크럼을 가속화하세요.',
        ctaPrimary: '무료로 시작하기',
        ctaSecondary: '서비스 소개 보기'
      },
      features: {
        heading: '협업 그 이상의 지능형 파트너',
        subheading: '프로젝트 데이터를 학습한 AI가 당신의 팀에 가장 적합한 PM이 됩니다.',
        f1_title: '전공 기반 태스크 분배',
        f1_desc: '회원가입 시 입력한 전공 데이터를 기반으로, AI가 사용자의 역량에 가장 적합한 업무를 스마트하게 할당합니다.',
        f2_title: '별점 알고리즘 태스크 매칭',
        f2_desc: '자체 알고리즘을 통해 업무의 난이도와 팀원의 가용성을 분석하여 공정하고 효율적인 워크로드를 배분합니다.',
        f3_title: '지능형 AI PM 채팅방',
        f3_desc: '개인용 AI와 팀 공유 AI PM이 공존합니다. AI PM은 전체 프로젝트 흐름을 관리하며 최적의 조언을 제공합니다.',
        f4_title: '데이터 기반 대시보드',
        f4_desc: 'Linear API 연동을 통해 팀의 달성률을 실시간 그래프로 확인하세요. AI가 지표를 분석하여 병목 구간을 찾아냅니다.'
      },
      onboarding: {
        title: '당신에 대해 알려주세요',
        subtitle: '전공과 전문 분야를 바탕으로 AI가 최적의 태스크를 추천해 드립니다.',
        majorLabel: '전공 분야',
        majorPlaceholder: '예: 컴퓨터공학, 디자인, 경영학...',
        companyTitle: '회사 워크스페이스 생성',
        companyDesc: '팀원들을 초대하고 프로젝트를 관리할 중앙 공간을 만듭니다.',
        startBtn: '설정 완료'
      },
      dashboard: {
        sidebar: {
          workspace: '워크스페이스',
          projects: '프로젝트',
          members: '팀원 목록',
          aiShared: 'AI PM 공유 채팅',
          aiPrivate: '개인 AI 채팅',
          stats: '대시보드'
        }
      }
    }
  },
  en: {
    translation: {
      nav: {
        product: 'Product',
        solutions: 'AI PM Features',
        pricing: 'Workspaces',
        getStarted: 'Get Started'
      },
      hero: {
        badge: 'Intelligent Task Allocation Engine',
        title: 'Major-Specific Tasking, Powered by your AI PM.',
        subtitle: 'UNS analyzes your data to suggest the best tasks. Accelerate your scrum with an AI Project Manager.',
        ctaPrimary: 'Start for Free',
        ctaSecondary: 'Learn More'
      },
      features: {
        heading: 'More than Collaboration: Intelligent Partnership',
        subheading: 'AI learns from project data to become the most efficient PM for your team.',
        f1_title: 'Expertise-Based Allocation',
        f1_desc: 'Based on your major, AI intelligently assigns tasks that best match your professional capabilities.',
        f2_title: 'Star-Rating Algorithm',
        f2_desc: 'Our unique algorithm balances workload based on task difficulty and member availability.',
        f3_title: 'Integrated AI PM Chat',
        f3_desc: 'Dual chat system: Private AI for individual tasks and Shared AI PM for team-wide project management.',
        f4_title: 'Data-Driven Dashboard',
        f4_desc: 'Visualize progress with Linear API integration. AI identifies bottlenecks by analyzing real-time metrics.'
      },
      onboarding: {
        title: 'Tell us about yourself',
        subtitle: 'AI will recommend the best tasks based on your major and expertise.',
        majorLabel: 'Major / Expertise',
        majorPlaceholder: 'e.g. Computer Science, Design, Business...',
        companyTitle: 'Create Company Workspace',
        companyDesc: 'Create a central space to invite members and manage projects.',
        startBtn: 'Complete Setup'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
