import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'zh-CN', name: '简体中文', icon: 'fa-solid fa-language' },
    { code: 'en', name: 'English', icon: 'fa-solid fa-language' },
  ];
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-primary/20 hover:text-primary hover:scale-110"
        aria-label={t('settings.language')}
        title={t('settings.language')}
      >
        <i className="fas fa-language text-base"></i>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-popover border rounded-md shadow-md z-10">
          <ul className="py-1">
            {languages.map(lang => (
              <li key={lang.code}>
                <button
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 transition-colors duration-200 hover:bg-primary/10 hover:text-primary ${
                    lang.code === i18n.language ? 'font-bold' : ''
                  }`}
                >
                  {lang.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 