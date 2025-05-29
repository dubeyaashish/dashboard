// File: frontend/src/context/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from '../utils/translations';

// Create the language context
const LanguageContext = createContext();

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Language provider component
export const LanguageProvider = ({ children }) => {
  // Get initial language from localStorage or default to English
  const [language, setLanguageState] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });

  // Update localStorage when language changes
  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Function to translate text
  const translate = (key) => {
    if (!key) return '';
    
    // If translations exist for this key, return the translated text
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    
    // If we're in Thai mode but don't have a translation, use translation API
    if (language === 'th' && window.translateText) {
      window.translateText(key);
      return key + '...'; // Return original with indicator while translating
    }
    
    // Fallback to the original text
    return key;
  };

  // Set up dynamic translation for the entire application
  useEffect(() => {
    // Skip if language is English
    if (language === 'en') return;

    // Initialize translation function on window object
    if (!window.translateText) {
      // Cache for translations to avoid unnecessary API calls
      const translationCache = {};
      
      // Create a global translation function
      window.translateText = async (text) => {
        // Skip empty text or already cached translations
        if (!text || translationCache[text]) return;
        
        try {
          // Use a free proxy for Google Translate API (for demo purposes)
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=th&dt=t&q=${encodeURIComponent(text)}`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data && data[0] && data[0][0]) {
            // Update translation cache
            translationCache[text] = data[0][0][0];
            
            // Trigger re-render of components using this translation
            document.dispatchEvent(new CustomEvent('translation-updated', { 
              detail: { original: text, translated: data[0][0][0] } 
            }));
          }
        } catch (error) {
          console.error('Translation error:', error);
        }
      };
    }
    
    // Listen for translation updates
    const handleTranslationUpdate = (event) => {
      // Force re-render of components using the translation
      setLanguageState(prev => {
        if (prev === 'th') return 'th'; // Same value to trigger context update
        return prev;
      });
    };
    
    document.addEventListener('translation-updated', handleTranslationUpdate);
    
    return () => {
      document.removeEventListener('translation-updated', handleTranslationUpdate);
    };
  }, [language]);

  // Value to be provided by the context
  const value = {
    language,
    setLanguage,
    translate,
    t: translate // Short alias for translate
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;