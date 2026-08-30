import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as RNStatusBar, Platform } from 'react-native';
import { LanguageProvider } from './src/i18n/translations';
import { AuthProvider } from './src/context/AuthContext';
import { RoomProvider } from './src/context/RoomContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <RoomProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
              <AppNavigator />
              <StatusBar style="dark" />
              {Platform.OS === 'android' && (
                <RNStatusBar barStyle="dark-content" backgroundColor="#ffffff" />
              )}
            </SafeAreaView>
          </RoomProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

