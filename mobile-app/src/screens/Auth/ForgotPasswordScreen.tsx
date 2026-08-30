import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/translations';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { LanguageToggle } from '../../components/LanguageToggle';
import { Mail, Lock, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react-native';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const { forgotPassword, resetPassword } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async () => {
    if (!phoneOrEmail) {
      setError('Please enter your phone or email');
      return;
    }
    setError('');
    setLoading(true);
    const res = await forgotPassword(phoneOrEmail.trim());
    setLoading(false);

    if (res.success) {
      Alert.alert('OTP Sent', res.message || 'Verification code sent to your email.');
      setStep('reset');
    } else {
      setError(res.message || 'Failed to send OTP code');
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      setError('Please enter OTP and new password');
      return;
    }
    setError('');
    setLoading(true);
    const res = await resetPassword(phoneOrEmail.trim(), otp.trim(), newPassword);
    setLoading(false);

    if (res.success) {
      Alert.alert('Success', t.passwordResetSuccess);
      navigation.navigate('Login');
    } else {
      setError(res.message || 'Failed to reset password');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#475569" />
          </TouchableOpacity>
          <LanguageToggle />
        </View>

        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={36} color="#0d9488" />
          </View>
          <Text style={styles.title}>{t.resetPassword}</Text>
          <Text style={styles.tagline}>
            {step === 'request' ? 'Enter your registered email or phone' : 'Enter OTP & new password'}
          </Text>
        </View>

        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {step === 'request' ? (
            <>
              <CustomInput
                label={t.emailOrPhone}
                placeholder="user@example.com or 01700000000"
                value={phoneOrEmail}
                onChangeText={setPhoneOrEmail}
                icon={<Mail size={18} color="#64748b" />}
                autoCapitalize="none"
              />

              <CustomButton
                title={t.sendResetCode}
                onPress={handleRequestOtp}
                loading={loading}
                style={{ marginTop: 12 }}
              />
            </>
          ) : (
            <>
              <CustomInput
                label={t.enterOtp}
                placeholder="123456"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                icon={<KeyRound size={18} color="#64748b" />}
              />

              <CustomInput
                label={t.newPassword}
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                icon={<Lock size={18} color="#64748b" />}
              />

              <CustomButton
                title={t.resetPassword}
                onPress={handleResetPassword}
                loading={loading}
                style={{ marginTop: 12 }}
              />
            </>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>{t.login}</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  backBtn: {
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
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a'
  },
  tagline: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center'
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
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontWeight: '600'
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: 16
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d9488'
  }
});
