import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'bn';

export const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function formatDigits(num: number | string, lang: Language): string {
  const str = String(num);
  if (lang === 'en') return str;
  return str.replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

export function formatCurrency(amount: number, lang: Language): string {
  const rounded = Math.round(amount * 100) / 100;
  const formattedNum = formatDigits(rounded, lang);
  return lang === 'bn' ? `${formattedNum} ৳` : `৳${formattedNum}`;
}

export const translations = {
  en: {
    appName: 'Mess Meal Manager',
    tagline: 'Smart Meal & Expense Settlement',
    login: 'Login',
    register: 'Register',
    emailOrPhone: 'Phone or Email',
    password: 'Password',
    name: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    defaultMeals: 'Default Meals/Day',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    sendResetCode: 'Send OTP Code',
    enterOtp: 'Enter 6-digit OTP Code',
    otpVerification: 'OTP Verification',
    otpSentTo: 'We sent a verification code to:',
    resendOtp: 'Resend OTP',
    verifyOtp: 'Verify OTP',
    invalidOtp: 'Invalid OTP code',
    otpExpired: 'OTP has expired',
    otpResent: 'A new OTP code has been sent!',
    newPassword: 'New Password',
    enterNewPassword: 'Enter your new password',
    passwordResetSuccess: 'Password reset successfully! Please login with your new password.',
    settings: 'Settings',
    profile: 'Profile & Settings',
    updateSettings: 'Update Settings',
    saveSettings: 'Save Changes',
    defaultMealsPerDayDesc: 'Default daily meal count assigned to you in room calculations.',
    createRoom: 'Create Room',
    joinRoom: 'Join Room',
    roomCode: 'Room Code',
    roomName: 'Room Name',
    selectMode: 'Select Operating Mode',
    singleManagerMode: 'Single Manager Mode',
    singleManagerDesc: 'Central manager controls deposits (Joma) & meals. Members are read-only by default.',
    collaborativeMode: 'Collaborative Mode',
    collaborativeDesc: 'Equal access for all members to add meals and expenses. Excludes Joma deposits.',
    dashboard: 'Dashboard',
    meals: 'Meals',
    bazar: 'Bazar',
    joma: 'Joma / Deposit',
    utilities: 'Utilities',
    settlement: 'Settlement',
    denaPaona: 'Dena-Paona (Net Balance)',
    refund: 'Will Receive (Refund)',
    due: 'Must Pay (Due)',
    settled: 'Settled',
    mealRate: 'Meal Rate',
    totalMeals: 'Total Meals',
    totalBazar: 'Total Bazar',
    totalJoma: 'Total Joma',
    totalUtilities: 'Total Utilities',
    personalMeals: 'Personal Meals',
    personalMealCost: 'Meal Cost',
    utilityShare: 'Utility Share',
    totalPersonalCost: 'Total Cost',
    personalJoma: 'Personal Deposit',
    personalBazar: 'Personal Bazar',
    myStatus: 'My Dena-Paona Status',
    closeMonth: 'Close & Finalize Month',
    monthLocked: 'Month Locked',
    downloadPdf: 'Export PDF Report',
    addExpense: 'Add Expense',
    addDeposit: 'Add Deposit',
    addUtility: 'Add Utility Bill',
    batchMeals: 'Update Meals',
    buyer: 'Paid By',
    amount: 'Amount (BDT)',
    date: 'Date',
    description: 'Description / Item',
    title: 'Bill Title',
    note: 'Note',
    save: 'Save',
    cancel: 'Cancel',
    logout: 'Logout',
    manager: 'Manager',
    delegatedEditor: 'Delegated Editor',
    member: 'Member',
    languageToggle: 'বাংলা',
    activeMonth: 'Active Month',
    enterCode: 'Enter 6-digit Room Code',
    copyCode: 'Copy Room Code',
    copied: 'Copied to clipboard!',
    noRoomSelected: 'No Room Selected',
    selectOrCreateRoom: 'Please create or join a room to get started.',
    leaveMess: 'Leave Mess',
    leaveMessConfirm: 'Are you sure you want to leave this mess? You will need an invite code to rejoin.',
    activeMess: 'Active Mess',
    today: 'Today',
    monthView: 'Month View',
    weekView: 'Week View',
    prevDay: 'Prev Day',
    nextDay: 'Next Day',
    totalDayMeals: 'Total Meals for Date'
  },
  bn: {
    appName: 'মেস মিল ম্যানেজার',
    tagline: 'সহজ মিল হিসাব ও দেনা-পাওনা নিষ্পত্তি',
    login: 'লগইন',
    register: 'রেজিস্টার',
    emailOrPhone: 'ফোন বা ইমেইল',
    password: 'পাসওয়ার্ড',
    name: 'পূর্ণ নাম',
    phone: 'ফোন নম্বর',
    email: 'ইমেইল এড্রেস',
    defaultMeals: 'ডিফল্ট মিল সংখ্যা/দিন',
    noAccount: 'একাউন্ট নেই?',
    haveAccount: 'আগে থেকেই একাউন্ট আছে?',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    resetPassword: 'পাসওয়ার্ড রিসেট করুন',
    sendResetCode: 'ওটিপি কোড পাঠান',
    enterOtp: '৬-সংখ্যার ওটিপি লিখুন',
    otpVerification: 'ওটিপি ভেরিফিকেশন',
    otpSentTo: 'ভেরিফিকেশন কোড পাঠানো হয়েছে:',
    resendOtp: 'পুনরায় ওটিপি পাঠান',
    verifyOtp: 'ওটিপি ভেরিফাই করুন',
    invalidOtp: 'ভুল ওটিপি কোড',
    otpExpired: 'ওটিপির মেয়াদ শেষ হয়েছে',
    otpResent: 'নতুন ওটিপি কোড পাঠানো হয়েছে!',
    newPassword: 'নতুন পাসওয়ার্ড',
    enterNewPassword: 'আপনার নতুন পাসওয়ার্ড দিন',
    passwordResetSuccess: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।',
    settings: 'সেটিংস',
    profile: 'প্রোফাইল ও সেটিংস',
    updateSettings: 'সেটিংস আপডেট করুন',
    saveSettings: 'পরিবর্তন সংরক্ষণ করুন',
    defaultMealsPerDayDesc: 'আপনার দৈনিক ডিফল্ট মিল সংখ্যা যা রুমে যোগ হবে।',
    createRoom: 'নতুন রুম তৈরি করুন',
    joinRoom: 'রুমে যোগ দিন',
    roomCode: 'রুম কোড',
    roomName: 'রুমের নাম',
    selectMode: 'সিস্টেম মোড নির্বাচন করুন',
    singleManagerMode: 'একক ম্যানেজার সিস্টেম',
    singleManagerDesc: 'ম্যানেজার জমা ও মিল নিয়ন্ত্রণ করবেন। সদস্যরা রিড-অনলি থাকেন।',
    collaborativeMode: 'যৌথ মেস সিস্টেম',
    collaborativeDesc: 'সব সদস্য সমানভাবে মিল ও বাজার এন্ট্রি করতে পারেন (জমা মডেল প্রযোজ্য নয়)।',
    dashboard: 'ড্যাশবোর্ড',
    meals: 'মিল সংখ্যা',
    bazar: 'বাজার খরচ',
    joma: 'জমা / অ্যাডভান্স',
    utilities: 'ইউটিলিটি ও বিল',
    settlement: 'দেনা-পাওনা',
    denaPaona: 'দেনা-পাওনা (নেট ব্যালেন্স)',
    refund: 'পাবেন (ফেরত)',
    due: 'দিতে হবে (বকেয়া)',
    settled: 'পরিশোধিত',
    mealRate: 'মিল রেট',
    totalMeals: 'মোট মিল',
    totalBazar: 'মোট বাজার খরচ',
    totalJoma: 'মোট জমা',
    totalUtilities: 'মোট ইউটিলিটি',
    personalMeals: 'ব্যক্তিগত মিল',
    personalMealCost: 'মিল খরচ',
    utilityShare: 'ইউটিলিটি শেয়ার',
    totalPersonalCost: 'মোট ব্যক্তিগত খরচ',
    personalJoma: 'ব্যক্তিগত জমা',
    personalBazar: 'ব্যক্তিগত বাজার',
    myStatus: 'আমার দেনা-পাওনা',
    closeMonth: 'মাস লক ও ফাইনাল করুন',
    monthLocked: 'মাস লক করা আছে',
    downloadPdf: 'পিডিএফ রিপোর্ট ডাউনলোড',
    addExpense: 'নতুন বাজার খরচ',
    addDeposit: 'নতুন জমা যোগ করুন',
    addUtility: 'নতুন ইউটিলিটি বিল',
    batchMeals: 'মিল আপডেট করুন',
    buyer: 'প্রদানকারী (বাজার)',
    amount: 'টাকার পরিমাণ (৳)',
    date: 'তারিখ',
    description: 'বিবরণ / জিনিসপত্র',
    title: 'বিলের নাম',
    note: 'নোট',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    logout: 'লগআউট',
    manager: 'ম্যানেজার',
    delegatedEditor: 'ডেলিগেটেড এডিটর',
    member: 'সাধারণ সদস্য',
    languageToggle: 'English',
    activeMonth: 'চলতি মাস',
    enterCode: '৬-সংখ্যার রুম কোড লিখুন',
    copyCode: 'রুম কোড কপি করুন',
    copied: 'কপি হয়েছে!',
    noRoomSelected: 'কোন রুম নির্বাচন করা হয়নি',
    selectOrCreateRoom: 'শুরু করতে একটি রুমে যোগ দিন বা নতুন রুম তৈরি করুন।',
    leaveMess: 'মেস ত্যাগ করুন',
    leaveMessConfirm: 'আপনি কি নিশ্চিত যে আপনি এই মেস ত্যাগ করতে চান? পুনরায় যোগ দিতে আপনাকে রুম কোড ব্যবহার করতে হবে।',
    activeMess: 'চলতি মেস',
    today: 'আজ',
    monthView: 'মাস ভিউ',
    weekView: 'সপ্তাহ ভিউ',
    prevDay: 'আগের দিন',
    nextDay: 'পরের দিন',
    totalDayMeals: 'দিনের মোট মিল'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  fNum: (num: number | string) => string;
  fCurr: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<Language>('bn');

  useEffect(() => {
    AsyncStorage.getItem('app_language').then((saved) => {
      if (saved === 'en' || saved === 'bn') {
        setLangState(saved);
      }
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    AsyncStorage.setItem('app_language', lang);
  };

  const t = translations[language];
  const fNum = (num: number | string) => formatDigits(num, language);
  const fCurr = (amount: number) => formatCurrency(amount, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, fNum, fCurr }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
