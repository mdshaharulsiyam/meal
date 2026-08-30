import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/translations';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { LanguageToggle } from '../../components/LanguageToggle';
import { Mail, Phone, Lock, UtensilsCrossed, Settings } from 'lucide-react-native';
import { ApiConfigModal } from '../../components/ApiConfigModal';

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  const handleLogin = async () => {
    if (!phoneOrEmail || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    const res = await login(phoneOrEmail.trim(), password);
    setLoading(false);

    if (!res.success) {
      if (res.requiresOtp) {
        navigation.navigate('VerifyOtp', { phoneOrEmail: phoneOrEmail.trim() });
      } else {
        setError(res.message || 'Login failed');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <LanguageToggle />
          <TouchableOpacity style={styles.configBtn} onPress={() => setShowConfig(true)}>
            <Settings size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <UtensilsCrossed size={36} color="#0d9488" />
          </View>
          <Text style={styles.title}>{t.appName}</Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.login}</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <CustomInput
            label={t.emailOrPhone}
            placeholder="user@example.com or 01700000000"
            value={phoneOrEmail}
            onChangeText={setPhoneOrEmail}
            icon={<Mail size={18} color="#64748b" />}
            autoCapitalize="none"
          />

          <CustomInput
            label={t.password}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Lock size={18} color="#64748b" />}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>{t.forgotPassword}</Text>
          </TouchableOpacity>

          <CustomButton
            title={t.login}
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 12 }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t.noAccount}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>{t.register}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ApiConfigModal visible={showConfig} onClose={() => setShowConfig(false)} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    justifyContent: 'center'
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  configBtn: {
    padding: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#99f6e4'
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a'
  },
  tagline: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontWeight: '600'
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginVertical: 4
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0d9488'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16
  },
  footerText: {
    fontSize: 14,
    color: '#64748b'
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d9488',
    marginLeft: 6
  }
});
