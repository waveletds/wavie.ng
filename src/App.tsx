/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from "react";
import { 
  User, 
  KycLevel, 
  Transaction, 
  TransactionType, 
  TransactionStatus, 
  Beneficiary,
  NotificationMsg,
  VirtualAccount
} from "./types.js";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Users, 
  Smartphone, 
  Wifi, 
  Zap, 
  Tv, 
  Dribbble, 
  MoreHorizontal, 
  Search, 
  Download, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  LogOut, 
  Bell, 
  Sliders, 
  X, 
  Menu, 
  Copy, 
  Share2, 
  Bot, 
  Lock, 
  Unlock, 
  FileText, 
  ChevronRight, 
  Coins, 
  HelpCircle,
  PiggyBank,
  Sparkles
} from "lucide-react";
import WavieAssistant from "./components/WavieAssistant.js";

// Safe copy helper
const copyToClipboard = (text: string, label: string, setNotification: (text: string) => void) => {
  navigator.clipboard.writeText(text);
  setNotification(`${label} copied to clipboard!`);
};

export default function App() {
  // Session state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "admin" | "help">("home");

  // Mobile View Specific States
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [mobileActiveSubTab, setMobileActiveSubTab] = useState<"home" | "bills" | "transfer" | "history" | "ai" | "admin">("home");
  const [mobileTransferMode, setMobileTransferMode] = useState<"send" | "fund">("send");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auth States
  const [authEmail, setAuthEmail] = useState("test@wavie.ng");
  const [authPassword, setAuthPassword] = useState("password123");
  const [authError, setAuthError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Registration States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDob, setRegDob] = useState("1998-05-12");
  const [regGender, setRegGender] = useState<"Male" | "Female" | "Other">("Male");
  const [regState, setRegState] = useState("Lagos");
  const [regReferredBy, setRegReferredBy] = useState("");

  // App notifications toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals / Action states
  const [activeModal, setActiveModal] = useState<
    "send" | "add" | "airtime" | "data" | "electricity" | "cable" | "betting" | "kyc" | "receipt" | null
  >(null);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  // Send Money Form State
  const [banks, setBanks] = useState<{code: string, name: string}[]>([]);
  const [sendBank, setSendBank] = useState("");
  const [sendAccount, setSendAccount] = useState("");
  const [verifiedAccountName, setVerifiedAccountName] = useState("");
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [sendPin, setSendPin] = useState("1234");
  const [sendNarrative, setSendNarrative] = useState("");
  const [sendError, setSendError] = useState("");

  // Webhook Simulator State (Add Money)
  const [fundingAmount, setFundingAmount] = useState("15000");
  const [fundingBankNo, setFundingBankNo] = useState("");
  const [isFundingSimulating, setIsFundingSimulating] = useState(false);

  // Airtime & Data State
  const [billNetwork, setBillNetwork] = useState("MTN");
  const [billPhone, setBillPhone] = useState("");
  const [billAmount, setBillAmount] = useState("1000");
  const [dataPlan, setDataPlan] = useState("");
  const billNetworks = ["MTN", "Airtel", "Glo", "9mobile"];
  const mtnDataPlans = [
    { name: "1GB Daily • ₦350", price: 350 },
    { name: "3GB 2-Day • ₦800", price: 800 },
    { name: "10GB Monthly • ₦3,000", price: 3000 },
    { name: "20GB Monthly • ₦5,000", price: 5000 }
  ];

  // Electricity State
  const [elecProvider, setElecProvider] = useState("IKEDC (Ikeja Prepaid)");
  const [elecMeter, setElecMeter] = useState("");
  const [elecAmount, setElecAmount] = useState("5000");
  const [elecMeterValidName, setElecMeterValidName] = useState("");
  const [isValidatingMeter, setIsValidatingMeter] = useState(false);
  const elecProviders = ["IKEDC", "EKEDC", "AEDC", "PHED", "EEDC", "IBEDC", "KEDCO"];

  // Cable State
  const [cableProvider, setCableProvider] = useState("DStv");
  const [cableCardNum, setCableCardNum] = useState("");
  const [cablePackage, setCablePackage] = useState("DSTV Compact (₦12,500)");
  const [cableAmount, setCableAmount] = useState(12500);
  const cablePackages: Record<string, {name: string, price: number}[]> = {
    "DStv": [
      { name: "DSTV Great Wall • ₦3,500", price: 3500 },
      { name: "DSTV Access • ₦6,200", price: 6200 },
      { name: "DSTV Compact • ₦12,500", price: 12500 },
      { name: "DSTV Premium • ₦29,500", price: 29500 }
    ],
    "GOtv": [
      { name: "GOTV Smallie • ₦1,800", price: 1800 },
      { name: "GOTV Jinja • ₦3,300", price: 3300 },
      { name: "GOTV Max • ₦7,200", price: 7200 },
      { name: "GOTV Supa+ • ₦15,700", price: 15700 }
    ],
    "Startimes": [
      { name: "Nova Basic • ₦1,500", price: 1500 },
      { name: "Classic Smart • ₦3,900", price: 3900 },
      { name: "Super Premium • ₦6,500", price: 6500 }
    ]
  };

  // Betting State
  const [betProvider, setBetProvider] = useState("Bet9ja");
  const [betUserId, setBetUserId] = useState("");
  const [betVerifiedName, setBetVerifiedName] = useState("");
  const [isVerifyingBet, setIsVerifyingBet] = useState(false);
  const [betAmount, setBetAmount] = useState("2500");
  const betProviders = ["Bet9ja", "SportyBet", "BetKing", "1xBet", "NairaBet"];

  // KYC Inputs
  const [kycBvn, setKycBvn] = useState("");
  const [kycNin, setKycNin] = useState("");

  // Ledger Filter
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerFilterType, setLedgerFilterType] = useState<string>("ALL");

  // Admin Dashboard States
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminTxs, setAdminTxs] = useState<Transaction[]>([]);
  const [promoTuningBonus, setPromoTuningBonus] = useState(1000);
  const [adminLogs, setAdminLogs] = useState<string[]>([
    "System security audits reporting active connections on PORT 3000",
    "Verified identity validation pipelines matching Monnify Reserved routing modules"
  ]);

  // Balance values privacy toggle
  const [hideBalances, setHideBalances] = useState(false);

  // Live Automation States
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [automationCount, setAutomationCount] = useState(0);
  const [automationLogs, setAutomationLogs] = useState<string[]>([]);

  // Dynamic toast banner closer
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Load Banks
  useEffect(() => {
    fetch("/api/banks")
      .then((res) => res.json())
      .then((data) => setBanks(data))
      .catch((err) => console.error("Error loading banks list", err));
  }, []);

  // Monitor viewport size for mobile viewport rendering
  useEffect(() => {
    const checkScale = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkScale();
    window.addEventListener("resize", checkScale);
    return () => window.removeEventListener("resize", checkScale);
  }, []);

  // Sync state data periodically when logged in
  const refreshUserData = (userId: string) => {
    // Rely on fetching admin state or simulate updates
    fetch(`/api/notifications/${userId}`)
      .then((res) => res.json())
      .then((notifs) => setNotifications(notifs));

    fetch(`/api/transactions/${userId}`)
      .then((res) => res.json())
      .then((txs) => setTransactions(txs));

    // Reload users list to grab current wallet balance
    fetch(`/api/admin/users`)
      .then((res) => res.json())
      .then((usersList: User[]) => {
        const updatedSelf = usersList.find((u) => u.id === userId);
        if (updatedSelf) {
          setCurrentUser(updatedSelf);
          // Set primary virtual account as default to fund inside webhook simulator
          if (updatedSelf.virtualAccounts?.length > 0 && !fundingBankNo) {
            setFundingBankNo(updatedSelf.virtualAccounts[0].accountNumber);
          }
        }
        setAdminUsers(usersList);
      });

    fetch(`/api/admin/transactions`)
      .then((res) => res.json())
      .then((allTxs) => setAdminTxs(allTxs));

    // Fetch live automation configurations
    fetch(`/api/admin/automation-config`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setAutomationEnabled(data.enabled);
          setAutomationCount(data.count);
          setAutomationLogs(data.logs || []);
        }
      })
      .catch((e) => console.error("Error fetching live automation state", e));
  };

  const handleToggleAutomation = async () => {
    try {
      const res = await fetch("/api/admin/toggle-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAutomationEnabled(data.enabled);
      setToastMsg(data.message);
      if (currentUser?.id) refreshUserData(currentUser.id);
    } catch (err: any) {
      setToastMsg("Could not toggle live transaction automation.");
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      refreshUserData(currentUser.id);
      const interval = setInterval(() => refreshUserData(currentUser.id), 4500);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  // Resolving Outbound Transfer recipient name
  useEffect(() => {
    if (sendAccount.length === 10) {
      setIsVerifyingAccount(true);
      setVerifiedAccountName("");
      setSendError("");
      fetch("/api/transfer/verify-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountNumber: sendAccount, bankCode: sendBank })
      })
        .then((res) => res.json())
        .then((data) => {
          setIsVerifyingAccount(false);
          if (data.accountName) {
            setVerifiedAccountName(data.accountName);
          } else {
            setSendError("Account name lookup failed.");
          }
        })
        .catch(() => {
          setIsVerifyingAccount(false);
          setSendError("Network lookup error.");
        });
    } else {
      setVerifiedAccountName("");
    }
  }, [sendAccount, sendBank]);

  // Resolving Meter Validation
  useEffect(() => {
    if (elecMeter.length >= 11) {
      setIsValidatingMeter(true);
      setTimeout(() => {
        setIsValidatingMeter(false);
        const sums = elecMeter.split("").reduce((acc, c) => acc + (parseInt(c) || 0), 0);
        const mockMeterHolders = ["Adegoke Samuel Prepaid", "Ogunleye Toyin Apartment 4", "Obi Joshua Jnr"];
        setElecMeterValidName(mockMeterHolders[sums % mockMeterHolders.length]);
      }, 800);
    } else {
      setElecMeterValidName("");
    }
  }, [elecMeter]);

  // Resolving Betting Player accounts
  useEffect(() => {
    if (betUserId.length >= 6) {
      setIsVerifyingBet(true);
      fetch("/api/betting/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: betProvider, betUserId })
      })
        .then((res) => res.json())
        .then((data) => {
          setIsVerifyingBet(false);
          if (data.accountName) setBetVerifiedName(data.accountName);
        })
        .catch(() => setIsVerifyingBet(false));
    } else {
      setBetVerifiedName("");
    }
  }, [betUserId, betProvider]);

  // Handler: Login execution
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed authentication checks");
      }
      setCurrentUser(data.user);
      setToastMsg(`Welcome back to Wavie, ${data.user.fullName}!`);
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in.");
    }
  };

  // Handler: Registration execution
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!regName || !regEmail || !regPhone) {
      setAuthError("Full Name, Email and Phone Number are required.");
      return;
    }
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regName,
          email: regEmail,
          phoneNumber: regPhone,
          dob: regDob,
          gender: regGender,
          state: regState,
          referredBy: regReferredBy
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not register new user.");
      }
      setCurrentUser(data.user);
      setToastMsg(`Your account has been seeded! Welcome to Wavie.`);
      setIsRegistering(false);
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong during registration.");
    }
  };

  // Handler: Outbound bank transfer execution
  const handleSendMoneyAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError("");
    if (!currentUser) return;
    if (!verifiedAccountName) {
      setSendError("Please enter a valid 10-digit account number first.");
      return;
    }
    if (Number(sendAmount) <= 0) {
      setSendError("Please transfer details are empty.");
      return;
    }
    if (currentUser.balanceMain < Number(sendAmount)) {
      setSendError("Insufficient funds in your main wallet balance.");
      return;
    }

    try {
      const response = await fetch("/api/transfer/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          bankName: sendBank || "Guaranty Trust Bank (GTB)",
          accountNumber: sendAccount,
          accountName: verifiedAccountName,
          amount: Number(sendAmount),
          pin: sendPin
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error finalizing Monnify single transfer.");
      }

      setToastMsg(`₦${Number(sendAmount).toLocaleString()} sent to ${verifiedAccountName} successfully!`);
      setCurrentUser(data.updatedUser);
      setSelectedReceiptTx(data.transaction);
      setActiveModal("receipt");
      
      // Reset sending state
      setSendAccount("");
      setSendAmount("");
      setVerifiedAccountName("");
    } catch (err: any) {
      setSendError(err.message || "Failure completing sending ledger.");
    }
  };

  // Handler: Utility bill payment execution
  const handleBillPayment = async (type: TransactionType, provider: string, amount: number, target: string, extra: { planName?: string, meterNumber?: string, smartCardNumber?: string }) => {
    if (!currentUser) return;
    if (currentUser.balanceMain < amount) {
      setToastMsg("Error: Insufficient balance to fund this request.");
      return;
    }

    try {
      const response = await fetch("/api/bills/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          type,
          provider,
          amount,
          target,
          planName: extra.planName,
          meterNumber: extra.meterNumber,
          smartCardNumber: extra.smartCardNumber
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Purchase debit failure.");
      }

      setToastMsg(`Successfully bought ${provider} bundle for ${target || extra.meterNumber || extra.smartCardNumber}!`);
      setCurrentUser(data.updatedUser);
      setSelectedReceiptTx(data.transaction);
      setActiveModal("receipt");
    } catch (err: any) {
      setToastMsg(err.message || "Verification of single bill checkout aborted.");
    }
  };

  // Handler: Betting wallet funding execution
  const handleBetFunding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!betVerifiedName) {
      setToastMsg("Verify your player client ID profile name first.");
      return;
    }
    if (currentUser.balanceMain < Number(betAmount)) {
      setToastMsg("Insufficient balance to allocate bet budget.");
      return;
    }

    try {
      const response = await fetch("/api/betting/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          provider: betProvider,
          betUserId,
          accountName: betVerifiedName,
          amount: Number(betAmount)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setToastMsg(`Betting wallet ${betProvider} credited successfully!`);
      setCurrentUser(data.updatedUser);
      setSelectedReceiptTx(data.transaction);
      setActiveModal("receipt");
      setBetUserId("");
      setBetVerifiedName("");
    } catch (err: any) {
      setToastMsg(err.message || "Could not complete betting transfer.");
    }
  };

  // Handler: Sandbox Webhook Simulation (Fund Virtual Account)
  const handleTriggerWebhookSimulator = async () => {
    if (!fundingBankNo) {
      setToastMsg("Establish a dynamic Monnify Account No. to simulate.");
      return;
    }
    setIsFundingSimulating(true);
    try {
      const response = await fetch("/api/webhooks/monnify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "SUCCESSFUL_TRANSACTION",
          paymentReference: "MNFY_SIM_" + Math.floor(100000 + Math.random() * 900000),
          amountPaid: Number(fundingAmount),
          reservedAccountNo: fundingBankNo
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Webhooks processing timed out.");
      }

      setToastMsg(`SUCCESS: Monnify Webhook listener was triggered! ₦${Number(fundingAmount).toLocaleString()} credited instantly.`);
      if (currentUser) refreshUserData(currentUser.id);
      setActiveModal(null);
    } catch (err: any) {
      setToastMsg(err.message || "Could not simulate. Contact developer console.");
    } finally {
      setIsFundingSimulating(false);
    }
  };

  // Handler: Redeem voucher to Main balance
  const handleRedeemVoucher = async (type: "bonus" | "cashback") => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/wallet/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setToastMsg(`Converted your entire ${type} voucher into main spend cash!`);
      setCurrentUser(data.updatedUser);
      refreshUserData(currentUser.id);
    } catch (err: any) {
      setToastMsg(err.message || "Unable to redeem voucher funds.");
    }
  };

  // Handler: Identity upgrade
  const handleKycLevelSubmit = async (e: React.FormEvent, level: KycLevel) => {
    e.preventDefault();
    if (!currentUser) return;
    const documentNum = level === KycLevel.LEVEL_2 ? kycBvn : kycNin;
    if (documentNum.length !== 11) {
      setToastMsg("Verification documents must be exactly 11 digits.");
      return;
    }

    try {
      const response = await fetch("/api/user/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          level,
          bvn: level === KycLevel.LEVEL_2 ? kycBvn : undefined,
          nin: level === KycLevel.LEVEL_3 ? kycNin : undefined,
          selfieUrl: "https://randomuser.me/api/portraits/men/44.jpg"
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setToastMsg(`Identity upgrade approved instantly! Level up reward added to balance.`);
      setCurrentUser(data.updatedUser);
      setActiveModal(null);
      setKycBvn("");
      setKycNin("");
      refreshUserData(currentUser.id);
    } catch (err: any) {
      setToastMsg(err.message || "Error validating identity endpoints.");
    }
  };

  // Handler: Mark all system notifications read
  const handleMarkNotificationsRead = async () => {
    if (!currentUser) return;
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id })
    });
    refreshUserData(currentUser.id);
  };

  // Handler: CSV ledger export simulation
  const handleExportLedgerCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["Activity ID", "Type", "Reference", "Time", "Amount (NGN)", "Description", "Status"];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.reference,
      t.timestamp,
      t.amount,
      t.description.replace(/,/g, " "),
      t.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Wavie_Financial_Statement_${currentUser?.fullName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handler: Admin toggle user freeze
  const handleAdminFreezeUser = async (targetUserId: string, stateFreeze: boolean) => {
    try {
      const response = await fetch("/api/admin/users/freeze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, isFrozen: stateFreeze })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setToastMsg(`User ${data.targetUser.fullName} account was ${stateFreeze ? "FROZEN" : "UNFROZEN"} successfully.`);
      if (currentUser) refreshUserData(currentUser.id);
    } catch (err: any) {
      setToastMsg(err.message);
    }
  };

  // Handler: Admin tuning promo bonus levels
  const handleAdminTuningCommissions = async () => {
    try {
      const response = await fetch("/api/admin/users/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoBonus: promoTuningBonus })
      });
      const data = await response.json();
      setToastMsg(data.message);
      setAdminLogs(prev => [`Referral tuning updated to ₦${promoTuningBonus}`, ...prev]);
    } catch (err: any) {
      setToastMsg("Tuning error");
    }
  };

  // Filter transactions for search bar
  const filteredTxs = transactions.filter((t) => {
    const matchesSearch = 
      t.description.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
      t.reference.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      t.amount.toString().includes(ledgerSearch);

    const matchesType = ledgerFilterType === "ALL" || t.type === ledgerFilterType;
    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div id="wavie-root-element" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      
      {/* Toast Alert Banner */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700/50 flex items-center gap-3 text-xs font-semibold animate-bounce duration-500">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="ml-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* NO SESSION: Beautiful login / registration views */}
      {!currentUser ? (
        <div className="flex-1 flex flex-col md:grid md:grid-cols-12 min-h-screen">
          
          {/* Left Hero Section */}
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
            {/* Absolute visual layout decorators */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-24 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>

            <div className="flex items-center gap-2.5 z-10">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-white font-extrabold text-xl tracking-tight">W</span>
              </div>
              <span className="text-xl font-black tracking-widest uppercase text-indigo-200">Wavie</span>
            </div>

            <div className="my-auto py-12 z-10">
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold tracking-widest uppercase py-1 px-2.5 rounded-full border border-emerald-500/30">
                Monnify Sandbox Enabled
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none mt-4 text-white">
                Fintech, Simplified.
              </h1>
              <p className="text-sm text-indigo-100/80 mt-4 leading-relaxed max-w-sm">
                Open dedicated Nigeria accounts, purchase instant airtime, subscribe digital channels, and consult our smart financial assistant matching Nigeria's fast-moving economy.
              </p>

              {/* Bullet advantages */}
              <div className="mt-8 space-y-3.5">
                {[
                  "Immediate Virtual Accounts with Wema & Providus Banks",
                  "Automated Credits via Real Webhook Sandbox Receiver",
                  "Fast Airtime, Data, TV & Electricity Bill Dispatch",
                  "Next-Gen Gemini Financial Advisor & Spend Diagnostics"
                ].map((item, id) => (
                  <div key={id} className="flex items-center gap-2.5 text-xs text-indigo-100/90">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-300 font-mono">
              <span>Standard Express Backend</span>
              <span>Secure JWT • Sandbox</span>
            </div>
          </div>

          {/* Right Input Form Section */}
          <div className="md:col-span-7 flex items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-100 relative">
              
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {isRegistering ? "Generate Wallet Account" : "Access Wavie Account"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isRegistering 
                      ? "Get started today. Accounts credited instantly." 
                      : "Login to test live Monnify flow pipelines."
                    }
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setAuthError("");
                  }}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  {isRegistering ? "Have an account?" : "No account yet?"}
                </button>
              </div>

              {authError && (
                <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-2xl text-xs text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Login UI Form */}
              {!isRegistering ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5ClassName">
                      Corporate Sandbox Email
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. test@wavie.ng"
                      className="w-full text-xs font-medium border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Test Pin Password
                      </label>
                      <span className="text-[10px] text-indigo-600 font-mono">Accepts: password123</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Enter password123"
                      className="w-full text-xs font-medium border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl px-4 py-3 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-lg shadow-indigo-100 transition-all uppercase tracking-wider"
                  >
                    Authenticate Account Secures
                  </button>

                  <div className="pt-4 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400">
                      🔒 Sandbox sandbox credentials stored securely. Under development mode.
                    </p>
                  </div>
                </form>
              ) : (
                /* Registration UI Form */
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Tunde Adeleke"
                        className="w-full text-xs border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl px-3 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Corporate Email
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="tunde@yahoo.com"
                        className="w-full text-xs border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl px-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Phone Target (OTP)
                      </label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="08162837492"
                        className="w-full text-xs border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl px-3 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        required
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className="w-full text-xs border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl px-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Gender Selection
                      </label>
                      <select
                        value={regGender}
                        onChange={(e: any) => setRegGender(e.target.value)}
                        className="w-full text-xs border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl px-3 py-2.5 outline-none bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        State of Residence
                      </label>
                      <input
                        type="text"
                        value={regState}
                        onChange={(e) => setRegState(e.target.value)}
                        placeholder="e.g. Lagos"
                        className="w-full text-xs border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl px-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={regReferredBy}
                      onChange={(e) => setRegReferredBy(e.target.value)}
                      placeholder="e.g. WAV505ADE (Rewards referrer ₦500)"
                      className="w-full text-xs border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl px-3 py-2.5 outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-2xl shadow-lg transition-all uppercase tracking-wider"
                    >
                      Process Web Signature
                    </button>
                    <p className="text-[9px] text-center text-slate-400 mt-2">
                      💡 Signing up triggers automatic creation of virtual account reserves credited via mock webhooks. You automatically start at Verified KYC Level 1.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : isMobileScreen ? (
        /* DEDICATED PHONE VIEWS / SMARTPHONE FINTECH CANVAS */
        <div id="mobile-canvas-wrapper" className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800 font-sans pb-24 relative select-none">
          
          {/* Mobile Sidebar Navigation Drawer Overlay & Panel */}
          {isMobileSidebarOpen && (
            <div 
              id="mobile-sidebar-backdrop"
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 transition-opacity duration-200 animate-fade-in"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <div 
                id="mobile-sidebar-drawer"
                className="w-72 max-w-[85%] bg-white h-full flex flex-col shadow-2xl relative animate-slide-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-950 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-7.5 h-7.5 bg-indigo-650 rounded-lg flex items-center justify-center text-white font-black text-sm">
                      W
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black tracking-widest uppercase text-white font-display leading-none">Wavie Mobile</h4>
                      <p className="text-[7.5px] text-indigo-300 font-bold uppercase tracking-wider mt-0.5 leading-none">Fintech Sandbox</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="w-7.5 h-7.5 rounded-lg bg-indigo-900 text-indigo-200 flex items-center justify-center hover:bg-indigo-800 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Sidebar User Profile Info */}
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <div 
                    onClick={() => {
                      setIsMobileSidebarOpen(false);
                      setActiveModal("kyc");
                    }}
                    className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/50 p-1.5 rounded-xl transition-all"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-650 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-md">
                      {currentUser?.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0-ext select-none">
                      <p className="text-[11px] font-black text-slate-800 truncate leading-tight">{currentUser?.fullName}</p>
                      <p className="text-[8px] text-slate-500 truncate mt-0.5">{currentUser?.email}</p>
                      <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-800 text-[6.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-1.5">
                        <ShieldCheck className="w-2 h-2" />
                        Level {currentUser?.kycLevel} Account
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sidebar Navigation Items */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1.5">Main Menu</p>
                  
                  <button
                    onClick={() => {
                      setMobileActiveSubTab("home");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all font-display ${
                      mobileActiveSubTab === "home" 
                        ? "bg-indigo-50 text-indigo-700 font-extrabold" 
                        : "text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>My Wallet</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileActiveSubTab("bills");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all font-display ${
                      mobileActiveSubTab === "bills" 
                        ? "bg-indigo-50 text-indigo-700 font-extrabold" 
                        : "text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Pay Bills</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileActiveSubTab("transfer");
                      setMobileTransferMode("send");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all font-display ${
                      mobileActiveSubTab === "transfer" && mobileTransferMode === "send"
                        ? "bg-indigo-50 text-indigo-700 font-extrabold" 
                        : "text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Send Money</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileActiveSubTab("transfer");
                      setMobileTransferMode("fund");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all font-display ${
                      mobileActiveSubTab === "transfer" && mobileTransferMode === "fund"
                        ? "bg-indigo-50 text-indigo-700 font-extrabold" 
                        : "text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Fund Wallet</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileActiveSubTab("history");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all font-display ${
                      mobileActiveSubTab === "history" 
                        ? "bg-indigo-50 text-indigo-700 font-extrabold" 
                        : "text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Audit Log</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileActiveSubTab("ai");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all font-display ${
                      mobileActiveSubTab === "ai" 
                        ? "bg-indigo-50 text-indigo-700 font-extrabold" 
                        : "text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    <span>Consult AI Bot</span>
                  </button>

                  {currentUser?.role === "admin" && (
                    <button
                      onClick={() => {
                        setMobileActiveSubTab("admin");
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all font-display ${
                        mobileActiveSubTab === "admin" 
                          ? "bg-pink-50 text-pink-700 font-black" 
                          : "text-slate-650 hover:bg-slate-50"
                      }`}
                    >
                      <Sliders className="w-4 h-4 text-pink-600" />
                      <span className="flex items-center gap-1.5">
                        Sandbox Admin 
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                      </span>
                    </button>
                  )}

                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1.5">Simulator feed</p>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[7.5px] font-black text-slate-600 uppercase tracking-wider">
                        <span>Automation:</span>
                        <span className={automationEnabled ? "text-emerald-600 font-extrabold" : "text-slate-400"}>
                          {automationEnabled ? "LIVE" : "PAUSED"}
                        </span>
                      </div>
                      <button
                        onClick={handleToggleAutomation}
                        className={`w-full px-2 py-1 rounded-lg text-[7.5px] font-black uppercase tracking-wider ${
                          automationEnabled ? "bg-slate-900 text-white" : "bg-emerald-600 text-white"
                        }`}
                      >
                        {automationEnabled ? "PAUSE FEED" : "RESUME FEED"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar Sign Out and Brand Footer */}
                <div className="p-3 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
                  <button 
                    onClick={() => {
                      setIsMobileSidebarOpen(false);
                      setCurrentUser(null);
                      setActiveTab("home");
                    }}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl py-2 font-black uppercase text-[8.5px] tracking-widest flex items-center justify-center gap-1.5 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out Account
                  </button>
                  <p className="text-center text-[7px] text-slate-400 font-black uppercase tracking-wider">
                    Wavie Sandbox applet • v2.4.0
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header Section */}
          <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-3 z-40 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="w-8.5 h-8.5 rounded-full border border-slate-150 flex items-center justify-center bg-white text-slate-600 hover:bg-slate-50 active:scale-90 transition-all shadow-xs"
                id="mobile-open-sidebar-btn"
                title="Open menu drawer"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div 
                onClick={() => setActiveModal("kyc")}
                className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-indigo-650 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-md cursor-pointer"
              >
                {currentUser?.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-800 leading-tight">
                  Hi, {currentUser?.fullName.split(" ")[0]} 👋
                </p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                  <span className="text-[8px] text-emerald-700 font-black uppercase tracking-wider">
                    Level {currentUser.kycLevel} Account
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setMobileActiveSubTab("transfer");
                  setMobileTransferMode("fund");
                  setToastMsg("Simulate sandbox funding here!");
                }}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-2 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1"
              >
                <Sliders className="w-2.5 h-2.5" />
                FUND
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotificationCenter(!showNotificationCenter);
                    if (!showNotificationCenter) handleMarkNotificationsRead();
                  }}
                  className="w-8.5 h-8.5 rounded-full border border-slate-150 flex items-center justify-center bg-white relative"
                >
                  {unreadCount > 0 && (
                    <div className="w-4 h-4 bg-red-500 text-white rounded-full absolute -top-1 -right-1 border border-white text-[7px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </div>
                  )}
                  <Bell className="w-4 h-4 text-slate-500" />
                </button>
                {showNotificationCenter && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-[9px]">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-slate-700">Notifications</span>
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[8px] text-slate-400 hover:text-slate-600 font-bold"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="p-3 text-center text-slate-400 italic">No alerts found</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-2.5 hover:bg-slate-50 flex gap-2">
                            <span className="text-sm mt-0.5">
                              {n.type === "credit" ? "💰" : n.type === "security" ? "🛡️" : "ℹ️"}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800">{n.title}</p>
                              <p className="text-slate-500 leading-normal text-[8.5px] mt-0.5">{n.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  setCurrentUser(null);
                  setActiveTab("home");
                }}
                className="w-8.5 h-8.5 rounded-full bg-slate-100 hover:bg-red-55 text-slate-500 hover:text-red-500 flex items-center justify-center transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Spacer */}
          <div className="h-16"></div>

          {/* Automation active pill */}
          <div className="mx-3.5 mt-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-500/10 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${automationEnabled ? "bg-emerald-400" : "bg-slate-300"}`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${automationEnabled ? "bg-emerald-500" : "bg-slate-400"}`}></span>
              </span>
              <div>
                <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest leading-none">Wavie transaction automation</p>
                <p className="text-[7.5px] text-slate-500 mt-0.5 font-bold">Simulator feed: {automationEnabled ? "DISPATCHING LIVE" : "PAUSED"}</p>
              </div>
            </div>
            <button
              onClick={handleToggleAutomation}
              className={`px-2.5 py-1 rounded-lg text-[7.5px] font-black uppercase tracking-wider ${
                automationEnabled ? "bg-slate-900 text-white" : "bg-emerald-600 text-white"
              }`}
            >
              {automationEnabled ? "PAUSE" : "RESUME"}
            </button>
          </div>

          {/* Tab content space */}
          <div className="p-3.5 flex-1 pb-24">
            
            {/* MOBILE HOME TAB */}
            {mobileActiveSubTab === "home" && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Balance Carousel Row */}
                <div className="flex gap-3 overflow-x-auto pb-1 snap-x scrollbar-none snap-mandatory">
                  
                  {/* Balance spending card */}
                  <div className="min-w-[85vw] snap-center bg-indigo-700 bg-gradient-to-tr from-indigo-700 to-indigo-800 rounded-3xl p-5 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute right-0 top-0 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8.5px] font-black tracking-widest text-indigo-100/80 uppercase font-display">MAIN SPENDING BALANCE</span>
                      <button 
                        onClick={() => setHideBalances(!hideBalances)} 
                        className="text-[7.5px] bg-indigo-600/60 hover:bg-indigo-650 px-2 py-0.5 rounded-full border border-indigo-400/20 font-bold"
                      >
                        {hideBalances ? "Show" : "Hide"}
                      </button>
                    </div>
                    <h3 className="text-3xl font-black tracking-tight font-mono mb-4 text-white">
                      {hideBalances ? "₦ ••••••••" : `₦${currentUser.balanceMain.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setMobileActiveSubTab("transfer");
                          setMobileTransferMode("send");
                        }} 
                        className="flex-1 bg-white text-indigo-700 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm font-display"
                      >
                        <ArrowUpRight className="w-3 px-0.5" />
                        Send Funds
                      </button>
                      <button 
                        onClick={() => {
                          setMobileActiveSubTab("transfer");
                          setMobileTransferMode("fund");
                          setToastMsg("Funding options are loaded!");
                        }} 
                        className="flex-1 bg-indigo-600/70 border border-indigo-400/30 text-white py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 font-display"
                      >
                        <ArrowDownLeft className="w-3 px-0.5" />
                        Fund Account
                      </button>
                    </div>
                  </div>

                  {/* Cashback accumulated card */}
                  <div className="min-w-[85vw] snap-center bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white relative overflow-hidden shadow-md">
                    <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8.5px] font-black tracking-widest text-slate-400 uppercase font-display">LOYALTY CASHBACK</span>
                      <span className="text-[7px] bg-emerald-500/20 text-emerald-300 font-black px-1.5 py-0.5 rounded uppercase">1% CASHBACK</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tight font-mono text-emerald-400 mb-4">
                      ₦{currentUser.balanceCashback.toLocaleString()}
                    </h3>
                    {currentUser.balanceCashback > 0 ? (
                      <button 
                        onClick={() => handleRedeemVoucher("cashback")}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider font-display"
                      >
                        Redeem to Main Wallet →
                      </button>
                    ) : (
                      <p className="text-[8px] text-slate-500 italic pb-1">Earn automatic cashback by buying airtime or settling electricity bills.</p>
                    )}
                  </div>

                  {/* Referral Bonus card */}
                  <div className="min-w-[85vw] snap-center bg-gradient-to-br from-indigo-950 to-slate-950 border border-slate-800 rounded-3xl p-5 text-white relative overflow-hidden shadow-md">
                    <div className="absolute right-0 top-0 w-20 h-20 bg-indigo-500/15 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8.5px] font-black tracking-widest text-slate-400 uppercase font-display">REFERRAL BAG</span>
                      <span className="text-[7px] bg-indigo-500/20 text-indigo-300 font-extrabold px-1.5 py-0.5 rounded uppercase">₦500 / FRIEND</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tight font-mono text-indigo-400 mb-4">
                      ₦{currentUser.balanceBonus.toLocaleString()}
                    </h3>
                    {currentUser.balanceBonus > 0 ? (
                      <button 
                        onClick={() => handleRedeemVoucher("bonus")}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider font-display"
                      >
                        Redeem instantly →
                      </button>
                    ) : (
                      <p className="text-[8px] text-slate-500 italic pb-1">Rewards you ₦500 for every sandbox team referral completed.</p>
                    )}
                  </div>

                </div>

                {/* Micro pagination indicator dots */}
                <div className="flex justify-center gap-1 -mt-1 pb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                </div>

                {/* Quick bill payments service board */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-display">FINTECH OPERATIONS</h4>
                  <div className="grid grid-cols-3 gap-2">
                    
                    <button 
                      onClick={() => { setMobileActiveSubTab("bills"); setBillNetwork("MTN"); setDataPlan(""); }}
                      className="bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center transition-all flex flex-col items-center justify-center shadow-xs"
                    >
                      <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-1.5 shadow-xs">
                        <Smartphone className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[8.5px] font-black uppercase text-slate-700 tracking-wider font-display">Airtime</span>
                    </button>

                    <button 
                      onClick={() => { setMobileActiveSubTab("bills"); setBillNetwork("MTN"); setDataPlan(mtnDataPlans[2].name); }}
                      className="bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center transition-all flex flex-col items-center justify-center shadow-xs"
                    >
                      <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-1.5 shadow-xs">
                        <Wifi className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[8.5px] font-black uppercase text-slate-700 tracking-wider font-display">Mobile Data</span>
                    </button>

                    <button 
                      onClick={() => { setMobileActiveSubTab("bills"); setElecProvider("IKEDC"); }}
                      className="bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center transition-all flex flex-col items-center justify-center shadow-xs"
                    >
                      <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-1.5 shadow-xs">
                        <Zap className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[8.5px] font-black uppercase text-slate-700 tracking-wider font-display">Prepaid TV</span>
                    </button>

                    <button 
                      onClick={() => { setMobileActiveSubTab("bills"); setCableProvider("DStv"); }}
                      className="bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center transition-all flex flex-col items-center justify-center shadow-xs"
                    >
                      <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-1.5 shadow-xs">
                        <Tv className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[8.5px] font-black uppercase text-slate-700 tracking-wider font-display">Cable Box</span>
                    </button>

                    <button 
                      onClick={() => { setMobileActiveSubTab("bills"); setBetProvider("Bet9ja"); }}
                      className="bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center transition-all flex flex-col items-center justify-center shadow-xs"
                    >
                      <div className="w-9 h-9 bg-red-50 text-red-650 rounded-xl flex items-center justify-center mb-1.5 shadow-xs">
                        <Dribbble className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[8.5px] font-black uppercase text-slate-700 tracking-wider font-display">Sports Bet</span>
                    </button>

                    <button 
                      onClick={() => setMobileActiveSubTab("ai")}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-900 rounded-2xl p-3 text-center text-white transition-all flex flex-col items-center justify-center shadow-md animate-pulse"
                    >
                      <div className="w-9 h-9 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-1.5 shadow-xs">
                        <Bot className="w-4.5 h-4.5 animate-bounce duration-1000" />
                      </div>
                      <span className="text-[8.5px] font-black uppercase text-indigo-300 tracking-wider font-display">Consult AI</span>
                    </button>

                  </div>
                </div>

                {/* Recent Activities list */}
                <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-display">RECENT ACTIVITIES</h4>
                    <button 
                      onClick={() => setMobileActiveSubTab("history")} 
                      className="text-[8.5px] font-bold text-indigo-600 hover:underline"
                    >
                      All ({transactions.length})
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {transactions.length === 0 ? (
                      <p className="text-center py-6 text-slate-400 text-[9px] italic">No transaction records logged yet.</p>
                    ) : (
                      transactions.slice(0, 4).map((t) => (
                        <div 
                          key={t.id} 
                          onClick={() => { setSelectedReceiptTx(t); setActiveModal("receipt"); }}
                          className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all rounded px-0.5"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              t.type === TransactionType.TRANSFER_IN ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                            }`}>
                              {t.type === TransactionType.TRANSFER_IN ? "📥" : "📤"}
                            </div>
                            <div className="max-w-[150px]">
                              <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">{t.description}</p>
                              <p className="text-[8px] text-slate-400 mt-0.5">{new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-[10.5px] font-black font-mono leading-none ${
                              t.type === TransactionType.TRANSFER_IN ? "text-emerald-600" : "text-slate-800"
                            }`}>
                              {t.type === TransactionType.TRANSFER_IN ? "+" : "-"}₦{t.amount.toLocaleString()}
                            </p>
                            <span className="text-[6.5px] font-black bg-slate-100 rounded px-1 text-slate-500 uppercase tracking-wide leading-none mt-1 inline-block">
                              {t.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* MOBILE BILLS TAB */}
            {mobileActiveSubTab === "bills" && (
              <div className="space-y-4 animate-fade-in text-[11px]">
                  {/* Category switcher */}
                  <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 overflow-x-auto scrollbar-none">
                    {["Airtime", "Mobile Data", "Power Bills", "Cable TV", "Sports Bookie"].map((opt, id) => (
                      <button
                        key={id}
                        onClick={() => {
                          if (opt === "Airtime") { setDataPlan(""); setBillNetwork("MTN"); }
                          else if (opt === "Mobile Data") { setDataPlan(mtnDataPlans[2].name); setBillNetwork("MTN"); }
                          else if (opt === "Power Bills") { setElecProvider("IKEDC (Ikeja Prepaid)"); }
                          else if (opt === "Cable TV") { setCableProvider("DStv"); }
                          else { setBetProvider("Bet9ja"); }
                          setToastMsg(`Activated ${opt} channel form!`);
                        }}
                        className="px-3.5 py-2 whitespace-nowrap bg-white text-slate-700 border border-slate-200/45 rounded-xl text-[8.5px] font-black uppercase tracking-wider shadow-xs font-display"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {/* Combined Form */}
                  <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100 font-display">
                      FINTECH PAYMENTS CENTER
                    </h4>

                    {/* Airtime & Data Input layout */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Provider Brand</label>
                        <select
                          value={billNetwork}
                          onChange={(e) => setBillNetwork(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-bold"
                        >
                          <option value="MTN">MTN NG Network</option>
                          <option value="Airtel">Airtel Corporate</option>
                          <option value="Glo">Globacom (Glo)</option>
                          <option value="9mobile">9mobile Smart</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Phone account No.</label>
                        <input
                          type="tel"
                          value={billPhone}
                          onChange={(e) => setBillPhone(e.target.value)}
                          placeholder="e.g. 08162837492"
                          className="w-full text-xs font-mono font-bold border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Amount (₦)</label>
                        <input
                          type="number"
                          value={billAmount}
                          onChange={(e) => setBillAmount(e.target.value)}
                          placeholder="e.g. 1500"
                          className="w-full text-xs font-mono font-bold border border-slate-200 rounded-xl px-3 py-2.5 outline-none text-indigo-650"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!billPhone) { setToastMsg("Enter Nigeria phone account number."); return; }
                          handleBillPayment(
                            TransactionType.AIRTIME,
                            billNetwork,
                            Number(billAmount),
                            billPhone,
                            { planName: "Airtime Top-up" }
                          );
                        }}
                        className="w-full bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-black uppercase text-[9px] tracking-widest"
                      >
                        Settle payment (Flat 1% Cashback)
                      </button>
                    </div>

                  </div>

                  {/* High Value Utility Prepaid Disco forms */}
                  <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100 flex items-center gap-1.5 font-display">
                      <Zap className="w-4 h-4 text-amber-500" />
                      METER RECHARGE SERVICES
                    </h4>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Nigeria Disco Agency</label>
                        <select
                          value={elecProvider}
                          onChange={(e) => setElecProvider(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-bold"
                        >
                          <option value="IKEDC (Ikeja Prepaid)">Ikeja Prepaid Disco (IKEDC)</option>
                          <option value="EKEDC (Eko Prepaid)">Eko Prepaid Disco (EKEDC)</option>
                          <option value="AEDC (Abuja Prepaid)">Abuja Prepaid Disco (AEDC)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Meter Registration Number</label>
                        <input
                          type="text"
                          value={elecMeter}
                          onChange={(e) => {
                            setElecMeter(e.target.value);
                            if (e.target.value.length === 11) {
                              setElecMeterValidName("Ademola Alao Wasiu");
                            } else {
                              setElecMeterValidName("");
                            }
                          }}
                          placeholder="e.g. 14273829019"
                          className="w-full text-xs font-mono font-bold border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                        />
                        {elecMeterValidName && (
                          <p className="text-[8.5px] text-emerald-600 font-extrabold mt-1 font-display">✓ Customer Name matches: {elecMeterValidName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Recharge Amount (₦)</label>
                        <input
                          type="number"
                          value={elecAmount}
                          onChange={(e) => setElecAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full text-xs font-mono font-bold border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!elecMeter) { setToastMsg("Please provide physical meter number."); return; }
                          handleBillPayment(
                            TransactionType.ELECTRICITY,
                            elecProvider,
                            Number(elecAmount),
                            elecMeter,
                            { meterNumber: elecMeter }
                          );
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl py-3 font-black uppercase text-[9px] tracking-widest shadow-xs font-display"
                      >
                        Acquire prepaid electricity token
                      </button>
                    </div>
                  </div>

              </div>
            )}

            {/* MOBILE TRANSFER TAB & FUNDING SIMULATOR */}
            {mobileActiveSubTab === "transfer" && (
              <div className="space-y-4 animate-fade-in text-xs">
                
                {/* Segment tab controller */}
                <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
                  <button
                    onClick={() => setMobileTransferMode("send")}
                    className={`flex-1 py-1.5 text-center rounded-xl text-[9px] font-black uppercase tracking-wider transition-all font-display ${
                      mobileTransferMode === "send"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Send Outbound
                  </button>
                  <button
                    onClick={() => setMobileTransferMode("fund")}
                    className={`flex-1 py-1.5 text-center rounded-xl text-[9px] font-black uppercase tracking-wider transition-all font-display ${
                      mobileTransferMode === "fund"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Fund (Reserved)
                  </button>
                </div>

                {mobileTransferMode === "send" ? (
                  /* SEND OUTBOUND WORKFLOW */
                  <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100 font-display">
                      SEND FUNDS OUTBOUND
                    </h4>

                    {sendError && (
                      <div className="bg-red-50 text-red-750 p-2.5 rounded-lg text-[9px] font-semibold">
                        {sendError}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Nigeran bank directory</label>
                        <select
                          value={sendBank}
                          onChange={(e) => setSendBank(e.target.value)}
                          className="w-full text-[11px] border border-slate-200 rounded-xl px-3 py-2 bg-white font-bold text-slate-700"
                        >
                          <option value="">-- Choose destination bank --</option>
                          {banks.map((b) => (
                            <option key={b.code} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">10-Digit NUBAN Account</label>
                        <input
                          type="text"
                          value={sendAccount}
                          onChange={(e) => {
                            setSendAccount(e.target.value);
                            if (e.target.value.length === 10) {
                              setIsVerifyingAccount(true);
                              setVerifiedAccountName("");
                              fetch("/api/transfer/verify-bank", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ accountNumber: e.target.value, bankCode: "058" })
                              })
                                .then((res) => res.json())
                                .then((data) => {
                                  setIsVerifyingAccount(false);
                                  if (data.success) {
                                    setVerifiedAccountName(data.accountName);
                                  } else {
                                    setToastMsg("Could not verify recipient details.");
                                  }
                                })
                                .catch(() => setIsVerifyingAccount(false));
                            } else {
                              setVerifiedAccountName("");
                            }
                          }}
                          placeholder="e.g. 0174829302"
                          className="w-full text-xs font-mono font-bold tracking-widest border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-sans"
                        />
                        {isVerifyingAccount && <p className="text-[8px] text-slate-400 animate-pulse mt-0.5 uppercase">Resolving name...</p>}
                        {verifiedAccountName && <p className="text-[8.5px] text-indigo-700 font-extrabold mt-0.5">✓ Name: {verifiedAccountName}</p>}
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Dispatch Amount (₦)</label>
                        <input
                          type="number"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          placeholder="e.g. 25000"
                          className="w-full text-xs font-mono font-bold border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">4-Digit Verification PIN Passcode</label>
                        <input
                          type="password"
                          value={sendPin}
                          onChange={(e) => setSendPin(e.target.value)}
                          placeholder="e.g. 1234"
                          maxLength={4}
                          className="w-full text-xs font-mono font-bold text-center tracking-widest border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isVerifyingAccount || !verifiedAccountName || !sendAmount}
                        onClick={handleSendMoneyAction}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase text-[9px] tracking-widest enabled:shadow-md disabled:opacity-50 font-display"
                      >
                        Authenticate payment dispatch
                      </button>
                    </div>
                  </div>
                ) : (
                  /* FUND ACCOUNT (RESERVED ACCOUNT + WEBHOOK SIMULATOR) */
                  <div className="space-y-4">
                    {/* Instant reserved accounts details */}
                    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-display">Monnify reserved accounts</h4>
                        <span className="text-[7px] bg-slate-100 text-teal-650 font-bold px-1.5 py-0.5 rounded-full uppercase">Instant webhooks</span>
                      </div>
                      <p className="text-[8.5px] text-slate-500 mb-3 leading-normal">
                        To fund your wallet, pay into any of your unique sandboxed bank accounts below. Funds will reflect immediately via Monnify webhook integration.
                      </p>
                      {currentUser.virtualAccounts && currentUser.virtualAccounts.length > 0 ? (
                        <div className="space-y-2">
                          {currentUser.virtualAccounts.map((acct) => (
                            <div key={acct.id} className="bg-slate-50 rounded-2xl p-3 flex justify-between items-center border border-slate-150">
                              <div>
                                <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest leading-none font-display">{acct.bankName}</p>
                                <p className="text-sm font-mono font-black text-slate-800 tracking-wider mt-1">{acct.accountNumber}</p>
                                <p className="text-[7.5px] text-slate-400 uppercase mt-0.5 font-bold">Holder: {acct.accountName}</p>
                              </div>
                              <button
                                onClick={() => copyToClipboard(acct.accountNumber, `${acct.bankName} Account`, setToastMsg)}
                                className="bg-white hover:bg-slate-100 p-2 rounded-xl border border-slate-200 text-slate-500 flex items-center justify-center transition-all active:scale-95 shadow-xs"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-2 text-slate-400 text-[9px] italic">No reservable accounts. Initiate identity upgrade.</p>
                      )}
                    </div>

                    {/* Webhook credit simulator inside view on Mobile */}
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300 rounded-3xl p-4 text-slate-900 space-y-2.5 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1 font-display">
                        <Sliders className="w-3.5 h-3.5" />
                        Sandbox Webhook simulator
                      </h4>
                      <p className="text-[8px] text-slate-650">
                        Trigger simulated Monnify REST requests directly. This simulates real deposits to credit your active virtual accounts!
                      </p>

                      <div>
                        <label className="block text-[8px] font-black text-amber-900 uppercase tracking-widest mb-1">Source Account No.</label>
                        <select
                          value={fundingBankNo}
                          onChange={(e) => setFundingBankNo(e.target.value)}
                          className="w-full text-[10.5px] border border-amber-300/40 rounded-xl px-2.5 py-2 bg-white font-mono font-black text-slate-800"
                        >
                          {currentUser.virtualAccounts?.map((v) => (
                            <option key={v.id} value={v.accountNumber}>
                              {v.bankName} - {v.accountNumber}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-amber-900 uppercase tracking-widest mb-1">Funding simulated cash (₦)</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {["5000", "15000", "30000", "75000"].map((fundingOpt) => (
                            <button
                              key={fundingOpt}
                              type="button"
                              onClick={() => setFundingAmount(fundingOpt)}
                              className={`py-1.5 rounded-lg text-[8px] font-black font-mono transition-all border ${
                                fundingAmount === fundingOpt ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-700 border-amber-300/40"
                              }`}
                            >
                              ₦{Number(fundingOpt).toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleTriggerWebhookSimulator}
                        disabled={isFundingSimulating}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase py-3 rounded-xl text-[9px] tracking-widest shadow-xs font-display"
                      >
                        {isFundingSimulating ? "Transmitting..." : "Simulate Incoming Credit"}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* MOBILE HISTORY TAB */}
            {mobileActiveSubTab === "history" && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-display">Wavie Transaction Statements</h4>
                  
                  {/* Search query tag */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search descriptions, tokens, references..."
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                      className="w-full text-[9.5px] pl-8.5 pr-3 py-2 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none font-sans"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { key: "ALL", val: "All operations" },
                      { key: TransactionType.TRANSFER_IN, val: "Inflow 📥" },
                      { key: TransactionType.TRANSFER_OUT, val: "Outflow 📤" },
                      { key: TransactionType.AIRTIME, val: "Airtime 📱" },
                      { key: TransactionType.ELECTRICITY, val: "Power ⚡" }
                    ].map((pill) => (
                      <button
                        key={pill.key}
                        onClick={() => setLedgerFilterType(pill.key)}
                        className={`px-3 py-1 text-[8px] font-black uppercase tracking-wide rounded-full border flex-shrink-0 transition-all ${
                          ledgerFilterType === pill.key ? "bg-slate-900 border-slate-900 text-white shadow-xs font-display" : "bg-slate-50 border-slate-150 text-slate-505 hover:bg-slate-100 font-sans"
                        }`}
                      >
                        {pill.val}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleExportLedgerCSV}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 text-[8px] font-bold uppercase tracking-wider text-slate-700 flex items-center justify-center gap-1 shadow-2xs font-display"
                  >
                    <Download className="w-3 h-3" />
                    Download CSV statement
                  </button>

                  <div className="divide-y divide-slate-100 max-h-[385px] overflow-y-auto">
                    {filteredTxs.length === 0 ? (
                      <div className="text-center py-10 text-slate-405 italic text-[9.5px]">No matches. Try another term.</div>
                    ) : (
                      filteredTxs.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => { setSelectedReceiptTx(t); setActiveModal("receipt"); }}
                          className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all rounded px-0.5"
                        >
                          <div className="flex items-center gap-2 text-left">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                              {t.type === TransactionType.TRANSFER_IN ? "📥" : "📤"}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-800 leading-tight truncate max-w-[150px]">
                                {t.description}
                              </p>
                              <p className="text-[7.5px] text-slate-400 mt-0.5 font-mono">{new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10.5px] font-mono font-black text-slate-800">
                              {t.type === TransactionType.TRANSFER_IN ? "+" : "-"}₦{t.amount.toLocaleString()}
                            </p>
                            <span className="text-[6.5px] bg-slate-105 px-1 rounded uppercase tracking-wide text-slate-500 font-black">
                              {t.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* MOBILE SMART AI CHAT TAB */}
            {mobileActiveSubTab === "ai" && (
              <div className="h-[62vh] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
                <div className="bg-indigo-900 text-white p-3.5 flex items-center gap-2 shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <div>
                    <h4 className="text-[10px] font-black tracking-widest uppercase leading-none text-white font-display">Wavie Bot Advisor</h4>
                    <p className="text-[7.5px] text-indigo-200 mt-0.5">Live sandbox context intelligence</p>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <WavieAssistant user={currentUser} />
                </div>
              </div>
            )}

            {/* MOBILE ADMIN TAB */}
            {mobileActiveSubTab === "admin" && currentUser.role === "admin" && (
              <div className="space-y-4 animate-fade-in text-[11px]">
                
                {/* Stats metrics */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-900 text-white rounded-2xl p-3 border border-slate-800">
                    <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest font-display">System Volume</span>
                    <h3 className="text-sm font-black font-mono text-indigo-400 mt-1">
                      ₦{adminTxs.filter(t=>t.status===TransactionStatus.SUCCESS).reduce((acc,curr)=>acc+curr.amount, 0).toLocaleString()}
                    </h3>
                  </div>
                  <div className="bg-slate-900 text-white rounded-2xl p-3 border border-slate-800">
                    <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest font-display">Automation Service</span>
                    <span className="text-[9.5px] font-black text-emerald-400 block mt-1">● Active Feed</span>
                  </div>
                </div>

                {/* Automation Toggles */}
                <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-display font-display">Scheduler Controls</h4>
                      <p className="text-[8px] text-slate-400 mt-1">Schedules simulated transactions every 18 seconds.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[9.5px] text-slate-700">Autoplay Live Feed Scheduler</p>
                      <p className="text-[8px] text-slate-400">{automationCount} executed sandbox actions</p>
                    </div>
                    <button
                      onClick={handleToggleAutomation}
                      className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-slate-950 text-white font-display"
                    >
                      {automationEnabled ? "PAUSE FEED" : "ENABLE FEED"}
                    </button>
                  </div>
                </div>

                {/* Logs Terminal */}
                <div className="bg-slate-950 text-slate-300 rounded-3xl p-4 font-mono text-[8.5px] border border-slate-850">
                  <p className="text-slate-405 font-extrabold pb-1.5 border-b border-white/5 mb-2 uppercase tracking-wider text-[8.5px] font-display">Live transaction simulation events</p>
                  <div className="h-40 overflow-y-auto space-y-1.5 leading-relaxed text-emerald-450">
                    {automationLogs.slice(0, 15).map((log, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start">
                        <span className="text-slate-600 font-bold flex-shrink-0">[⚡]</span>
                        <p>{log}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Bottom Dock Navigation Bar */}
          <nav className="fixed bottom-0 left-0 right-0 h-18 bg-white/95 border-t border-slate-100 flex items-center justify-around px-2 pb-2.5 z-40 shadow-xl backdrop-blur-md">
            <button
              onClick={() => setMobileActiveSubTab("home")}
              className={`flex flex-col items-center gap-1 p-2 ${mobileActiveSubTab === "home" ? "text-indigo-600 font-black" : "text-slate-400"}`}
            >
              <Wallet className="w-4.5 h-4.5" />
              <span className="text-[7.5px] uppercase tracking-wider font-extrabold font-display">Wallet</span>
            </button>

            <button
              onClick={() => setMobileActiveSubTab("bills")}
              className={`flex flex-col items-center gap-1 p-2 ${mobileActiveSubTab === "bills" ? "text-indigo-600 font-black" : "text-slate-400"}`}
            >
              <Zap className="w-4.5 h-4.5" />
              <span className="text-[7.5px] uppercase tracking-wider font-extrabold font-display">Bills</span>
            </button>

            <button
              onClick={() => setMobileActiveSubTab("transfer")}
              className={`flex flex-col items-center gap-1 p-2 ${mobileActiveSubTab === "transfer" ? "text-indigo-600 font-black" : "text-slate-400"}`}
            >
              <ArrowUpRight className="w-4.5 h-4.5" />
              <span className="text-[7.5px] uppercase tracking-wider font-extrabold font-display">Transfers</span>
            </button>

            <button
              onClick={() => setMobileActiveSubTab("history")}
              className={`flex flex-col items-center gap-1 p-2 ${mobileActiveSubTab === "history" ? "text-indigo-600 font-black" : "text-slate-400"}`}
            >
              <FileText className="w-4.5 h-4.5" />
              <span className="text-[7.5px] uppercase tracking-wider font-extrabold font-display">Audit</span>
            </button>

            <button
              onClick={() => setMobileActiveSubTab("ai")}
              className={`flex flex-col items-center gap-1 p-2 ${mobileActiveSubTab === "ai" ? "text-indigo-600 font-black" : "text-slate-400"}`}
            >
              <Bot className="w-4.5 h-4.5 animate-pulse" />
              <span className="text-[7.5px] uppercase tracking-wider font-extrabold font-display">AI Bot</span>
            </button>

            {currentUser.role === "admin" && (
              <button
                onClick={() => setMobileActiveSubTab("admin")}
                className={`flex flex-col items-center gap-1 p-2 relative ${mobileActiveSubTab === "admin" ? "text-indigo-600 font-black" : "text-slate-400"}`}
              >
                <Sliders className="w-4.5 h-4.5" />
                <span className="text-[7.5px] uppercase tracking-wider font-extrabold font-display">Admin</span>
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
              </button>
            )}
          </nav>

        </div>
      ) : (
        /* ORIGINAL DESKTOP BENTO GRID APPLICATION DASHBOARD */
        <div className="flex-1 flex flex-col">
          
          {/* Header Section */}
          <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-slate-200 relative z-30">
            
            {/* Logo Group */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl hover:scale-105 transition-transform duration-200 cursor-pointer shadow-sm">
                W
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-indigo-900 uppercase">Wavie</span>
                <span className="block text-[9px] font-bold text-indigo-500/80 tracking-widest leading-none">NIGERIAN FINTECH</span>
              </div>
            </div>

            {/* Middle Nav Links */}
            <nav className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => { setActiveTab("home"); setActiveModal(null); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "home" 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                Dashboard
              </button>
              
              {currentUser.role === "admin" && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${
                    activeTab === "admin" 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  Admin Console
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
                </button>
              )}

              <button
                onClick={() => setActiveTab("help")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "help" 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                Monnify Docs
              </button>
            </nav>

            {/* Right Profile / Controls Chip */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Webhook Sandbox Trigger Quick Button */}
              <button
                onClick={() => setActiveModal("add")}
                className="hidden lg:flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all shadow-md shadow-amber-500/10"
              >
                <Sliders className="w-3.5 h-3.5" />
                Fund Simulator
              </button>

              {/* Verified KYC Profile Chip */}
              <div 
                onClick={() => setActiveModal("kyc")}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer hover:border-indigo-400 transition-all"
              >
                <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-bold text-slate-700 leading-none truncate max-w-[110px]">{currentUser.fullName}</p>
                  <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">
                    Level {currentUser.kycLevel} Account
                  </p>
                </div>
              </div>

              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotificationCenter(!showNotificationCenter);
                    if (!showNotificationCenter) handleMarkNotificationsRead();
                  }}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:border-slate-300 transition-all relative"
                >
                  {unreadCount > 0 && (
                    <div className="w-5 h-5 bg-red-500 text-white rounded-full absolute -top-1 -right-1 border border-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </div>
                  )}
                  <Bell className="w-5 h-5 text-slate-600" />
                </button>

                {/* Notifications Panel List */}
                {showNotificationCenter && (
                  <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-3xl shadow-xl z-50 overflow-hidden text-xs">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-slate-700">Wavie Notifications</span>
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-slate-400 hover:text-slate-600"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-slate-400 text-[11px]">No alerts found logs.</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-3 hover:bg-slate-50 flex gap-2.5">
                            <span className="text-lg mt-0.5">
                              {n.type === "credit" ? "💰" : n.type === "security" ? "🛡️" : "ℹ️"}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800">{n.title}</p>
                              <p className="text-slate-500 leading-relaxed mt-0.5 text-[10px]">{n.message}</p>
                              <p className="text-[8px] text-slate-400 mt-1 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Signout key */}
              <button 
                onClick={() => {
                  setCurrentUser(null);
                  setActiveTab("home");
                }}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all"
                title="Log Out Session"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* MAIN LAYOUT SCREEN */}
          {activeTab === "home" && (
            <main className="flex-1 p-4 sm:p-8 flex flex-col gap-6">

              {/* AUTOMATION INDICATOR BANNER */}
              <div id="live-auto-banner" className="bg-gradient-to-r from-emerald-50 via-teal-100/5 to-indigo-50/20 border border-emerald-500/15 rounded-[24px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <span className="flex h-3.5 w-3.5 items-center justify-center">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${automationEnabled ? "bg-emerald-400" : "bg-slate-300"}`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${automationEnabled ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                         Wavie transaction automation
                      </h3>
                      <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded-full uppercase ${automationEnabled ? "bg-emerald-100 text-emerald-800 animate-pulse" : "bg-slate-200 text-slate-500"}`}>
                        {automationEnabled ? "STREAMING LIVE FEED" : "PAUSED"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      {automationEnabled 
                        ? `A simulated live transaction is executed automatically on the back-end every 18 seconds. (${automationCount} auto-events saved).`
                        : "Turn on live transaction automation to generate periodic background deposits and utilities for all user wallets."
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleToggleAutomation}
                    className={`px-3.5 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all shadow-sm ${
                      automationEnabled 
                        ? "bg-slate-900 hover:bg-slate-855 text-white" 
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {automationEnabled ? "PAUSE FEED" : "ENABLE LIVE FEED"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* LEFT GROUP: BALANCES PANEL & TRANSACTION RECORDS LEDGER */}
                <div className="md:col-span-8 flex flex-col gap-6">
                
                {/* Balance Bento grid row layout structure */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                  
                  {/* Main Balance Tile (Indigo design visual card) */}
                  <div className="sm:col-span-7 bg-indigo-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                    {/* Glowing design overlay decor */}
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/30 rounded-full blur-xl"></div>
                    <div className="absolute left-1/3 bottom-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl"></div>

                    <div className="flex justify-between items-center mb-1">
                      <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">
                        Main Spending Balance
                      </p>
                      
                      {/* Privacy balance hider button */}
                      <button 
                        onClick={() => setHideBalances(!hideBalances)}
                        className="text-[10px] bg-indigo-600/50 hover:bg-indigo-600 py-1 px-2.5 rounded-full border border-indigo-400/30 transition-all font-semibold"
                      >
                        {hideBalances ? "Show Balance" : "Hide Balance"}
                      </button>
                    </div>

                    <h2 className="text-3.5xl sm:text-4xl font-extrabold tracking-tight mb-6 font-mono">
                      {hideBalances ? "₦ ••••••••" : `₦${currentUser.balanceMain.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
                    </h2>
                    
                    {/* Quick Core actions */}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setActiveModal("send")}
                        className="flex-1 bg-white text-indigo-700 hover:bg-slate-100 py-3 rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        Send Funds
                      </button>
                      <button 
                        onClick={() => setActiveModal("add")}
                        className="flex-1 bg-indigo-600/60 hover:bg-indigo-600/80 border border-indigo-400 text-white py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <ArrowDownLeft className="w-4 h-4" />
                        Fund Account
                      </button>
                    </div>
                  </div>

                  {/* Right side sub-bento grid row balances */}
                  <div className="sm:col-span-5 grid grid-rows-2 gap-4">
                    
                    {/* Cashback Card */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200 flex justify-between items-center shadow-sm">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                            Accumulated Cashback
                          </p>
                          <span className="text-[8px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            Flat 1% on Bills
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-600 font-mono mt-1">
                          ₦{currentUser.balanceCashback.toLocaleString()}
                        </h3>
                        {currentUser.balanceCashback > 0 && (
                          <button
                            onClick={() => handleRedeemVoucher("cashback")}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold hover:underline tracking-tight mt-1"
                          >
                            Redeem to Main Cash →
                          </button>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Referral Card */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200 flex justify-between items-center shadow-sm">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                            Referral Bag (Bonus)
                          </p>
                          <span className="text-[8px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                            ₦500 / Friends
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-indigo-600 font-mono mt-1">
                          ₦{currentUser.balanceBonus.toLocaleString()}
                        </h3>
                        {currentUser.balanceBonus > 0 && (
                          <button
                            onClick={() => handleRedeemVoucher("bonus")}
                            className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold hover:underline tracking-tight mt-1"
                          >
                            Redeem Bonus →
                          </button>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>

                  </div>
                </div>

                {/* RECENT TRANSACTIONS FILTERABLE LEDGER */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[350px]">
                  
                  {/* Ledger Header controls */}
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">
                        Wavie Ledger History
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Secure immutable ledger tracking. Synchronized via real-time Monnify collections logs.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={handleExportLedgerCSV}
                        disabled={transactions.length === 0}
                        className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-tight transition-all flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export Statement
                      </button>
                    </div>
                  </div>

                  {/* Filters and search engine bar */}
                  <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row gap-3 items-center justify-between">
                    
                    {/* Search query input */}
                    <div className="w-full md:w-64 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                        placeholder="Search description, reference,..."
                        className="w-full text-[11px] bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Filter categories buttons */}
                    <div className="flex gap-1 overflow-x-auto w-full md:w-auto scrollbar-none">
                      {[
                        { label: "All Ledger", filter: "ALL" },
                        { label: "Transfers In", filter: TransactionType.TRANSFER_IN },
                        { label: "Transfers Out", filter: TransactionType.TRANSFER_OUT },
                        { label: "Airtime/Data", filter: TransactionType.AIRTIME },
                        { label: "Bills Utility", filter: TransactionType.ELECTRICITY }
                      ].map((btn) => (
                        <button
                          key={btn.filter}
                          onClick={() => setLedgerFilterType(btn.filter)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                            ledgerFilterType === btn.filter 
                              ? "bg-slate-800 text-white" 
                              : "bg-white text-slate-500 hover:text-slate-900 border border-slate-200"
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Ledger list container */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-50 max-h-[400px]">
                    {filteredTxs.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs font-semibold">No ledger items recorded.</p>
                        <p className="text-[10px] mt-0.5">Try funding your mock virtual account to see instant dynamic credits!</p>
                      </div>
                    ) : (
                      filteredTxs.map((tx) => {
                        const isCredit = tx.type === TransactionType.TRANSFER_IN || tx.type === TransactionType.BONUS_REDEEM || tx.type === TransactionType.CASHBACK_REDEEM;
                        
                        // Icon resolver
                        let txIcon = "💸";
                        let bgCol = "bg-indigo-50 text-indigo-700";
                        if (tx.type === TransactionType.AIRTIME || tx.type === TransactionType.DATA) {
                          txIcon = "📱";
                          bgCol = "bg-orange-50 text-orange-700";
                        } else if (tx.type === TransactionType.ELECTRICITY) {
                          txIcon = "⚡";
                          bgCol = "bg-yellow-50 text-yellow-700";
                        } else if (tx.type === TransactionType.CABLE) {
                          txIcon = "📺";
                          bgCol = "bg-purple-50 text-purple-700";
                        } else if (tx.type === TransactionType.BETTING) {
                          txIcon = "🎯";
                          bgCol = "bg-red-50 text-red-700";
                        } else if (isCredit) {
                          txIcon = "📥";
                          bgCol = "bg-emerald-50 text-emerald-700";
                        }

                        return (
                          <div 
                            key={tx.id} 
                            onClick={() => {
                              setSelectedReceiptTx(tx);
                              setActiveModal("receipt");
                            }}
                            className="flex items-center p-4 hover:bg-slate-50/70 transition-all cursor-pointer"
                          >
                            <div className={`w-10 h-10 rounded-xl ${bgCol} flex items-center justify-center mr-4 text-base font-bold flex-shrink-0 shadow-sm`}>
                              {txIcon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{tx.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-slate-400 font-mono">Ref: {tx.reference}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(tx.timestamp).toLocaleString(undefined, {month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"})}
                                </span>
                              </div>
                            </div>
                            <div className="text-right pl-3 flex-shrink-0">
                              <p className={`text-xs font-bold font-mono ${isCredit ? "text-emerald-600" : "text-slate-800"}`}>
                                {isCredit ? "+" : "-"}₦{tx.amount.toLocaleString()}
                              </p>
                              <p className={`text-[8px] font-extrabold uppercase tracking-wide mt-0.5 ${
                                tx.status === TransactionStatus.SUCCESS ? "text-emerald-500" : "text-red-500"
                              }`}>
                                {tx.status}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Safety compliance footer banner */}
                  <div className="p-3 bg-indigo-50/40 text-center rounded-b-3xl border-t border-slate-100 flex items-center justify-center gap-1.5 text-[9px] text-indigo-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Transactions audit logs verified against encrypted Nigeria bank networks.</span>
                  </div>

                </div>

              </div>

              {/* RIGHT GROUP: SERVICES SERVICES & VIRTUAL CONSOLE ACC SUMMARY */}
              <div className="md:col-span-4 flex flex-col gap-6">
                
                {/* Services Grid (The quick utilities dispatch deck) */}
                <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs">
                        Wavie Actions
                      </h3>
                      <p className="text-[9px] text-slate-400 leading-normal mt-0.5">Choose utility dispatch bundles directly from Monnify feeds.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                    
                    {[
                      { icon: <Smartphone className="w-5.5 h-5.5" />, title: "Airtime", modal: "airtime", bg: "bg-orange-50 text-orange-600" },
                      { icon: <Wifi className="w-5.5 h-5.5" />, title: "Data Subscriber", modal: "data", bg: "bg-cyan-50 text-cyan-600" },
                      { icon: <Zap className="w-5.5 h-5.5" />, title: "Electricity Meter", modal: "electricity", bg: "bg-yellow-50 text-yellow-600" },
                      { icon: <Tv className="w-5.5 h-5.5" />, title: "Cable TV Plus", modal: "cable", bg: "bg-purple-50 text-purple-600" },
                      { icon: <Dribbble className="w-5.5 h-5.5" />, title: "Bet Platform", modal: "betting", bg: "bg-red-50 text-red-600" },
                      { icon: <ShieldCheck className="w-5.5 h-5.5 text-blue-600" />, title: "BVN NIN KYC", modal: "kyc", bg: "bg-blue-50" }
                    ].map((serv, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setActiveModal(serv.modal as any)}
                        className="flex flex-col items-center group cursor-pointer hover:scale-105 transition-transform"
                      >
                        <div className={`w-12 h-12 ${serv.bg} rounded-2xl flex items-center justify-center mb-1.5 shadow-sm group-hover:shadow transition-shadow`}>
                          {serv.icon}
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 text-center leading-tight tracking-tight px-1 uppercase block truncate w-full">
                          {serv.title}
                        </span>
                      </div>
                    ))}
                    
                  </div>
                </div>

                {/* Virtual Account Card (Simulated display referencing Reserved Account) */}
                <div className="bg-white rounded-[32px] border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs">
                        Reserved Virtual Accounts
                      </h3>
                      <span className="text-[8px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wider">
                        Virtual API Active
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                      Transfer money into any of these assigned accounts from generic banks (Zenith, Kuda, GTB) to load your main Wavie wallet instantly.
                    </p>

                    {/* Display virtual bank details in layout */}
                    <div className="space-y-3">
                      {currentUser.virtualAccounts?.map((v, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 hover:border-slate-300 transition-all">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500">{v.bankName}</span>
                            <button 
                              onClick={() => copyToClipboard(v.accountNumber, `${v.bankName} Account`, setToastMsg)}
                              className="text-slate-400 hover:text-indigo-600 p-1"
                              title="Copy Account Number"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-lg font-mono font-black text-slate-800 mt-1 tracking-wider">{v.accountNumber}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-mono mt-1 font-semibold truncate">
                            Account Name: {v.accountName}
                          </p>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Webhook Sandbox Interactive Controller */}
                  <div className="mt-5 pt-4 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-1.5 rounded-xl border border-amber-200/50 flex items-center gap-1.5 uppercase tracking-wide">
                      <Sliders className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: "3s" }} />
                      <span>Reviewer Sandbox Control</span>
                    </p>

                    <div className="mt-3 space-y-2">
                      <div>
                        <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                          Choose Account to Credit
                        </label>
                        <select
                          value={fundingBankNo}
                          onChange={(e) => setFundingBankNo(e.target.value)}
                          className="w-full text-xs border border-slate-200 focus:border-amber-500 rounded-xl p-2 bg-white mt-1"
                        >
                          {currentUser.virtualAccounts?.map((acct, idx) => (
                            <option key={idx} value={acct.accountNumber}>
                              {acct.bankName.replace(" (Monnify)", "")} - {acct.accountNumber}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            Amount to Credit (NGN)
                          </label>
                          <input
                            type="number"
                            value={fundingAmount}
                            onChange={(e) => setFundingAmount(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-xl p-1.5 mt-1 text-center font-bold font-mono"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={handleTriggerWebhookSimulator}
                            disabled={isFundingSimulating}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {isFundingSimulating ? "Crediting..." : "Trigger Hook"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Promotional Referral Banner Bento Block */}
                  <div className="mt-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-4 text-white shadow-md shadow-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase">
                        Spread the word
                      </span>
                      <p className="text-xs font-bold mt-1.5">Earn ₦500 Per Friend invited</p>
                      <p className="text-[9px] opacity-75 mt-0.5 uppercase font-mono tracking-widest">
                        Code: {currentUser.referralCode}
                      </p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(currentUser.referralCode, "Referral Code", setToastMsg)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white flex-shrink-0"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>

            </div> {/* Close GRID CONTAINER */}
          </main>
          )}

          {/* MONNIFY INTEGRATION DOCUMENTATION TAB */}
          {activeTab === "help" && (
            <main className="flex-1 p-6 sm:p-8 max-w-4xl mx-auto w-full bg-white rounded-3xl border border-slate-200 my-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-8 h-8 text-indigo-600" />
                <div>
                  <h2 className="text-xl font-bold">Nigeria Monnify API Infrastructure Spec</h2>
                  <p className="text-xs text-slate-400">Complete verification endpoints & parameters matching production setups</p>
                </div>
              </div>

              <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
                
                <section className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <h3 className="font-extrabold text-indigo-900 mb-2 uppercase tracking-wide">1. Reserved Accounts Collection Flow</h3>
                  <p>
                    Wavie creates static virtual accounts dynamically for registered users. Monnify triggers our static endpoints upon credit alerts.
                  </p>
                  <pre className="bg-slate-900 text-indigo-300 p-3 rounded-xl font-mono mt-2 overflow-x-auto text-[10px]">
{`POST https://api.monnify.com/api/v1/bank-transfer/reserved-accounts
Headers: { Authorization: "Bearer [JWT_TOKEN]" }
Payload: {
  accountReference: "REF_WMS_T001",
  accountName: "WAVIE/ADEWALE BABAJIDE",
  currencyCode: "NGN",
  contractCode: "8294829402",
  customerEmail: "test@wavie.ng",
  customerName: "Adewale Babajide",
  getAllAvailableBanks: true
}`}
                  </pre>
                </section>

                <section className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <h3 className="font-extrabold text-indigo-900 mb-2 uppercase tracking-wide">2. Outbound Disbursement Scheme (API Transfer)</h3>
                  <p>Resolves banks via single transfer endpoints, subtracting wallet main balance safely.</p>
                  <pre className="bg-slate-900 text-indigo-300 p-3 rounded-xl font-mono mt-2 overflow-x-auto text-[10px]">
{`POST https://api.monnify.com/api/v1/disbursements/single
Payload: {
  amount: 25000,
  reference: "MNFY_DSP_3849201",
  narration: "Debit Single payout",
  destinationBankCode: "058",
  destinationAccountNumber: "0123456789",
  sourceAccountNumber: "9000000001"
}`}
                  </pre>
                </section>

                <section className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <h3 className="font-extrabold text-indigo-900 mb-2 uppercase tracking-wide">3. KYC Identity Endpoints Verified</h3>
                  <p>Standardizes verification via Government biometric sources.</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>BVN Validation API:</strong> Checks name matches DOB parameters on bank file.</li>
                    <li><strong>NIN Matching API:</strong> Resolves fingerprint patterns with National IDs.</li>
                  </ul>
                </section>

              </div>
            </main>
          )}

          {/* ADMIN MANAGEMENT CONTROL CENTER TAB */}
          {activeTab === "admin" && (
            <main className="flex-1 p-4 sm:p-8 space-y-6">
              
              {/* Aggregated Revenue metrics row (Bento-style grids) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total System Volume</span>
                  <h3 className="text-xl font-extrabold font-mono mt-2 text-indigo-400">
                    ₦{adminTxs.reduce((acc, current) => acc + current.amount, 0).toLocaleString()}
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-1">Total aggregated transaction flow (NGN)</p>
                </div>

                <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Users Seeding</span>
                  <h3 className="text-xl font-extrabold mt-2 text-emerald-400">
                    {adminUsers.length} Active
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-1">Simulated sandbox financial profile files</p>
                </div>

                <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">System Reserves</span>
                  <h3 className="text-xl font-extrabold font-mono mt-2 text-yellow-400">
                    ₦{adminUsers.reduce((acc, u) => acc + u.balanceMain, 0).toLocaleString()}
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-1">Total ledger vault holdings</p>
                </div>

                <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Automation Service</span>
                  <p className={`text-xs font-bold uppercase tracking-wide mt-2 ${automationEnabled ? "text-emerald-400" : "text-yellow-500 font-semibold"}`}>
                    ● {automationEnabled ? "Active Feed" : "Paused / Off"}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">Simulated: {automationCount} events</p>
                </div>

                <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Admin Privileged</span>
                  <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wide mt-1">✓ Status Online</p>
                  <p className="text-[9px] text-slate-400 mt-1">System level write controls</p>
                </div>
              </div>

              {/* Administrative controllers bento splits */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* User directory controller (Freeze mechanics) */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs mb-4">
                    User Accounts Directory
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
                      <thead>
                        <tr className="bg-slate-50 font-bold text-slate-500 text-[10px] uppercase">
                          <th className="p-2.5">User</th>
                          <th className="p-2.5">Email / Phone</th>
                          <th className="p-2.5">KYC</th>
                          <th className="p-2.5">Wallet Reserves</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold text-slate-800">
                              {u.fullName} 
                              {u.role === "admin" && <span className="ml-1 text-[8px] bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded">ADMIN</span>}
                            </td>
                            <td className="p-2.5">
                              <div>{u.email}</div>
                              <div className="text-[9px] text-slate-400">{u.phoneNumber}</div>
                            </td>
                            <td className="p-2.5 font-extrabold text-indigo-700">Level {u.kycLevel}</td>
                            <td className="p-2.5 font-mono font-bold text-slate-800">
                              ₦{u.balanceMain.toLocaleString()}
                            </td>
                            <td className="p-2.5 text-center">
                              {u.id === currentUser.id ? (
                                <span className="text-[9px] text-slate-400">Self (Core)</span>
                              ) : (
                                <button
                                  onClick={() => handleAdminFreezeUser(u.id, !u.isFrozen)}
                                  className={`px-3 py-1 rounded-full text-[9px] font-bold ${
                                    u.isFrozen 
                                      ? "bg-red-100 text-red-600 hover:bg-red-200" 
                                      : "bg-emerald-100 text-emerald-600 hover:bg-red-50 hover:text-red-600"
                                  } transition-all`}
                                >
                                  {u.isFrozen ? "Frozen (Unfreeze)" : "Active (Freeze)"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Promotional bonus adjusting tuning controls */}
                <div className="lg:col-span-4 space-y-6">
                  
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                    <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs mb-3">
                      Global Promo Tuning
                    </h3>
                    <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                      Mutate welcome rewards & referral system payments dynamically. Updates backend memory.
                    </p>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Referral Bonus Payout (NGN)
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="2500"
                          step="100"
                          value={promoTuningBonus}
                          onChange={(e) => setPromoTuningBonus(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[11px] font-bold text-slate-700 mt-2">
                          <span>₦100</span>
                          <span className="text-indigo-600">₦{promoTuningBonus}</span>
                          <span>₦2,500</span>
                        </div>
                      </div>

                      <button
                        onClick={handleAdminTuningCommissions}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold tracking-tight uppercase text-[9px] py-2.5 rounded-xl transition-all"
                      >
                        Commit Changes
                      </button>
                    </div>
                  </div>

                  {/* Audit Logs terminal */}
                  <div className="bg-slate-900 text-slate-300 rounded-3xl p-5 shadow-xl font-mono text-[9px] border border-slate-800">
                    <div className="flex justify-between items-center mb-3 text-[10px] uppercase font-bold text-slate-400 pb-2 border-b border-white/5">
                      <span>Interactive Audit Rail</span>
                      <span className="text-emerald-400 animate-pulse">● System Live</span>
                    </div>
                    <div className="h-32 overflow-y-auto space-y-2 leading-relaxed">
                      {adminLogs.map((log, id) => (
                        <div key={id} className="text-slate-400">
                          <span className="text-slate-600 font-bold select-none">[+]</span> {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Automation Logs Terminal */}
                  <div className="bg-slate-950 text-slate-300 rounded-3xl p-5 shadow-xl font-mono text-[9px] border border-slate-800">
                    <div className="flex justify-between items-center mb-3 text-[10px] uppercase font-bold text-slate-400 pb-2 border-b border-white/5">
                      <span>Live Automation Terminal</span>
                      <span className={automationEnabled ? "text-emerald-400 animate-pulse font-bold" : "text-yellow-500 font-bold"}>
                        ● {automationEnabled ? "RUNNING" : "PAUSED"}
                      </span>
                    </div>
                    <div className="h-32 overflow-y-auto space-y-2 leading-relaxed">
                      {automationLogs.length === 0 ? (
                        <p className="text-slate-500 italic">No automated actions logged yet.</p>
                      ) : (
                        automationLogs.map((log, id) => (
                          <div key={id} className="text-emerald-400">
                            <span className="text-slate-600 font-bold select-none">[⚡]</span> {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
              
            </main>
          )}

          {/* CHAT TRIGGERS FOR INTELLIGENT WAVIE AI FINANCIAL ADVISOR SIDE DRAWER */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowAiAdvisor(!showAiAdvisor)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-2xl shadow-emerald-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer border border-emerald-400/30"
            >
              <Bot className="w-5.5 h-5.5 animate-pulse" />
              <span>Chop Money Advisor</span>
            </button>
          </div>

          {/* SLIDE OUT COMPONENT: WavieAssistant Drawer */}
          {showAiAdvisor && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
              <div 
                className="absolute inset-0 cursor-pointer" 
                onClick={() => setShowAiAdvisor(false)} 
              />
              <div className="w-full max-w-md h-full bg-white shadow-2xl relative z-10 flex flex-col animate-slide-left">
                
                {/* Close Button overlay inside Assistant */}
                <button
                  onClick={() => setShowAiAdvisor(false)}
                  className="absolute top-3.5 right-4 z-50 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-white flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex-1 overflow-hidden">
                  <WavieAssistant user={currentUser} onClose={() => setShowAiAdvisor(false)} />
                </div>
              </div>
            </div>
          )}

          {/* ==================== ACTION MODALS CONTAINER ==================== */}
          {activeModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative animate-zoom-in">
                
                {/* Modal close key */}
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setSendError("");
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* MODAL ACTION: SEND MONEY / BANK PAYOUT DIRECTIVES */}
                {activeModal === "send" && (
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-base font-bold text-slate-800">Bank Transfer Outbound</h4>
                      <p className="text-[10px] text-slate-400">Debits main spending wallet directly matching Monnify disbursement standards.</p>
                    </div>

                    {sendError && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-[10px]">
                        {sendError}
                      </div>
                    )}

                    <form onSubmit={handleSendMoneyAction} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Receiving Bank Select
                        </label>
                        <select
                          value={sendBank}
                          onChange={(e) => setSendBank(e.target.value)}
                          className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-2.5 bg-white font-medium"
                        >
                          <option value="">Select recipient bank...</option>
                          {banks.map((b) => (
                            <option key={b.code} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          10-Digit Account Number
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={sendAccount}
                          onChange={(e) => setSendAccount(e.target.value.replace(/\D/g, ""))}
                          placeholder="0123456789"
                          className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-2.5 font-bold font-mono tracking-widest"
                        />
                      </div>

                      {/* Display resolved bank account name dynamically */}
                      {isVerifyingAccount && (
                        <p className="text-[10px] text-indigo-600 font-bold animate-pulse">Resolving bank name via Monnify APIs...</p>
                      )}
                      {verifiedAccountName && (
                        <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl">
                          <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-wider">Verified Recipient Name</p>
                          <p className="text-xs font-bold text-emerald-800 mt-0.5">{verifiedAccountName}</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Transfer Cash Amount (NGN)
                        </label>
                        <input
                          type="number"
                          required
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-2.5 font-bold font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex justify-between">
                          <span>Confirm 4-Digit Security PIN</span>
                          <span className="text-indigo-600 font-mono text-[9px]">Accepts: 1234</span>
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={sendPin}
                          onChange={(e) => setSendPin(e.target.value.replace(/\D/g, ""))}
                          className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl p-2.5 text-center tracking-widest font-mono font-bold"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isVerifyingAccount || !verifiedAccountName}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold uppercase py-3 rounded-xl tracking-wider text-[10px] transition-all shadow-md"
                      >
                        Dispatch Payout Transfer
                      </button>
                    </form>
                  </div>
                )}

                {/* MODAL ACTION: WEBHOOK SIMULATED DEPOSITS */}
                {activeModal === "add" && (
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-base font-bold text-slate-800">Dynamic Bank Funding</h4>
                      <p className="text-[10px] text-slate-400">Credit your custom sandbox virtual accounts instantly using automated webhook simulations.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                        <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Your Monnify Account No</label>
                        <select
                          value={fundingBankNo}
                          onChange={(e) => setFundingBankNo(e.target.value)}
                          className="w-full border border-slate-150 rounded-xl p-2.5 bg-white text-xs font-semibold font-mono mt-1"
                        >
                          {currentUser.virtualAccounts?.map((item, id) => (
                            <option key={id} value={item.accountNumber}>
                              {item.bankName} - {item.accountNumber}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Incoming Transfer Amount (NGN)</label>
                        <input
                          type="number"
                          value={fundingAmount}
                          onChange={(e) => setFundingAmount(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold font-mono text-center"
                        />
                      </div>

                      <button
                        onClick={handleTriggerWebhookSimulator}
                        disabled={isFundingSimulating}
                        className="w-full bg-amber-500 hover:bg-amber-600 font-extrabold text-[10px] tracking-wider uppercase py-3 rounded-xl shadow-lg transition-all text-slate-900 cursor-pointer"
                      >
                        {isFundingSimulating ? "Dispatching API payload..." : "Trigger Simulated Monnify Webhook"}
                      </button>

                      <div className="p-3 bg-indigo-50 text-[10px] text-indigo-800 rounded-xl leading-relaxed">
                        💡 <strong>Real Sandbox Operation:</strong> This command triggers a simulated POST webhook notification to your development server's receiver. Your wallet reflects credits instantly without refresh tags.
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL ACTION: AIRTIME */}
                {activeModal === "airtime" && (
                  <div className="p-6 text-xs">
                    <h4 className="text-base font-bold text-slate-800 mb-1">Buy Outbound Airtime</h4>
                    <p className="text-[10px] text-slate-400 mb-4">Flat 1% cashback awarded instantly upon successful dispatch.</p>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        {billNetworks.map((net) => (
                          <button
                            key={net}
                            onClick={() => setBillNetwork(net)}
                            className={`flex-1 font-extrabold py-2 border rounded-xl transition-all ${
                              billNetwork === net 
                                ? "bg-amber-500 border-amber-500 text-slate-950 shadow-sm" 
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {net}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recharge Mobile Number</label>
                        <input
                          type="tel"
                          value={billPhone}
                          onChange={(e) => setBillPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 08123456789"
                          className="w-full border border-slate-200 rounded-xl p-2.5 font-bold font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Airtime Recharge Amount (NGN)</label>
                        <input
                          type="number"
                          value={billAmount}
                          onChange={(e) => setBillAmount(e.target.value)}
                          placeholder="Value in Naira"
                          className="w-full border border-slate-200 rounded-xl p-2.5 font-mono font-bold"
                        />
                      </div>

                      <button
                        onClick={() => handleBillPayment(TransactionType.AIRTIME, billNetwork, Number(billAmount), billPhone, {})}
                        disabled={!billPhone || Number(billAmount) <= 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase py-3 rounded-xl tracking-wider text-[10px]"
                      >
                        Confirm Airtime Recharge
                      </button>
                    </div>
                  </div>
                )}

                {/* MODAL ACTION: MOBILE DATA */}
                {activeModal === "data" && (
                  <div className="p-6 text-xs">
                    <h4 className="text-base font-bold text-slate-800 mb-1">Mobile Data Subscription</h4>
                    <p className="text-[10px] text-slate-400 mb-4">Select pre-compiled carrier pricing plans synchronized via Monnify feeds.</p>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        {billNetworks.map((net) => (
                          <button
                            key={net}
                            onClick={() => { setBillNetwork(net); setDataPlan(""); }}
                            className={`flex-1 font-extrabold py-2 border rounded-xl transition-all ${
                              billNetwork === net 
                                ? "bg-cyan-500 border-cyan-500 text-white shadow-sm" 
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {net}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mobile Number to Credit</label>
                        <input
                          type="tel"
                          value={billPhone}
                          onChange={(e) => setBillPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 08123456789"
                          className="w-full border border-slate-200 rounded-xl p-2.5 font-bold font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Select Bundle Data Plan</label>
                        <div className="grid grid-cols-2 gap-2">
                          {mtnDataPlans.map((plan, i) => (
                            <div 
                              key={i}
                              onClick={() => { setDataPlan(plan.name); setBillAmount(plan.price.toString()); }}
                              className={`border p-3 rounded-xl cursor-pointer transition-all ${
                                dataPlan === plan.name 
                                  ? "border-cyan-500 bg-cyan-50/50" 
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <p className="font-bold text-[10px] text-slate-700">{plan.name.split(" • ")[0]}</p>
                              <p className="text-[11px] font-black text-cyan-600 mt-1 font-mono">{plan.name.split(" • ")[1]}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleBillPayment(TransactionType.DATA, billNetwork, Number(billAmount), billPhone, { planName: dataPlan })}
                        disabled={!billPhone || !dataPlan}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase py-3 rounded-xl tracking-wider text-[10px]"
                      >
                        Dispatch Mobile Data Bundle
                      </button>
                    </div>
                  </div>
                )}

                {/* MODAL ACTION: ELECTRICITY PREPAID */}
                {activeModal === "electricity" && (
                  <div className="p-6 text-xs">
                    <h4 className="text-base font-bold text-slate-800 mb-1">Electricity Meter Bill Pay</h4>
                    <p className="text-[10px] text-slate-400 mb-4 font-medium">Validates physical meter parameters before executing secure voucher debit.</p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Distribution Company Disco</label>
                        <select
                          value={elecProvider}
                          onChange={(e) => setElecProvider(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-semibold"
                        >
                          {elecProviders.map((disco) => (
                            <option key={disco} value={disco}>{disco} Prepaid Electricity</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">11-Digit Prepaid Meter Number</label>
                        <input
                          type="text"
                          maxLength={11}
                          required
                          value={elecMeter}
                          onChange={(e) => setElecMeter(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 04193857391"
                          className="w-full border border-slate-200 rounded-xl p-2.5 font-bold font-mono tracking-wider text-center"
                        />
                      </div>

                      {isValidatingMeter && (
                        <p className="text-[9px] text-yellow-600 font-extrabold animate-pulse">Querying distribution vault via Monnify DISCO API details...</p>
                      )}

                      {elecMeterValidName && (
                        <div className="bg-yellow-50 border border-yellow-200 p-2.5 rounded-xl">
                          <p className="text-[8px] text-yellow-700 font-bold uppercase tracking-wider">Meter Holder Details</p>
                          <p className="text-xs font-bold text-yellow-900 mt-0.5">{elecMeterValidName}</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Token Recharge Value (NGN)</label>
                        <input
                          type="number"
                          value={elecAmount}
                          onChange={(e) => setElecAmount(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2.5 font-bold font-mono"
                        />
                      </div>

                      <button
                        onClick={() => handleBillPayment(TransactionType.ELECTRICITY, elecProvider, Number(elecAmount), "", { meterNumber: elecMeter })}
                        disabled={!elecMeterValidName || Number(elecAmount) <= 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase py-3 rounded-xl tracking-wider text-[10px]"
                      >
                        Generate Prepaid Token Voucher
                      </button>
                    </div>
                  </div>
                )}

                {/* MODAL ACTION: CABLE TV */}
                {activeModal === "cable" && (
                  <div className="p-6 text-xs">
                    <h4 className="text-base font-bold text-slate-800 mb-1">Cable TV Multiplex Sub</h4>
                    <p className="text-[10px] text-slate-400 mb-4">Validate DSTV/GOTV multi-choice decoders with instantaneous channel reload.</p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Select Cable Provider</label>
                        <div className="flex gap-2">
                          {["DStv", "GOtv", "Startimes"].map((prov) => (
                            <button
                              key={prov}
                              onClick={() => {
                                setCableProvider(prov);
                                const defaultPackage = cablePackages[prov][0];
                                setCablePackage(defaultPackage.name);
                                setCableAmount(defaultPackage.price);
                              }}
                              className={`flex-1 font-bold py-2 border rounded-xl transition-all ${
                                cableProvider === prov 
                                  ? "bg-purple-600 border-purple-600 text-white" 
                                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              {prov}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Decoder Smart Card Number</label>
                        <input
                          type="text"
                          required
                          value={cableCardNum}
                          onChange={(e) => setCableCardNum(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 10938475829"
                          className="w-full border border-slate-200 rounded-xl p-2.5 font-bold font-mono tracking-widest text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Channel Packages Option</label>
                        <select
                          value={cablePackage}
                          onChange={(e) => {
                            const pack = cablePackages[cableProvider].find(p => p.name === e.target.value);
                            if (pack) {
                              setCablePackage(pack.name);
                              setCableAmount(pack.price);
                            }
                          }}
                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-medium"
                        >
                          {cablePackages[cableProvider].map((p, i) => (
                            <option key={i} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-purple-50 border border-purple-100 p-3 rounded-xl flex justify-between items-center">
                        <span className="font-bold text-purple-700">Fee Amount Due:</span>
                        <span className="text-xl font-mono font-black text-purple-900">₦{cableAmount.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => handleBillPayment(TransactionType.CABLE, cableProvider, cableAmount, "", { smartCardNumber: cableCardNum, planName: cablePackage })}
                        disabled={!cableCardNum}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase py-3 rounded-xl tracking-wider text-[10px]"
                      >
                        Execute Subscription Refill
                      </button>
                    </div>
                  </div>
                )}

                {/* MODAL ACTION: BETTING WALLET */}
                {activeModal === "betting" && (
                  <div className="p-6 text-xs">
                    <h4 className="text-base font-bold text-slate-800 mb-1">Betting Wallet Funding</h4>
                    <p className="text-[10px] text-slate-400 mb-4">Validate betting ID files prior to transferring spending credits.</p>

                    <form onSubmit={handleBetFunding} className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Select Sportsbook Vendor</label>
                        <select
                          value={betProvider}
                          onChange={(e) => setBetProvider(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-bold"
                        >
                          {betProviders.map((disco) => (
                            <option key={disco} value={disco}>{disco} Sportsbook</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Betting Client Account ID</label>
                        <input
                          type="text"
                          required
                          value={betUserId}
                          onChange={(e) => setBetUserId(e.target.value)}
                          placeholder="e.g. 7284920"
                          className="w-full border border-slate-200 rounded-xl p-2.5 font-bold font-mono tracking-widest text-center"
                        />
                      </div>

                      {isVerifyingBet && (
                        <p className="text-[10px] text-red-500 font-bold animate-pulse">Resolving player name details from sportsbook directory...</p>
                      )}

                      {betVerifiedName && (
                        <div className="bg-red-50 border border-red-150 p-2.5 rounded-xl">
                          <p className="text-[8px] text-red-650 font-bold uppercase tracking-wider">Identified Player Name</p>
                          <p className="text-xs font-bold text-red-850 mt-0.5">{betVerifiedName}</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Credits top-up amount (NGN)</label>
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2.5 font-bold font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!betVerifiedName || Number(betAmount) <= 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold uppercase py-3 rounded-xl tracking-wider text-[10px]"
                      >
                        Confirm Betting Credit Transfer
                      </button>
                    </form>
                  </div>
                )}

                {/* MODAL ACTION: KYC VERIFICATION PORTAL */}
                {activeModal === "kyc" && (
                  <div className="p-6 text-xs">
                    <h4 className="text-base font-bold text-slate-800 mb-1">Identity verification level program</h4>
                    <p className="text-[10px] text-slate-400 mb-4">Complete government criteria verification checks to double ledger limits.</p>

                    <div className="mb-4 bg-emerald-50 text-emerald-800 p-3 rounded-2xl flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                      <div>
                        <p className="font-bold">Current Standing Level: {currentUser.kycLevel}</p>
                        <p className="text-[9px] leading-relaxed opacity-90">Daily Transfer Limits: ₦{currentUser.kycLevel === 1 ? "20,000" : currentUser.kycLevel === 2 ? "200,000" : "5,000,000"}</p>
                      </div>
                    </div>

                    {/* Left criteria verification steps */}
                    {currentUser.kycLevel === KycLevel.LEVEL_1 && (
                      <form onSubmit={(e) => handleKycLevelSubmit(e, KycLevel.LEVEL_2)} className="space-y-4">
                        <div className="border border-indigo-100 bg-indigo-50/40 p-3 rounded-xl text-[10px] text-indigo-900 leading-relaxed">
                          🛡️ <strong>Level 2 Target:</strong> Verify your Bank Verification Number (BVN). Awarded a <strong>₦1,000 performance bonus</strong> instantly upon matching.
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">11-Digit BVN biometric registry</label>
                          <input
                            type="text"
                            maxLength={11}
                            required
                            value={kycBvn}
                            onChange={(e) => setKycBvn(e.target.value.replace(/\D/g, ""))}
                            placeholder="22240958392"
                            className="w-full border border-slate-200 rounded-xl p-2.5 font-bold font-mono tracking-widest text-center"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase py-3 rounded-xl tracking-wider text-[10px]"
                        >
                          Verify government BVN details
                        </button>
                      </form>
                    )}

                    {currentUser.kycLevel === KycLevel.LEVEL_2 && (
                      <form onSubmit={(e) => handleKycLevelSubmit(e, KycLevel.LEVEL_3)} className="space-y-4">
                        <div className="border border-indigo-100 bg-indigo-50/40 p-3 rounded-xl text-[10px] text-indigo-900 leading-relaxed">
                          🛡️ <strong>Level 3 Target:</strong> Verify National Identification Number (NIN) and upload validation Selfie matches. Awards <strong>₦1,000 performance bonus</strong>.
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">11-Digit NIN biometric registry</label>
                          <input
                            type="text"
                            maxLength={11}
                            required
                            value={kycNin}
                            onChange={(e) => setKycNin(e.target.value.replace(/\D/g, ""))}
                            placeholder="32120938495"
                            className="w-full border border-slate-200 rounded-xl p-2.5 font-bold font-mono tracking-widest text-center"
                          />
                        </div>

                        <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition-all bg-slate-50">
                          <CheckCircle className="w-5.5 h-5.5 text-slate-400 mx-auto mb-1.5" />
                          <p className="font-bold text-[10px] text-slate-600">Simulated Selfie capture loaded successfully</p>
                          <p className="text-[8px] text-slate-400 mt-0.5">Verified biometric facial compliance checks</p>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase py-3 rounded-xl tracking-wider text-[10px]"
                        >
                          Verify government NIN details
                        </button>
                      </form>
                    )}

                    {currentUser.kycLevel === KycLevel.LEVEL_3 && (
                      <div className="space-y-3 text-center py-6">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                          ✓
                        </div>
                        <h5 className="font-extrabold text-slate-800 text-sm">Fintech Limits Uncapped</h5>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Congratulations! Your identity documents are fully validated. You possess maximum ₦5,000,000 daily payout limits.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* MODAL ACTION: INTERACTIVE TRANSACTION RECEIPT */}
                {activeModal === "receipt" && selectedReceiptTx && (
                  <div className="p-6 text-xs text-slate-700">
                    <div className="text-center pb-6 border-b border-slate-100">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                        {selectedReceiptTx.type === TransactionType.TRANSFER_IN ? "📥" : "📤"}
                      </div>
                      <h4 className="font-black text-slate-800 text-sm">Wavie Transaction Receipt</h4>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">Reference ID: {selectedReceiptTx.reference}</p>
                    </div>

                    <div className="py-6 space-y-3 leading-relaxed">
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Transaction Status:</span>
                        <span className="font-bold text-emerald-600 uppercase tracking-widest">{selectedReceiptTx.status}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Activity Type:</span>
                        <span className="font-bold text-slate-800 uppercase tracking-tight">{selectedReceiptTx.type}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Processed NGN Amount:</span>
                        <span className="font-extrabold text-slate-800 font-mono">₦{selectedReceiptTx.amount.toLocaleString()}.00</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">Description Memo:</span>
                        <span className="font-bold text-slate-800 text-right max-w-[190px] truncate">{selectedReceiptTx.description}</span>
                      </div>

                      {/* Display generated Prepaid electricity tokens if success */}
                      {selectedReceiptTx.electricityToken && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center mt-3">
                          <p className="text-[8px] text-yellow-800 font-bold uppercase tracking-wider">PREPAID METER METER TOKEN</p>
                          <p className="text-sm font-mono font-black text-yellow-950 tracking-wider mt-1 select-all">{selectedReceiptTx.electricityToken}</p>
                          <p className="text-[8px] text-slate-400 mt-1">Input this token code sequence directly inside physical keypad monitors.</p>
                        </div>
                      )}

                      {selectedReceiptTx.cashbackEarned !== undefined && selectedReceiptTx.cashbackEarned > 0 && (
                        <div className="flex justify-between pt-2 text-emerald-700 font-bold">
                          <span>Cashback Rewards Added:</span>
                          <span>+₦{selectedReceiptTx.cashbackEarned.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-slate-400">Processed Time:</span>
                        <span className="text-slate-500 font-mono">{new Date(selectedReceiptTx.timestamp).toLocaleString()}</span>
                      </div>

                    </div>

                    {/* Shared Receipt tool button */}
                    <div className="pt-4 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => copyToClipboard(selectedReceiptTx.reference, "Transaction Ref", setToastMsg)}
                        className="flex-1 border border-slate-200 hover:border-indigo-600 py-2.5 rounded-xl text-[10px] font-semibold transition-all uppercase"
                      >
                        Copy Reference
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="flex-1 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl text-[10px] transition-all uppercase tracking-wide"
                      >
                        Print Ledger Receipt
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      )}

      {/* FOOTER NAV / SIMULATOR BANNER */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-4 flex flex-col md:flex-row items-center justify-between text-slate-400 gap-3 text-xs mt-auto">
        <div className="flex items-center gap-3">
          <p className="text-[11px]">© 2026 Wavie Microfinance Ltd. Licensed under Central Bank of Nigeria protocols (Monnify contract).</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Secure connection authenticated</span>
        </div>
      </footer>

    </div>
  );
}
