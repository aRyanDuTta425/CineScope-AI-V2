import React, { createContext, useContext } from 'react';

// Design System Configuration
export const designTokens = {
  colors: {
    light: {
      primary: '#6366f1',
      primaryHover: '#5b5bd6',
      secondary: '#f1f5f9',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceHover: '#f1f5f9',
      text: '#1e293b',
      textMuted: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    dark: {
      primary: '#818cf8',
      primaryHover: '#9ca3f4',
      secondary: '#1e293b',
      accent: '#22d3ee',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#334155',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },
  animations: {
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    transitionSlow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'bounce 1s infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    spin: 'spin 1s linear infinite'
  }
};

// Animation keyframes
export const keyframes = `
  @keyframes bounce {
    0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
    50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
  }
  
  @keyframes pulse {
    50% { opacity: .5; }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const DesignSystemContext = createContext();

export const DesignSystemProvider = ({ children }) => {
  return (
    <DesignSystemContext.Provider value={designTokens}>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      {children}
    </DesignSystemContext.Provider>
  );
};

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
};

// Utility function to get theme-aware styles
export const getThemeStyles = (theme, path) => {
  const keys = path.split('.');
  let value = designTokens;
  
  for (const key of keys) {
    value = value[key];
    if (!value) return undefined;
  }
  
  return value[theme] || value;
};
