/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum KycLevel {
  LEVEL_1 = 1, // Phone verification completed
  LEVEL_2 = 2, // BVN verification completed
  LEVEL_3 = 3, // NIN and Selfie verification completed
}

export enum TransactionType {
  TRANSFER_IN = "TRANSFER_IN",
  TRANSFER_OUT = "TRANSFER_OUT",
  AIRTIME = "AIRTIME",
  DATA = "DATA",
  ELECTRICITY = "ELECTRICITY",
  CABLE = "CABLE",
  BETTING = "BETTING",
  ADD_CARD = "ADD_CARD",
  BONUS_REDEEM = "BONUS_REDEEM",
  CASHBACK_REDEEM = "CASHBACK_REDEEM",
  REFERRAL_BONUS = "REFERRAL_BONUS",
}

export enum TransactionStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PENDING = "PENDING",
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  state: string;
  kycLevel: KycLevel;
  bvn?: string;
  nin?: string;
  selfieUrl?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  otpCode?: string;
  isFrozen: boolean;
  role: "user" | "admin";
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  
  // Wallet Balances
  balanceMain: number;      // Actual withdrawable wallet credit (Naira)
  balanceBonus: number;     // Bonus account balance (Naira)
  balanceCashback: number;  // Cashback account balance (Naira)

  // Virtual Accounts (Assigned via Monnify Reserved Account API simulation)
  virtualAccounts: VirtualAccount[];
}

export interface VirtualAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string;
  timestamp: string; // ISO String
  description: string;
  
  // Transfers details
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  
  // Bills / Utilities details
  provider?: string;
  meterNumber?: string;
  smartCardNumber?: string;
  electricityToken?: string; // Generated on prepaid electricity success
  packName?: string; 
  phoneTarget?: string;
  betUserId?: string;

  cashbackEarned?: number;
}

export interface Beneficiary {
  id: string;
  userId: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredName: string;
  rewardAmount: number;
  status: "pending" | "earned";
  timestamp: string;
}

export interface NotificationMsg {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "credit" | "debit" | "security" | "info";
  timestamp: string;
  read: boolean;
}
