import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/translations';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { LanguageToggle } from '../../components/LanguageToggle';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react-native';

export const VerifyOtpScreen = ({ route, navigation }: any) => {
  const { verifyOtp, resendOtp } = useAuth();
  const { t, fNum } = useLanguage();

  const [phoneOrEmail, setPhoneOrEmail] = useState(route.params?.phoneOrEmail || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (!phoneOrEmail || !otp) {
      setError('Please enter your OTP code');
      return;
    }
    setError('');
    setLoading(true);
    const res = await verifyOtp(phoneOrEmail.trim(), otp.trim());
    setLoading(false);

    if (!res.success) {
      setError(res.message || t.invalidOtp);
    }
  };

  const handleResend = async () => {
    if (!phoneOrEmail) return;
    setError('');
    setResending(true);
    const res = await resendOtp(phoneOrEmail.trim());
    setResending(false);

    if (res.success) {
      Alert.alert('Success', t.otpResent);
      setTimer(30);
    } else {
      setError(res.message || 'Failed to resend OTP');
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
            <KeyRound size={36} color="#0d9488" />
          </View>
          <Text style={styles.title}>{t.otpVerification}</Text>
          <Text style={styles.tagline}>{t.otpSentTo} {phoneOrEmail}</Text>
        </View>

        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!route.params?.phoneOrEmail && (
            <CustomInput
              label={t.emailOrPhone}
              value={phoneOrEmail}
              onChangeText={setPhoneOrEmail}
              icon={<Mail size={18} color="#64748b" />}
              autoCapitalize="none"
            />
          )}

          <CustomInput
            label={t.enterOtp}
            placeholder="123456"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            icon={<KeyRound size={18} color="#64748b" />}
          />

          <CustomButton
            title={t.verifyOtp}
            onPress={handleVerify}
            loading={loading}
            style={{ marginTop: 12 }}
          />

          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend code in {fNum(timer)}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text style={styles.resendText}>{t.resendOtp}</Text>
              </TouchableOpacity>
            )}
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
  resendRow: {
    alignItems: 'center',
    marginTop: 16
  },
  timerText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600'
  },
  resendText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0d9488'
  }
});
