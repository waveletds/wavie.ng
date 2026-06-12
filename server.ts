/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  User, 
  KycLevel, 
  Transaction, 
  TransactionType, 
  TransactionStatus, 
  Beneficiary,
  NotificationMsg,
  VirtualAccount
} from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Live Transaction Automation Core Configuration
let liveAutomationEnabled = true;
let autoTransactionsCount = 42;
let autoLogs: string[] = [
  "Monnify automated live transaction engine initialized.",
  "Background scheduler connected to live digital channels."
];

// Local Data Store Path
const STORE_PATH = path.join(process.cwd(), "data_store.json");

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

// Interface for database payload
interface Database {
  users: User[];
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  notifications: NotificationMsg[];
}

// Initial Database State
const initialDb = (): Database => {
  const users: User[] = [
    {
      id: "usr_WAVIE_TEST",
      fullName: "Adewale Babajide",
      email: "test@wavie.ng",
      phoneNumber: "08123456789",
      dob: "1994-08-22",
      gender: "Male",
      state: "Lagos",
      kycLevel: KycLevel.LEVEL_2,
      bvn: "22233445566",
      isEmailVerified: true,
      isPhoneVerified: true,
      isFrozen: false,
      role: "user",
      referralCode: "WAV505ADE",
      referralEarnings: 1500,
      balanceMain: 45000,
      balanceBonus: 2500,
      balanceCashback: 1200,
      virtualAccounts: [
        {
          bankName: "Wema Bank (Monnify)",
          accountNumber: "9048384728",
          accountName: "WAVIE/ADEWALE BABAJIDE",
          reference: "REF_WMS_T001"
        },
        {
          bankName: "Providus Bank (Monnify)",
          accountNumber: "1092837428",
          accountName: "WAVIE/ADEWALE BABAJIDE",
          reference: "REF_PVS_T001"
        }
      ]
    },
    {
      id: "usr_ADMIN_CORE",
      fullName: "Wavie Admin Core",
      email: "admin@wavie.ng",
      phoneNumber: "08012345678",
      dob: "1988-03-14",
      gender: "Female",
      state: "FCT Abuja",
      kycLevel: KycLevel.LEVEL_3,
      bvn: "22211111999",
      nin: "99988877766",
      isEmailVerified: true,
      isPhoneVerified: true,
      isFrozen: false,
      role: "admin",
      referralCode: "WAV888ADM",
      referralEarnings: 0,
      balanceMain: 1500000,
      balanceBonus: 0,
      balanceCashback: 0,
      virtualAccounts: [
        {
          bankName: "Wema Bank (Monnify)",
          accountNumber: "9000000001",
          accountName: "WAVIE/ADMIN CORE",
          reference: "REF_WMS_A001"
        }
      ]
    }
  ];

  const transactions: Transaction[] = [
    {
      id: "tx_001",
      userId: "usr_WAVIE_TEST",
      type: TransactionType.TRANSFER_IN,
      amount: 25000,
      status: TransactionStatus.SUCCESS,
      reference: "MNFY_REV_72738491",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      description: "Transfer from CHINEDU OKAFOR via Providus",
      bankName: "Providus Bank",
      accountNumber: "1092837428",
      accountName: "CHINEDU OKAFOR"
    },
    {
      id: "tx_002",
      userId: "usr_WAVIE_TEST",
      type: TransactionType.AIRTIME,
      amount: 1000,
      status: TransactionStatus.SUCCESS,
      reference: "MNFY_UTIL_38472910",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
      description: "MTN Airtime Recharge for Self",
      phoneTarget: "08123456789",
      provider: "MTN",
      cashbackEarned: 10
    },
    {
      id: "tx_003",
      userId: "usr_WAVIE_TEST",
      type: TransactionType.TRANSFER_OUT,
      amount: 5000,
      status: TransactionStatus.SUCCESS,
      reference: "MNFY_DSP_9384728",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
      description: "Transfer to AMINU GARBA",
      bankName: "Guaranty Trust Bank",
      accountNumber: "0123456789",
      accountName: "AMINU GARBA"
    }
  ];

  const beneficiaries: Beneficiary[] = [
    {
      id: "ben_001",
      userId: "usr_WAVIE_TEST",
      name: "Aminu Garba",
      accountNumber: "0123456789",
      bankName: "Guaranty Trust Bank"
    },
    {
      id: "ben_002",
      userId: "usr_WAVIE_TEST",
      name: "Ngozi Eze",
      accountNumber: "2093847583",
      bankName: "Zenith Bank"
    }
  ];

  const notifications: NotificationMsg[] = [
    {
      id: "not_001",
      userId: "usr_WAVIE_TEST",
      title: "Welcome to Wavie!",
      message: "We are thrilled to have you here. Your reserved virtual accounts are accessibly set up immediately below.",
      type: "info",
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      read: true
    },
    {
      id: "not_002",
      userId: "usr_WAVIE_TEST",
      title: "Wallet Credit Alert",
      message: "Your Wavie wallet has been credited with ₦25,000.00 via Providus reserved account.",
      type: "credit",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      read: false
    }
  ];

  return { users, transactions, beneficiaries, notifications };
};

// Database persistence handlers
function readDb(): Database {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error reading database file, resetting state.", error);
  }
  const db = initialDb();
  writeDb(db);
  return db;
}

function writeDb(db: Database) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed saving store", error);
  }
}

// Global DB Reference
const db = readDb();

// List of standard Nigerian Banks pre-coded
const NIGERIAN_BANKS = [
  { code: "058", name: "Guaranty Trust Bank (GTB)" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "057", name: "Zenith Bank" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "044", name: "Access Bank" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "232", name: "Sterling Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "090110", name: "Opay" },
  { code: "090405", name: "PalmPay" },
  { code: "090267", name: "Kuda Microfinance Bank" },
  { code: "090562", name: "Moniepoint Microfinance Bank" }
];

// Mock Verified Account details based on 10 digits
const MOCK_NAMES = [
  "Bamidele Segun", "Yusuf Ibrahim", "Aisha Abubakar", "Eze Obinna", 
  "Chukwuma Sandra", "Olayemi Tolulope", "Fatimah Umar", "Nduka Emmanuel",
  "Gabriel Adebayo", "Halima Sani"
];

const getMockName = (accountNumber: string) => {
  if (accountNumber.length !== 10) return null;
  const num = parseInt(accountNumber.substring(4, 8)) || 0;
  return MOCK_NAMES[num % MOCK_NAMES.length];
};

/* ================== API ROUTES ================== */

// 1. Auth Routing
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const state = readDb();
  const user = state.users.find(u => u.email.toLowerCase() === email?.toLowerCase());
  
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Simplified sandbox password verification
  if (password === "password123" || password === "adminsecure123" || user.phoneNumber === password) {
    if (user.isFrozen) {
      return res.status(403).json({ message: "This account has been frozen by administration. Contact support@wavie.ng." });
    }
    return res.json({ success: true, user });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

app.post("/api/auth/register", (req, res) => {
  const { fullName, email, phoneNumber, dob, gender, state, referredBy } = req.body;
  const dbState = readDb();

  const exists = dbState.users.find(u => u.email.toLowerCase() === email?.toLowerCase() || u.phoneNumber === phoneNumber);
  if (exists) {
    return res.status(400).json({ message: "Email or phone number already registered" });
  }

  // Generate reserved accounts simulated Monnify integration
  const cleanedName = fullName.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
  const randomAcct1 = "90" + Math.floor(10000000 + Math.random() * 90000000).toString();
  const randomAcct2 = "10" + Math.floor(10000000 + Math.random() * 90000000).toString();

  const refCode = "WAV" + Math.floor(100 + Math.random() * 900) + cleanedName.substring(0, 3);

  const newUser: User = {
    id: generateId("usr"),
    fullName,
    email,
    phoneNumber,
    dob,
    gender,
    state,
    kycLevel: KycLevel.LEVEL_1, // Initial Phone Validated
    isEmailVerified: true,
    isPhoneVerified: true,
    isFrozen: false,
    role: "user",
    referralCode: refCode,
    referredBy: referredBy || undefined,
    referralEarnings: 0,
    balanceMain: 5000, // Welcome gift ₦5,000 to user testing!
    balanceBonus: 500,
    balanceCashback: 0,
    virtualAccounts: [
      {
        bankName: "Wema Bank (Monnify)",
        accountNumber: randomAcct1,
        accountName: `WAVIE/${cleanedName}`,
        reference: generateId("REF_WMS")
      },
      {
        bankName: "Providus Bank (Monnify)",
        accountNumber: randomAcct2,
        accountName: `WAVIE/${cleanedName}`,
        reference: generateId("REF_PVS")
      }
    ]
  };

  dbState.users.push(newUser);

  // Trigger referral bonus if supplied
  if (referredBy) {
    const referrer = dbState.users.find(u => u.referralCode.toLowerCase() === referredBy.toLowerCase());
    if (referrer) {
      referrer.balanceBonus += 500; // Reward ₦500 bonus
      referrer.referralEarnings += 500;
      
      const refNotification: NotificationMsg = {
        id: generateId("not"),
        userId: referrer.id,
        title: "Referral Bonus Credited",
        message: `Your referral code was used by ${fullName}. ₦500 bonus added!`,
        type: "credit",
        timestamp: new Date().toISOString(),
        read: false
      };
      dbState.notifications.push(refNotification);
    }
  }

  // Welcome notification
  const welcomeNotification: NotificationMsg = {
    id: generateId("not"),
    userId: newUser.id,
    title: "Account Created Successfully!",
    message: `Welcome to Wavie, ${fullName}! We have credited a test welcome seed of ₦5,000.00 to your wallet. Explore virtual bank details to receive money instantly.`,
    type: "credit",
    timestamp: new Date().toISOString(),
    read: false
  };
  dbState.notifications.push(welcomeNotification);

  writeDb(dbState);
  return res.json({ success: true, user: newUser });
});

// 2. Fetch Banks
app.get("/api/banks", (req, res) => {
  return res.json(NIGERIAN_BANKS);
});

// 3. Verify bank Account Name (Equivalent to Monnify name resolution)
app.post("/api/transfer/verify-bank", (req, res) => {
  const { accountNumber, bankCode } = req.body;
  if (!accountNumber || accountNumber.length !== 10) {
    return res.status(400).json({ message: "Invalid account number. Must be exactly 10 digits." });
  }

  const name = getMockName(accountNumber);
  if (name) {
    return res.json({ accountNumber, accountName: name, match: true });
  }

  // Fallback if random
  return res.json({ accountNumber, accountName: "MOCK VERIFIED ACCOUNT", match: true });
});

// 4. Send Money (Simulate disbursment / single transfer)
app.post("/api/transfer/send", (req, res) => {
  const { userId, bankName, accountNumber, accountName, amount, pin } = req.body;
  
  if (amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than zero." });
  }

  const stateDir = readDb();
  const user = stateDir.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (user.isFrozen) {
    return res.status(403).json({ message: "Your account is frozen. Transactions barred." });
  }

  if (user.balanceMain < amount) {
    return res.status(400).json({ message: `Insufficient funds. Current balance: ₦${user.balanceMain.toLocaleString()}` });
  }

  // Deduct
  user.balanceMain -= Number(amount);

  // Cashback Reward: Outbound transfers get 0.1% cashback up to 100 naira!
  const cashback = Math.min(Math.floor(amount * 0.001), 100);
  if (cashback > 0) {
    user.balanceCashback += cashback;
  }

  const reference = "MNFY_DSP_" + Math.floor(1000000 + Math.random() * 9000000);
  const newTx: Transaction = {
    id: generateId("tx"),
    userId: user.id,
    type: TransactionType.TRANSFER_OUT,
    amount: Number(amount),
    status: TransactionStatus.SUCCESS,
    reference,
    timestamp: new Date().toISOString(),
    description: `Transfer to ${accountName} (${bankName})`,
    bankName,
    accountNumber,
    accountName,
    cashbackEarned: cashback
  };

  stateDir.transactions.push(newTx);

  // Push notification
  const debitNotif: NotificationMsg = {
    id: generateId("not"),
    userId: user.id,
    title: "Debit Alert",
    message: `Your Wavie wallet was debited with ₦${Number(amount).toLocaleString()} sent to ${accountName}. Ref: ${reference}`,
    type: "debit",
    timestamp: new Date().toISOString(),
    read: false
  };
  stateDir.notifications.push(debitNotif);

  writeDb(stateDir);
  return res.json({ success: true, transaction: newTx, updatedUser: user });
});

// 5. Bill Utilities payment (Airtime / Data / Electricity / Cable)
app.post("/api/bills/pay", (req, res) => {
  const { userId, type, provider, amount, target, planName, meterNumber, smartCardNumber } = req.body;
  const stateDir = readDb();
  const user = stateDir.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isFrozen) return res.status(403).json({ message: "Account frozen" });
  if (user.balanceMain < Number(amount)) {
    return res.status(400).json({ message: "Insufficient balance for this utility purchase." });
  }

  // Complete debit
  user.balanceMain -= Number(amount);

  // Generate dynamic parameters based on utility
  let desc = "";
  let token: string | undefined;
  // Standard high cashback rate for bill payments (1% cashback!)
  const cashback = Math.floor(Number(amount) * 0.01);
  user.balanceCashback += cashback;

  if (type === TransactionType.AIRTIME) {
    desc = `${provider} Airtime recharge for ${target}`;
  } else if (type === TransactionType.DATA) {
    desc = `${provider} Data subscription (${planName}) for ${target}`;
  } else if (type === TransactionType.ELECTRICITY) {
    desc = `${provider} Prepaid Electricity Token for Account: ${meterNumber}`;
    // Generate real look-alike meter token
    token = Array.from({ length: 5 }, () => Math.floor(1000 + Math.random() * 9000).toString()).join("-");
  } else if (type === TransactionType.CABLE) {
    desc = `${provider} Cable Subscription renewal on Card: ${smartCardNumber}`;
  }

  const tx: Transaction = {
    id: generateId("tx"),
    userId: user.id,
    type,
    amount: Number(amount),
    status: TransactionStatus.SUCCESS,
    reference: "MNFY_BILL_" + Math.floor(10000000 + Math.random() * 90000000).toString(),
    timestamp: new Date().toISOString(),
    description: desc,
    provider,
    electricityToken: token,
    phoneTarget: target,
    meterNumber,
    smartCardNumber,
    packName: planName,
    cashbackEarned: cashback
  };

  stateDir.transactions.push(tx);

  // Credit cashback notification
  const billNotif: NotificationMsg = {
    id: generateId("not"),
    userId: user.id,
    title: "Bills Payment Successful",
    message: `Payment of ₦${amount.toLocaleString()} for ${desc} succeeded. You earned ₦${cashback} cashback!`,
    type: "debit",
    timestamp: new Date().toISOString(),
    read: false
  };
  stateDir.notifications.push(billNotif);

  writeDb(stateDir);
  return res.json({ success: true, transaction: tx, updatedUser: user });
});

// Betting account validation and funding
app.post("/api/betting/validate", (req, res) => {
  const { provider, betUserId } = req.body;
  if (!betUserId) return res.status(400).json({ message: "Betting Customer ID required" });
  
  // Custom sandbox naming
  const mockNames = ["Chidi Bet_Master", "Segun_Betking", "Bello_Odds99", "Sandra_Play01"];
  const charSum = betUserId.split("").reduce((acc: number, cur: string) => acc + cur.charCodeAt(0), 0);
  const matchedName = mockNames[charSum % mockNames.length];

  return res.json({ success: true, betUserId, accountName: matchedName });
});

app.post("/api/betting/fund", (req, res) => {
  const { userId, provider, betUserId, accountName, amount } = req.body;
  const stateDir = readDb();
  const user = stateDir.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isFrozen) return res.status(403).json({ message: "Account frozen" });
  if (user.balanceMain < Number(amount)) {
    return res.status(400).json({ message: "Insufficient balance for betting funding." });
  }

  // Deduct
  user.balanceMain -= Number(amount);

  // Generate Cashback (0.5% rate)
  const cashback = Math.floor(Number(amount) * 0.005);
  user.balanceCashback += cashback;

  const reference = "WAV_BET_" + Math.floor(1000000 + Math.random() * 9000000).toString();
  const tx: Transaction = {
    id: generateId("tx"),
    userId: user.id,
    type: TransactionType.BETTING,
    amount: Number(amount),
    status: TransactionStatus.SUCCESS,
    reference,
    timestamp: new Date().toISOString(),
    description: `Wallet funding: ${provider} (Acc ID: ${betUserId} - ${accountName})`,
    provider,
    betUserId,
    accountName,
    cashbackEarned: cashback
  };

  stateDir.transactions.push(tx);

  const notify: NotificationMsg = {
    id: generateId("not"),
    userId: user.id,
    title: `Betting Wallet Funded`,
    message: `Funded ₦${Number(amount).toLocaleString()} to ${provider}. Balance updated.`,
    type: "debit",
    timestamp: new Date().toISOString(),
    read: false
  };
  stateDir.notifications.push(notify);

  writeDb(stateDir);
  return res.json({ success: true, transaction: tx, updatedUser: user });
});

// 6. User Verification & KYC level up (BVN/NIN Sandbox matching standard Monnify endpoints)
app.post("/api/user/kyc", (req, res) => {
  const { userId, level, bvn, nin, selfieUrl } = req.body;
  const stateDir = readDb();
  const user = stateDir.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ message: "User not found" });

  if (level === KycLevel.LEVEL_2) {
    if (!bvn || bvn.length !== 11) {
      return res.status(400).json({ message: "Invalid BVN. Must be exactly 11 digits." });
    }
    user.bvn = bvn;
    user.kycLevel = KycLevel.LEVEL_2;
  } else if (level === KycLevel.LEVEL_3) {
    if (!nin || nin.length !== 11) {
      return res.status(400).json({ message: "Invalid NIN. Must be exactly 11 digits." });
    }
    user.nin = nin;
    user.selfieUrl = selfieUrl || "https://randomuser.me/api/portraits/men/32.jpg";
    user.kycLevel = KycLevel.LEVEL_3;
  }

  // Notify level up
  const kycNotification: NotificationMsg = {
    id: generateId("not"),
    userId: user.id,
    title: `KYC Level ${user.kycLevel} Approved!`,
    message: `Congratulations! Your identity documents were verified successfully via Monnify Identity APIs. Your transfer limits have been expanded.`,
    type: "security",
    timestamp: new Date().toISOString(),
    read: false
  };
  stateDir.notifications.push(kycNotification);

  // Bonus gift for Level 2 or 3!
  user.balanceBonus += 1000;

  writeDb(stateDir);
  return res.json({ success: true, updatedUser: user });
});

// 7. Simulated Monnify Payment Webhook Receiver
// To make Wavie extremely real, users can trigger simulated transactions inside the dashboard
app.post("/api/webhooks/monnify", (req, res) => {
  // Format matching real Monnify hooks
  // Payload: { eventType: "SUCCESSFUL_TRANSACTION", paymentReference: "MNFY_123", amountPaid: 5000, reservedAccountNo: "9048384728" }
  const { eventType, paymentReference, amountPaid, reservedAccountNo } = req.body;
  
  if (eventType !== "SUCCESSFUL_TRANSACTION") {
    return res.status(400).json({ message: "Unsupported event type" });
  }

  const stateDir = readDb();
  // Find which user possesses this virtual account
  let foundUser: User | undefined;
  for (const u of stateDir.users) {
    const matched = u.virtualAccounts.find(v => v.accountNumber === reservedAccountNo);
    if (matched) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser) {
    return res.status(404).json({ message: "No active reserved virtual account matching numbers." });
  }

  if (foundUser.isFrozen) {
    return res.status(403).json({ message: "Matching wallet is frozen." });
  }

  const amt = Number(amountPaid);
  foundUser.balanceMain += amt;

  // Record Transaction
  const reference = paymentReference || "MNFY_REV_" + Math.floor(10000000 + Math.random() * 90000000).toString();
  const tx: Transaction = {
    id: generateId("tx"),
    userId: foundUser.id,
    type: TransactionType.TRANSFER_IN,
    amount: amt,
    status: TransactionStatus.SUCCESS,
    reference,
    timestamp: new Date().toISOString(),
    description: `Incoming Reserved Transfer from Sandbox Monnify Endpoint`,
    bankName: "Monnify Reserved Service",
    accountNumber: reservedAccountNo,
    accountName: foundUser.fullName
  };

  stateDir.transactions.unshift(tx);

  const hookNotification: NotificationMsg = {
    id: generateId("not"),
    userId: foundUser.id,
    title: "Reserved Account Wallet Funded",
    message: `ALERT: Your virtual account received ₦${amt.toLocaleString()} via Monnify. Your wallet was credited instantly! Ref: ${reference}`,
    type: "credit",
    timestamp: new Date().toISOString(),
    read: false
  };
  stateDir.notifications.unshift(hookNotification);

  writeDb(stateDir);
  return res.json({ success: true, status: "CREDITED_SUCCESSFULLY", userId: foundUser.id });
});

// Redeem balance vouchers (Bonus/Cashback) to Main Wallet
app.post("/api/wallet/redeem", (req, res) => {
  const { userId, type } = req.body; // "bonus" or "cashback"
  const stateDir = readDb();
  const user = stateDir.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isFrozen) return res.status(403).json({ message: "Account frozen" });

  let amtToRedeem = 0;
  let label = "";

  if (type === "bonus") {
    amtToRedeem = user.balanceBonus;
    if (amtToRedeem <= 0) return res.status(400).json({ message: "Bonus balance is zero." });
    user.balanceBonus = 0;
    user.balanceMain += amtToRedeem;
    label = "Bonus Voucher Redeemed";
  } else if (type === "cashback") {
    amtToRedeem = user.balanceCashback;
    if (amtToRedeem <= 0) return res.status(400).json({ message: "Cashback balance is zero." });
    user.balanceCashback = 0;
    user.balanceMain += amtToRedeem;
    label = "Cashback Accumulated Redeemed";
  }

  const tx: Transaction = {
    id: generateId("tx"),
    userId: user.id,
    type: type === "bonus" ? TransactionType.BONUS_REDEEM : TransactionType.CASHBACK_REDEEM,
    amount: amtToRedeem,
    status: TransactionStatus.SUCCESS,
    reference: "WAV_RED_" + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toISOString(),
    description: `${label} to Main Wallet`
  };

  stateDir.transactions.unshift(tx);

  const notif: NotificationMsg = {
    id: generateId("not"),
    userId: user.id,
    title: label,
    message: `You successfully converted ₦${amtToRedeem.toLocaleString()} from your ${type} bag to withdrawable Main cash balance.`,
    type: "credit",
    timestamp: new Date().toISOString(),
    read: false
  };
  stateDir.notifications.unshift(notif);

  writeDb(stateDir);
  return res.json({ success: true, updatedUser: user });
});

// 8. Fetch User Notifications
app.get("/api/notifications/:userId", (req, res) => {
  const stateDir = readDb();
  const filtered = stateDir.notifications.filter(n => n.userId === req.params.userId);
  return res.json(filtered);
});

app.post("/api/notifications/read", (req, res) => {
  const { userId } = req.body;
  const stateDir = readDb();
  stateDir.notifications.forEach(n => {
    if (n.userId === userId) n.read = true;
  });
  writeDb(stateDir);
  return res.json({ success: true });
});

// 9. Fetch Transactions
app.get("/api/transactions/:userId", (req, res) => {
  const stateDir = readDb();
  const list = stateDir.transactions.filter(t => t.userId === req.params.userId);
  return res.json(list);
});

// 10. Admin Endpoints
app.get("/api/admin/users", (req, res) => {
  const stateDir = readDb();
  return res.json(stateDir.users);
});

app.get("/api/admin/transactions", (req, res) => {
  const stateDir = readDb();
  return res.json(stateDir.transactions);
});

app.post("/api/admin/users/freeze", (req, res) => {
  const { targetUserId, isFrozen } = req.body;
  const stateDir = readDb();
  const target = stateDir.users.find(u => u.id === targetUserId);
  if (!target) return res.status(404).json({ message: "User not found" });

  target.isFrozen = isFrozen;
  writeDb(stateDir);
  return res.json({ success: true, targetUser: target });
});

app.post("/api/admin/users/commissions", (req, res) => {
  // Configured Commission rate adjustment
  const { promoBonus } = req.body;
  return res.json({ success: true, message: `Promo bonuses successfully tuned to ₦${promoBonus}` });
});

// Automation Routes for Live Auto-Transactions
app.get("/api/admin/automation-config", (req, res) => {
  return res.json({
    enabled: liveAutomationEnabled,
    count: autoTransactionsCount,
    logs: autoLogs
  });
});

app.post("/api/admin/toggle-automation", (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled !== "undefined") {
    liveAutomationEnabled = enabled;
  } else {
    liveAutomationEnabled = !liveAutomationEnabled;
  }
  
  const statusStr = liveAutomationEnabled ? "ENABLED" : "DISABLED";
  const logMsg = `[SYSTEM] live transaction automation has been toggled ${statusStr}`;
  autoLogs.unshift(logMsg);
  if (autoLogs.length > 50) autoLogs.pop();

  return res.json({ 
    success: true, 
    enabled: liveAutomationEnabled, 
    message: `Live Transaction Automation is now ${statusStr}.` 
  });
});

/* ================== GEMINI SERVER-SIDE ADVISOR ================== */
app.post("/api/gemini/advisor", async (req, res) => {
  const { userId, prompt, chatHistory } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ 
      error: "Slight setup required! Add GEMINI_API_KEY in Settings > Secrets to unlock Wavie's intelligent AI finance assistance immediately." 
    });
  }

  try {
    const stateDir = readDb();
    const user = stateDir.users.find(u => u.id === userId);
    const userTxs = stateDir.transactions.filter(t => t.userId === userId).slice(0, 5);

    if (!user) {
      return res.status(404).json({ error: "Active user profile details absent." });
    }

    // Build context
    const financialSummary = `
      User Info: Name is ${user.fullName}, Phone ${user.phoneNumber}, State ${user.state}.
      Financial Balances: Main Account Wallet Balance ₦${user.balanceMain.toLocaleString()}, Bonus Bag ₦${user.balanceBonus.toLocaleString()}, Cashback Bag ₦${user.balanceCashback.toLocaleString()}, Total Referral Earned ₦${user.referralEarnings.toLocaleString()}.
      Recent Ledger Logs: ${JSON.stringify(userTxs.map(t => ({
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        timestamp: t.timestamp
      })))}
    `;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const systemInstruction = `
      You are 'Wavie AI', an ultra-intelligent, friendly, and humorous Nigerian personal financial manager integrated inside Wavie (a premium fintech app in Nigeria).
      Your goal is to offer wise, smart, and realistic budget advising, savings strategies, and explain transaction events nicely.
      Use local Nigerian culture, popular idioms, and engaging banking slangs tastefully where appropriate (e.g., 'urgent 2k', 'Ajo/Esusu matching', 'chop life', 'japa savings', 'no gree for peer pressure', 'owanbe budget', 'shishi', 'soft life').
      Do not overdo it, keep advice very concrete, sound, and fully focused on helping them save money or explaining bills.
      Refer to the user's specific financial circumstances: Name: ${user.fullName}, current wallet balance of ₦${user.balanceMain.toLocaleString()}, cashback of ₦${user.balanceCashback.toLocaleString()}.
      Structure answers with clean Markdown headings, bullet points, and neat visual emojis. Keep response concise, friendly, and directly beneficial! No technical log variables or directory paths.
    `;

    // Map chatHistory to standard Gemini chat parts if present and structured
    const contentsParam: any = [];
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach((h: any) => {
        contentsParam.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        });
      });
    }

    // Append the latest user query
    contentsParam.push({
      role: "user",
      parts: [{ text: `Based on this state config: ${financialSummary}. User query: ${prompt}` }]
    });

    const gResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsParam,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    return res.json({ text: gResponse.text });
  } catch (err: any) {
    console.error("Gemini Advisor failure:", err);
    return res.status(500).json({ error: `Wavie AI was unable to generate advice details. Err: ${err?.message || err}` });
  }
});


// Automated Live Transaction System Engine
const SIMULATED_PAYERS = [
  "Emeka Okafor", "Fatima Aliyu", "Tunde Balogun", "Olumide Olowo", 
  "Nkechi Nwachukwu", "Musa Yar'Adua", "Yusuf Danjuma", "Chioma Nze", 
  "Kazeem Quadri", "Funmilayo Ransome", "Aramide Cole", "Jennifer Okoye",
  "Olanrewaju Kola", "Bashir Bello", "Tobi Adeleke"
];

const BILL_PROVIDERS: Record<string, string[]> = {
  AIRTIME: ["MTN", "Airtel", "Glo", "9mobile"],
  DATA: ["MTN", "Airtel", "Glo", "9mobile"],
  ELECTRICITY: ["IKEDC", "EKEDC", "AEDC", "EEDC"]
};

function startLiveAutomation() {
  setInterval(() => {
    if (!liveAutomationEnabled) return;

    try {
      const stateDir = readDb();
      if (!stateDir.users || stateDir.users.length === 0) return;

      // Pick a random user (usually usr_WAVIE_TEST or any active user so they experience live activity!)
      const user = stateDir.users[Math.floor(Math.random() * stateDir.users.length)];
      if (user.isFrozen) return;

      // 60% probability of credit transfer (deposit), 40% probability of bill purchase/debit
      const isDeposit = user.balanceMain < 10000 ? true : (Math.random() > 0.4);

      if (isDeposit) {
        // Handle incoming auto-credit
        if (!user.virtualAccounts || user.virtualAccounts.length === 0) return;
        const vAcct = user.virtualAccounts[Math.floor(Math.random() * user.virtualAccounts.length)];
        
        const amountPaid = [3000, 5000, 7500, 15000, 25000, 40000][Math.floor(Math.random() * 6)];
        const payerName = SIMULATED_PAYERS[Math.floor(Math.random() * SIMULATED_PAYERS.length)];
        const paymentReference = "MNFY_AUTO_" + Math.floor(10000000 + Math.random() * 90000000).toString();

        user.balanceMain += amountPaid;

        const tx: Transaction = {
          id: generateId("tx"),
          userId: user.id,
          type: TransactionType.TRANSFER_IN,
          amount: amountPaid,
          status: TransactionStatus.SUCCESS,
          reference: paymentReference,
          timestamp: new Date().toISOString(),
          description: `Incoming Auto Transfer from ${payerName.toUpperCase()}`,
          bankName: vAcct.bankName.replace(" (Monnify)", ""),
          accountNumber: vAcct.accountNumber,
          accountName: user.fullName
        };

        stateDir.transactions.unshift(tx);

        const creditNotif: NotificationMsg = {
          id: generateId("not"),
          userId: user.id,
          title: "Automated Sandbox Credit",
          message: `INFO: Your reserved virtual account received an auto-credit of ₦${amountPaid.toLocaleString()} from ${payerName}. Ref: ${paymentReference}`,
          type: "credit",
          timestamp: new Date().toISOString(),
          read: false
        };
        stateDir.notifications.unshift(creditNotif);

        const logMsg = `[AUTO] Successfully credited ${user.fullName} with ₦${amountPaid.toLocaleString()} via simulated bank routing.`;
        autoLogs.unshift(logMsg);
        if (autoLogs.length > 30) autoLogs.pop();
        autoTransactionsCount++;
      } else {
        // Handle outgoing auto-debits (such as airtime, data or electricity subscription)
        const billType = [TransactionType.AIRTIME, TransactionType.DATA, TransactionType.ELECTRICITY][Math.floor(Math.random() * 3)];
        let amount = 0;
        let desc = "";
        let provider = "";
        let token: string | undefined;

        if (billType === TransactionType.AIRTIME) {
          amount = [1000, 2000, 3000][Math.floor(Math.random() * 3)];
          provider = BILL_PROVIDERS.AIRTIME[Math.floor(Math.random() * BILL_PROVIDERS.AIRTIME.length)];
          const randomMobile = "081" + Math.floor(10000000 + Math.random() * 90000000).toString();
          desc = `${provider} Airtime Auto-Topup for ${randomMobile}`;
        } else if (billType === TransactionType.DATA) {
          amount = [1500, 3000, 5000][Math.floor(Math.random() * 3)];
          provider = BILL_PROVIDERS.DATA[Math.floor(Math.random() * BILL_PROVIDERS.DATA.length)];
          const randomMobile = "080" + Math.floor(10000000 + Math.random() * 90000000).toString();
          desc = `${provider} Data Auto-Refill (15GB Plan) for ${randomMobile}`;
        } else if (billType === TransactionType.ELECTRICITY) {
          amount = [2500, 5000, 10000][Math.floor(Math.random() * 3)];
          provider = BILL_PROVIDERS.ELECTRICITY[Math.floor(Math.random() * BILL_PROVIDERS.ELECTRICITY.length)] + " Prepaid";
          const randomMeter = "24" + Math.floor(100000000 + Math.random() * 900000000).toString();
          desc = `${provider} disco electric prepaid token for Meter: ${randomMeter}`;
          token = Array.from({ length: 5 }, () => Math.floor(1000 + Math.random() * 9000).toString()).join("-");
        }

        if (user.balanceMain >= amount) {
          user.balanceMain -= amount;
          // Generate 1% cashback on bills
          const cashback = Math.floor(amount * 0.01);
          user.balanceCashback += cashback;

          const paymentReference = "MNFY_AUTO_BILL_" + Math.floor(10000000 + Math.random() * 90000000).toString();
          const tx: Transaction = {
            id: generateId("tx"),
            userId: user.id,
            type: billType,
            amount,
            status: TransactionStatus.SUCCESS,
            reference: paymentReference,
            timestamp: new Date().toISOString(),
            description: desc,
            provider,
            electricityToken: token,
            cashbackEarned: cashback
          };

          stateDir.transactions.unshift(tx);

          const debitNotif: NotificationMsg = {
            id: generateId("not"),
            userId: user.id,
            title: "Automated Bill Executed",
            message: `SUCCESS: Auto-refill of ₦${amount.toLocaleString()} for ${desc} resolved successfully online. You earned ₦${cashback} cashback!`,
            type: "debit",
            timestamp: new Date().toISOString(),
            read: false
          };
          stateDir.notifications.unshift(debitNotif);

          const logMsg = `[AUTO] Dispatched automated bill charge for ${user.fullName} of ₦${amount.toLocaleString()} for ${billType}.`;
          autoLogs.unshift(logMsg);
          if (autoLogs.length > 30) autoLogs.pop();
          autoTransactionsCount++;
        }
      }

      writeDb(stateDir);
    } catch (e) {
      console.error("Critical error in live transaction automation loop:", e);
    }
  }, 18000); // Executed every 18 seconds
}

// Express + Vite Asset pipeline management
async function startApp() {
  // Start the background live transaction simulator
  startLiveAutomation();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend server successfully running on port ${PORT}`);
  });
}

startApp().catch(e => {
  console.error("Express initialization failure", e);
});
