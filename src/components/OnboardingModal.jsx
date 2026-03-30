import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  MousePointer2, 
  Users, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const OnboardingModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const { t } = useTranslation();

  const steps = [
    {
      title: t('onboarding.step0.title'),
      subtitle: t('onboarding.step0.subtitle'),
      content: t('onboarding.step0.content'),
      icon: <BookOpen size={48} color="var(--silk-gold)" />,
    },
    {
      title: t('onboarding.step1.title'),
      subtitle: t('onboarding.step1.subtitle'),
      content: t('onboarding.step1.content'),
      icon: <Users size={48} color="var(--silk-gold)" />,
    },
    {
      title: t('onboarding.step2.title'),
      subtitle: t('onboarding.step2.subtitle'),
      content: t('onboarding.step2.content'),
      icon: <Search size={48} color="var(--silk-gold)" />,
    },
    {
      title: t('onboarding.step3.title'),
      subtitle: t('onboarding.step3.subtitle'),
      content: t('onboarding.step3.content'),
      icon: <MousePointer2 size={48} color="var(--silk-gold)" />,
    },
    {
      title: t('onboarding.step4.title'),
      subtitle: t('onboarding.step4.subtitle'),
      content: t('onboarding.step4.content'),
      icon: <ArrowRight size={48} color="var(--silk-gold)" />,
      isFinal: true
    }
  ];

  if (!isOpen) return null;

  const currentStep = steps[step];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <X size={20} />
        </button>

        <div key={step} className="onboarding-slide" style={{ textAlign: 'center' }}>
          <div style={{ 
            marginBottom: '32px', 
            display: 'inline-flex', 
            padding: '24px',
            background: 'rgba(212, 175, 55, 0.05)',
            borderRadius: '24px',
            border: '1px solid rgba(212, 175, 55, 0.1)'
          }}>
            {currentStep.icon}
          </div>

          <h2 style={{ 
            marginBottom: '8px', 
            fontSize: '24px', 
            color: 'var(--pasupu)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {currentStep.title}
          </h2>
          
          <h4 style={{ 
            marginBottom: '20px', 
            color: 'var(--silk-gold)', 
            fontWeight: 400,
            opacity: 0.8
          }}>
            {currentStep.subtitle}
          </h4>

          <p style={{ 
            color: 'var(--text-secondary)', 
            lineHeight: 1.6, 
            fontSize: '15px',
            marginBottom: '40px',
            maxWidth: '360px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {currentStep.content}
          </p>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: 'auto'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {steps.map((_, i) => (
                <div key={i} className={`dot-indicator ${step === i ? 'active' : ''}`} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {step > 0 && (
                <button className="gold-btn-outline" onClick={() => setStep(step - 1)}>
                  {t('onboarding.previous')}
                </button>
              )}
              
              {currentStep.isFinal ? (
                <button className="gold-btn" onClick={onClose}>
                  {t('onboarding.get_started')}
                </button>
              ) : (
                <button className="gold-btn" onClick={() => setStep(step + 1)}>
                  {t('onboarding.next')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
