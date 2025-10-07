import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from '../utils/localization';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  strings: any;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('kn');
  const [isRTL, setIsRTL] = useState<boolean>(false);

  useEffect(() => {
    // Load saved language preference
    loadLanguagePreference();
  }, []);

  useEffect(() => {
    // Update strings when language changes
    strings.setLanguage(currentLanguage);

    // Set RTL for Kannada (default is now Kannada)
    setIsRTL(currentLanguage === 'kn');

    // Save language preference
    saveLanguagePreference(currentLanguage);
  }, [currentLanguage]);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'kn')) {
        setCurrentLanguage(savedLanguage);
      } else {
        // Default to Kannada if no preference is saved
        setCurrentLanguage('kn');
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
      // Default to Kannada on error as well
      setCurrentLanguage('kn');
    }
  };

  const saveLanguagePreference = async (language: string) => {
    try {
      await AsyncStorage.setItem('language', language);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const setLanguage = (language: string) => {
    if (language === 'en' || language === 'kn') {
      setCurrentLanguage(language);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    strings,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};