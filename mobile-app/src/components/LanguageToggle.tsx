import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLanguage } from '../i18n/translations';
import { Globe } from 'lucide-react-native';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={toggleLanguage} activeOpacity={0.7}>
      <Globe size={16} color="#0f766e" style={{ marginRight: 4 }} />
      <Text style={styles.text}>{t.languageToggle}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#99f6e4'
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f766e'
  }
});
