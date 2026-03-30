import React, { useState, useEffect } from 'react';
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

const OnboardingModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Ancient Roots",
      subtitle: "Welcome to the Padmasali Family Network",
      content: "This interactive map traces the sacred lineages and ancestral Gotras of our community, starting from the Mula Purusha, Bhavana Rishi.",
      icon: <BookOpen size={48} color="var(--silk-gold)" />,
    },
    {
      title: "Navigating the Lineage",
      subtitle: "How the tree grows",
      content: "Lineages are grouped alphabetically. Click an alphabet to see associated Gotras, then click a Gotra to reveal its Surnames.",
      icon: <Users size={48} color="var(--silk-gold)" />,
    },
    {
      title: "Advanced Search",
      subtitle: "Find your specific heritage",
      content: "Use the floating search bar at the top right to instantly find specific Gotras or Surnames across the entire network.",
      icon: <Search size={48} color="var(--silk-gold)" />,
    },
    {
      title: "Interactive Map",
      subtitle: "Explore with ease",
      content: "Use your mouse or touch to pan across the history. Scroll to zoom in on specific details. Double-click the map to reset the view.",
      icon: <MousePointer2 size={48} color="var(--silk-gold)" />,
    },
    {
      title: "Begin Your Journey",
      subtitle: "Discover your connections",
      content: "Your ancestral history is now at your fingertips. Start exploring the threads that connect us all.",
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
                  <ChevronLeft size={20} />
                </button>
              )}
              
              {currentStep.isFinal ? (
                <button className="gold-btn" onClick={onClose}>
                  Get Started
                </button>
              ) : (
                <button className="gold-btn" onClick={() => setStep(step + 1)}>
                  <ChevronRight size={20} />
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
