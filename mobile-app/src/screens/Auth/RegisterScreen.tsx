import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/translations';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { LanguageToggle } from '../../components/LanguageToggle';
import { User as UserIcon, Phone, Mail, Lock, UtensilsCrossed } from 'lucide-react-native';

export const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      setError('Name, Phone, and Password are required');
      return;
    }
    setError('');
    setLoading(true);
    const res = await register({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      password
    });
    setLoading(false);

    if (res.success) {
      // Navigate to OTP verification screen
      navigation.navigate('VerifyOtp', { phoneOrEmail: email || phone });
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <LanguageToggle />
        </View>

        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <UtensilsCrossed size={36} color="#0d9488" />
          </View>
          <Text style={styles.title}>{t.appName}</Text>
          <Text style={styles.tagline}>{t.register}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.register}</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <CustomInput
            label={t.name}
            placeholder="Siyam Ahmed"
            value={name}
            onChangeText={setName}
            icon={<UserIcon size={18} color="#64748b" />}
          />

          <CustomInput
            label={t.phone}
            placeholder="01700000000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            icon={<Phone size={18} color="#64748b" />}
          />

          <CustomInput
            label={t.email}
            placeholder="user@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color="#64748b" />}
          />

          <CustomInput
            label={t.password}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Lock size={18} color="#64748b" />}
          />

          <CustomButton
            title={t.register}
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: 12 }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t.haveAccount}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>{t.login}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'flex-end',
    marginBottom: 16
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#99f6e4'
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a'
  },
  tagline: {
    fontSize: 14,
    color: '#64748b'
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
