import { CalculationService, IMemberRawInput } from './services/calculation.service';
import { RoomMode } from './constants/enums';

// Test 1: Single Manager Mode
const membersMode1: IMemberRawInput[] = [
  {
    userId: 'user-1',
    userName: 'Shakil',
    userPhone: '01700000001',
    totalMeals: 40,
    personalJoma: 3000,
    personalBazarSpent: 0
  },
  {
    userId: 'user-2',
    userName: 'Tanvir',
    userPhone: '01700000002',
    totalMeals: 60,
    personalJoma: 2000,
    personalBazarSpent: 0
  }
];

const summary1 = CalculationService.calculateMessBalances({
  monthString: '2026-08',
  roomMode: RoomMode.SINGLE_MANAGER,
  membersData: membersMode1,
  totalBazarExpenses: 5000,
  totalUtilityBills: 1000
});

console.log('--- Mode 1 (Single Manager) Test ---');
console.log('Total Meals:', summary1.totalRoomMeals, 'Expected: 100');
console.log('Meal Rate:', summary1.mealRate, 'Expected: 50');
console.log('Utility per member:', summary1.memberResults[0].personalUtilityShare, 'Expected: 500');
console.log('User 1 (Shakil) Balance:', summary1.memberResults[0].netBalance, 'Expected: +500 (Refund)');
console.log('User 2 (Tanvir) Balance:', summary1.memberResults[1].netBalance, 'Expected: -1500 (Due)');

// Test 2: Collaborative Mode
const membersMode2: IMemberRawInput[] = [
  {
    userId: 'user-1',
    userName: 'Shakil',
    userPhone: '01700000001',
    totalMeals: 40,
    personalJoma: 0,
    personalBazarSpent: 3500
  },
  {
    userId: 'user-2',
    userName: 'Tanvir',
    userPhone: '01700000002',
    totalMeals: 60,
    personalJoma: 0,
    personalBazarSpent: 1500
  }
];

const summary2 = CalculationService.calculateMessBalances({
  monthString: '2026-08',
  roomMode: RoomMode.COLLABORATIVE,
  membersData: membersMode2,
  totalBazarExpenses: 5000,
  totalUtilityBills: 1000
});

console.log('\n--- Mode 2 (Collaborative) Test ---');
console.log('User 1 (Shakil) Balance:', summary2.memberResults[0].netBalance, 'Expected: +1000 (Refund)');
console.log('User 2 (Tanvir) Balance:', summary2.memberResults[1].netBalance, 'Expected: -2000 (Due)');
