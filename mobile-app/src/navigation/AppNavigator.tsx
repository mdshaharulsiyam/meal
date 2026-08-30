import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import { useLanguage } from '../i18n/translations';
import { RoomMode } from '../types';

// Screens
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { VerifyOtpScreen } from '../screens/Auth/VerifyOtpScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';

import { RoomSelectScreen } from '../screens/Room/RoomSelectScreen';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { MealsScreen } from '../screens/Meals/MealsScreen';
import { BazarScreen } from '../screens/Bazar/BazarScreen';
import { JomaScreen } from '../screens/Joma/JomaScreen';
import { UtilitiesScreen } from '../screens/Utilities/UtilitiesScreen';
import { SettlementScreen } from '../screens/Settlement/SettlementScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';

// Icons
import { LayoutDashboard, Utensils, ShoppingCart, Wallet, Zap, Receipt, Settings as SettingsIcon, LogIn } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const MainTabNavigator = () => {
  const { t } = useLanguage();
  const { activeRoom } = useRoom();
  const isSingleMode = activeRoom?.mode === RoomMode.SINGLE_MANAGER;

  if (!activeRoom) {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0d9488',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
            backgroundColor: '#ffffff',
            borderTopColor: '#e2e8f0'
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700'
          }
        }}
      >
        <Tab.Screen
          name="JoinRoom"
          component={RoomSelectScreen}
          options={{
            tabBarLabel: t.joinRoom,
            tabBarIcon: ({ color, size }) => <LogIn size={size} color={color} />
          }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0d9488',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0'
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700'
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t.dashboard,
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />
        }}
      />

      <Tab.Screen
        name="Meals"
        component={MealsScreen}
        options={{
          tabBarLabel: t.meals,
          tabBarIcon: ({ color, size }) => <Utensils size={size} color={color} />
        }}
      />

      <Tab.Screen
        name="Bazar"
        component={BazarScreen}
        options={{
          tabBarLabel: t.bazar,
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />
        }}
      />

      {isSingleMode && (
        <Tab.Screen
          name="Joma"
          component={JomaScreen}
          options={{
            tabBarLabel: t.joma,
            tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />
          }}
        />
      )}

      <Tab.Screen
        name="Utilities"
        component={UtilitiesScreen}
        options={{
          tabBarLabel: t.utilities,
          tabBarIcon: ({ color, size }) => <Zap size={size} color={color} />
        }}
      />

      <Tab.Screen
        name="Settlement"
        component={SettlementScreen}
        options={{
          tabBarLabel: t.settlement,
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t.settings,
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, token, loading: authLoading } = useAuth();
  const { activeRoom, loading: roomLoading } = useRoom();

  if (authLoading || roomLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!token ? (
        <AuthNavigator />
      ) : (
        <MainTabNavigator />
      )}
    </NavigationContainer>
  );
};
