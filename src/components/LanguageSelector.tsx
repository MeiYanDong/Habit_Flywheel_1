import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label htmlFor="language" className="dark:text-gray-200">
        {t('settings.language')}
      </Label>
      <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
        <SelectTrigger id="language" className="dark:border-gray-600">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('settings.languageDesc')}
      </p>
    </div>
  );
};

export default LanguageSelector;
