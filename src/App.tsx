/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WalletTable } from './components/WalletTable';
import { TransactionsTable } from './components/TransactionsTable';
import { AuditTable } from './components/AuditTable';
import { WalletDetailDrawer } from './components/WalletDetailDrawer';
import { TopUpModal } from './components/TopUpModal';
import { SimulateOperationModal } from './components/SimulateOperationModal';
import { AdjustmentModal } from './components/AdjustmentModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import {
  INITIAL_SHOMOOS_WALLETS,
  INITIAL_CLAUDE_WALLETS,
  INITIAL_VERCEL_WALLETS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import { Wallet, WalletType, Transaction, TopUpAudit } from './types/wallet';
import { Language, TRANSLATIONS } from './utils/translations';
import {
  Search,
  Filter,
  Plus,
  Zap,
  Download,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Coins,
  ShieldCheck,
  Server,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentWalletType, setCurrentWalletType] = useState<WalletType>('shomoos');
  const [activeTab, setActiveTab] = useState<'wallets' | 'transactions' | 'audit'>('wallets');

  // Core Data State
  const [shomoosWallets, setShomoosWallets] = useState<Wallet[]>(INITIAL_SHOMOOS_WALLETS);
  const [claudeWallets, setClaudeWallets] = useState<Wallet[]>(INITIAL_CLAUDE_WALLETS);
  const [vercelWallets, setVercelWallets] = useState<Wallet[]>(INITIAL_VERCEL_WALLETS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState<TopUpAudit[]>(INITIAL_AUDIT_LOGS);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal / Drawer States
  const [selectedWalletForDetail, setSelectedWalletForDetail] = useState<Wallet | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpTargetCode, setTopUpTargetCode] = useState<string | undefined>(undefined);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [simulateTargetCode, setSimulateTargetCode] = useState<string | undefined>(undefined);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentTargetWallet, setAdjustmentTargetWallet] = useState<Wallet | null>(null);
  const [adjustmentTargetTxn, setAdjustmentTargetTxn] = useState<Transaction | null>(null);

  const t = TRANSLATIONS[lang];

  // Active wallets list depending on Shomoos, Claude, or Vercel selection
  const currentWallets =
    currentWalletType === 'shomoos'
      ? shomoosWallets
      : currentWalletType === 'claude'
      ? claudeWallets
      : vercelWallets;

  // Extract unique operators for the Operator dropdown
  const operators = useMemo(() => {
    const ops = new Set<string>();
    currentWallets.forEach((w) => ops.add(w.operator));
    return Array.from(ops);
  }, [currentWallets]);

  // Filtered wallets
  const filteredWallets = useMemo(() => {
    return currentWallets.filter((wallet) => {
      // Operator filter
      if (selectedOperator !== 'ALL' && wallet.operator !== selectedOperator) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'ALL' && wallet.status !== selectedStatus) {
        return false;
      }
      // Search query filter (wallet_code, operator, property)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = wallet.wallet_code.toLowerCase().includes(q);
        const operatorMatch = wallet.operator.toLowerCase().includes(q);
        const propertyMatch = wallet.property_name.toLowerCase().includes(q);
        return codeMatch || operatorMatch || propertyMatch;
      }
      return true;
    });
  }, [currentWallets, selectedOperator, selectedStatus, searchQuery]);

  // Handlers for Top-Up
  const handleOpenTopUp = (wallet?: Wallet) => {
    setTopUpTargetCode(wallet ? wallet.wallet_code : currentWallets[0]?.wallet_code);
    setIsTopUpOpen(true);
  };

  const handleConfirmTopUp = (newAudit: TopUpAudit, newTxn: Transaction) => {
    // Add to audit logs
    setAuditLogs((prev) => [newAudit, ...prev]);
    // Add to transactions
    setTransactions((prev) => [newTxn, ...prev]);

    // Update wallet balance and available
    const updateWallet = (w: Wallet) => {
      if (w.wallet_code === newAudit.wallet_code) {
        return {
          ...w,
          balance: Number((w.balance + newAudit.subtotal).toFixed(2)),
          available: w.available + newAudit.quantity,
          last_top_up_at: newAudit.created_at,
        };
      }
      return w;
    };

    if (newAudit.wallet_type === 'shomoos') {
      setShomoosWallets((prev) => prev.map(updateWallet));
    } else if (newAudit.wallet_type === 'claude') {
      setClaudeWallets((prev) => prev.map(updateWallet));
    } else {
      setVercelWallets((prev) => prev.map(updateWallet));
    }

    // Also update selected detail drawer if open
    if (selectedWalletForDetail?.wallet_code === newAudit.wallet_code) {
      setSelectedWalletForDetail((prev) => (prev ? updateWallet(prev) : null));
    }
  };

  // Handlers for Simulation
  const handleOpenSimulate = (wallet?: Wallet) => {
    setSimulateTargetCode(wallet ? wallet.wallet_code : currentWallets[0]?.wallet_code);
    setIsSimulateOpen(true);
  };

  const handleExecuteSimulation = (
    updatedWallet: Wallet,
    newTransaction: Transaction,
    isSuccess: boolean
  ) => {
    setTransactions((prev) => [newTransaction, ...prev]);

    const updateFn = (w: Wallet) => (w.wallet_code === updatedWallet.wallet_code ? updatedWallet : w);
    if (updatedWallet.type === 'shomoos') {
      setShomoosWallets((prev) => prev.map(updateFn));
    } else if (updatedWallet.type === 'claude') {
      setClaudeWallets((prev) => prev.map(updateFn));
    } else {
      setVercelWallets((prev) => prev.map(updateFn));
    }

    if (selectedWalletForDetail?.wallet_code === updatedWallet.wallet_code) {
      setSelectedWalletForDetail(updatedWallet);
    }
  };

  // Handlers for Adjustment / Reversal
  const handleOpenAdjustment = (wallet?: Wallet, txn?: Transaction) => {
    setAdjustmentTargetWallet(wallet || null);
    setAdjustmentTargetTxn(txn || null);
    setIsAdjustmentOpen(true);
  };

  const handleConfirmAdjustment = (
    updatedWallet: Wallet,
    newTransaction: Transaction,
    newAudit: TopUpAudit
  ) => {
    setTransactions((prev) => [newTransaction, ...prev]);
    setAuditLogs((prev) => [newAudit, ...prev]);

    const updateFn = (w: Wallet) => (w.wallet_code === updatedWallet.wallet_code ? updatedWallet : w);
    if (updatedWallet.type === 'shomoos') {
      setShomoosWallets((prev) => prev.map(updateFn));
    } else if (updatedWallet.type === 'claude') {
      setClaudeWallets((prev) => prev.map(updateFn));
    } else {
      setVercelWallets((prev) => prev.map(updateFn));
    }

    if (selectedWalletForDetail?.wallet_code === updatedWallet.wallet_code) {
      setSelectedWalletForDetail(updatedWallet);
    }
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-row antialiased font-sans select-none"
    >
      {/* 1. Left Sidebar Matching Mudabbir Theme */}
      <Sidebar
        currentWalletType={currentWalletType}
        onSelectWalletType={(type) => {
          setCurrentWalletType(type);
          setActiveTab('wallets');
        }}
        lang={lang}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <Header
          lang={lang}
          onToggleLang={() => setLang(lang === 'en' ? 'ar' : 'en')}
          onOpenQuickTopUp={() => handleOpenTopUp()}
          onOpenAuditTab={() => setActiveTab('audit')}
        />

        {/* Page Content Body */}
        <main className="p-6 md:p-8 space-y-5 max-w-7xl mx-auto w-full">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{t.breadcrumb_root}</span>
            <span className="text-slate-300">/</span>
            <span>{t.breadcrumb_wallets}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">
              {currentWalletType === 'shomoos'
                ? t.shomoos_wallets
                : currentWalletType === 'claude'
                ? t.claude_wallets
                : t.vercel_wallets}
            </span>
          </nav>

          {/* Page Heading matching reference screenshot */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t.wallets}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentWalletType === 'shomoos'
                ? 'Shomoos Elm regulatory guest registration balances and submission health'
                : 'Claude Vision ID Capture OCR token consumption and estimated capture capacity'}
            </p>
          </div>

          {/* Navigation Tabs (Wallets, Transactions, Audit) */}
          <div className="border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-8 -mb-px">
              <button
                onClick={() => setActiveTab('wallets')}
                className={`pb-3 text-sm font-semibold transition-all relative ${
                  activeTab === 'wallets'
                    ? 'text-[#0b3824]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{t.tab_wallets}</span>
                {activeTab === 'wallets' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0b3824] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
                  activeTab === 'transactions'
                    ? 'text-[#0b3824]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{t.tab_transactions}</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {transactions.filter((tx) => tx.wallet_type === currentWalletType).length}
                </span>
                {activeTab === 'transactions' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0b3824] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
                  activeTab === 'audit'
                    ? 'text-[#0b3824]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{t.tab_audit}</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {auditLogs.length}
                </span>
                {activeTab === 'audit' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0b3824] rounded-full" />
                )}
              </button>
            </div>

            {/* Quick top-up button */}
            <div className="hidden sm:flex items-center gap-2 pb-2">
              <button
                onClick={() => handleOpenTopUp()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b3824] hover:bg-[#124930] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Top-Up Wallet</span>
              </button>
            </div>
          </div>

          {/* TAB 1: WALLETS LIST & FILTERS */}
          {activeTab === 'wallets' && (
            <div className="space-y-4">
              {/* Search and Filters Bar (Matching Screenshot exact layout) */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.search_placeholder}
                    className="w-full bg-white text-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0b3824] shadow-2xs transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Operator Filter Dropdown */}
                <div className="relative">
                  <select
                    value={selectedOperator}
                    onChange={(e) => setSelectedOperator(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium pl-3 pr-8 py-2.5 rounded-lg shadow-2xs focus:outline-none focus:border-[#0b3824] cursor-pointer"
                  >
                    <option value="ALL">{t.operator}</option>
                    {operators.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium pl-3 pr-8 py-2.5 rounded-lg shadow-2xs focus:outline-none focus:border-[#0b3824] cursor-pointer"
                  >
                    <option value="ALL">{t.status}</option>
                    <option value="ACTIVE">{t.active}</option>
                    <option value="SUSPENDED">{t.suspended}</option>
                    <option value="CLOSED">{t.closed}</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Reset Filters button if any filter active */}
                {(searchQuery || selectedOperator !== 'ALL' || selectedStatus !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedOperator('ALL');
                      setSelectedStatus('ALL');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-2"
                  >
                    {t.reset_filters}
                  </button>
                )}
              </div>

              {/* Wallets Table */}
              <WalletTable
                wallets={filteredWallets}
                type={currentWalletType}
                lang={lang}
                onSelectWallet={(wallet) => setSelectedWalletForDetail(wallet)}
                onTopUpWallet={(wallet) => handleOpenTopUp(wallet)}
              />
            </div>
          )}

          {/* TAB 2: TRANSACTIONS LOG */}
          {activeTab === 'transactions' && (
            <TransactionsTable
              transactions={transactions}
              walletType={currentWalletType}
              lang={lang}
              onInitiateReversal={(txn) => handleOpenAdjustment(undefined, txn)}
            />
          )}

          {/* TAB 3: AUDIT & INVOICES */}
          {activeTab === 'audit' && <AuditTable auditLogs={auditLogs} lang={lang} />}
        </main>
      </div>

      {/* Slide-over Wallet Detail Drawer */}
      <WalletDetailDrawer
        wallet={selectedWalletForDetail}
        transactions={transactions}
        auditLogs={auditLogs}
        lang={lang}
        onClose={() => setSelectedWalletForDetail(null)}
        onTopUp={(w) => handleOpenTopUp(w)}
        onInitiateReversal={(w) => handleOpenAdjustment(w)}
      />

      {/* Top-Up Advance Payment Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        wallets={currentWallets}
        selectedWalletCode={topUpTargetCode}
        lang={lang}
        onConfirmTopUp={handleConfirmTopUp}
      />

      {/* Live Operational Simulator Modal (Shomoos Elm / Claude OCR) */}
      <SimulateOperationModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        wallets={currentWallets}
        selectedWalletCode={simulateTargetCode}
        lang={lang}
        onExecuteSimulation={handleExecuteSimulation}
      />

      {/* Financial Adjustment / Reversal Modal */}
      <AdjustmentModal
        isOpen={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
        wallets={currentWallets}
        selectedWallet={adjustmentTargetWallet}
        selectedTransaction={adjustmentTargetTxn}
        lang={lang}
        onConfirmAdjustment={handleConfirmAdjustment}
      />

      {/* Floating WhatsApp Support Widget (Bottom Right as in Screenshot!) */}
      <WhatsAppWidget lang={lang} />
    </div>
  );
}
