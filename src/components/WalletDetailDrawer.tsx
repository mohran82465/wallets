import React, { useState } from 'react';
import { Wallet, Transaction, TopUpAudit } from '../types/wallet';
import { Language, TRANSLATIONS } from '../utils/translations';
import {
  X,
  PlusCircle,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Coins,
  Cpu,
  FileText,
  Clock,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface WalletDetailDrawerProps {
  wallet: Wallet | null;
  transactions: Transaction[];
  auditLogs: TopUpAudit[];
  lang: Language;
  onClose: () => void;
  onTopUp: (wallet: Wallet) => void;
  onSimulate: (wallet: Wallet) => void;
  onInitiateReversal: (wallet: Wallet) => void;
}

export const WalletDetailDrawer: React.FC<WalletDetailDrawerProps> = ({
  wallet,
  transactions,
  auditLogs,
  lang,
  onClose,
  onTopUp,
  onSimulate,
  onInitiateReversal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'invoices'>('transactions');
  const t = TRANSLATIONS[lang];

  if (!wallet) return null;

  // Filter transactions for this wallet
  const walletTransactions = transactions.filter((tx) => tx.wallet_code === wallet.wallet_code);
  const walletInvoices = auditLogs.filter((a) => a.wallet_code === wallet.wallet_code);

  const totalOps = wallet.success + wallet.failed;
  const successRate = totalOps > 0 ? ((wallet.success / totalOps) * 100).toFixed(1) : '100';

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b3824] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {wallet.type === 'shomoos' ? (
                'SH'
              ) : wallet.type === 'claude' ? (
                'CL'
              ) : (
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M24 22.525H0l12-21.05 12 21.05z" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-mono">
                  {wallet.wallet_code}
                </h2>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    wallet.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : wallet.status === 'SUSPENDED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {wallet.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{wallet.property_name}</span>
                <span>•</span>
                <span>{wallet.operator}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Action Bar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onTopUp(wallet)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#0b3824] hover:bg-[#124930] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>{t.top_up_wallet}</span>
            </button>

            <button
              onClick={() => onSimulate(wallet)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{t.run_simulation}</span>
            </button>

            <button
              onClick={() => onInitiateReversal(wallet)}
              className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition-colors"
              title="Manual adjustment or reversal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Financial Balance */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  Financial Balance
                </span>
                <span className="text-[10px] text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                  VAT-Exclusive
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 font-mono">
                  {formatNumber(wallet.balance)}
                </span>
                <span className="text-xs font-bold text-slate-600">SAR</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex justify-between border-t border-emerald-100/80 pt-1.5">
                <span>Unit Rate: {wallet.unit_price.toFixed(2)} SAR</span>
                <span>+15% VAT on top-up</span>
              </div>
            </div>

            {/* Operational Available Submissions / Captures / Requests */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
              <div className="flex items-center justify-between text-blue-800 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  {wallet.type === 'shomoos'
                    ? 'Available Submissions'
                    : wallet.type === 'claude'
                    ? 'Est. Captures Left'
                    : 'Est. 1k Requests Left'}
                </span>
                {wallet.available < 200 && (
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> Low
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 font-mono">
                  {formatNumber(wallet.available)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {wallet.type === 'shomoos'
                    ? 'records'
                    : wallet.type === 'claude'
                    ? 'scans (30d avg)'
                    : 'k edge requests'}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 border-t border-blue-100/80 pt-1.5">
                {wallet.type === 'shomoos' ? (
                  <span>Formula: Balance ÷ Unit Price</span>
                ) : wallet.type === 'claude' ? (
                  <span>Avg Cost: {wallet.average_cost_per_capture?.toFixed(2)} SAR / scan</span>
                ) : (
                  <span>Bandwidth used: {wallet.bandwidth_gb?.toFixed(1) || '0.0'} GB</span>
                )}
              </div>
            </div>
          </div>

          {/* Health & Success Rate */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Operational Health & Accuracy
              </span>
              <span className="font-bold text-emerald-700">{successRate}% Success Rate</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${Math.max(Number(successRate), 5)}%` }}
              />
              <div
                className="bg-red-400 h-full"
                style={{ width: `${100 - Number(successRate)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 text-xs pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-slate-500 text-[11px]">Successful Processed</span>
                  <p className="font-bold text-slate-800">{formatNumber(wallet.success)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <div>
                  <span className="text-slate-500 text-[11px]">Failed Submissions</span>
                  <p className="font-bold text-slate-800">{formatNumber(wallet.failed)}</p>
                </div>
              </div>
            </div>

            {wallet.type === 'claude' && (
              <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-purple-600" /> Total Claude Tokens:
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {wallet.total_tokens ? wallet.total_tokens.toLocaleString() : '0'} tokens
                </span>
              </div>
            )}

            {wallet.type === 'vercel' && (
              <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 fill-current text-slate-800" viewBox="0 0 24 24">
                    <path d="M24 22.525H0l12-21.05 12 21.05z" />
                  </svg>
                  <span>Fast Data & Functions:</span>
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {wallet.bandwidth_gb?.toFixed(1) || '0.0'} GB Transfer •{' '}
                  {wallet.function_invocations?.toLocaleString() || '0'} Invocations
                </span>
              </div>
            )}
          </div>

          {/* Activity Timestamps */}
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-white border border-slate-200 p-3 rounded-xl">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Last Top-Up Date
              </span>
              <p className="font-medium text-slate-800 mt-0.5">{wallet.last_top_up_at}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Last Usage Date
              </span>
              <p className="font-medium text-slate-800 mt-0.5">{wallet.last_usage_at}</p>
            </div>
          </div>

          {/* Sub-tabs for Transactions and Invoices */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                onClick={() => setActiveSubTab('transactions')}
                className={`pb-2 text-xs font-semibold transition-colors border-b-2 ${
                  activeSubTab === 'transactions'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Wallet Ledger ({walletTransactions.length})
              </button>
              <button
                onClick={() => setActiveSubTab('invoices')}
                className={`pb-2 text-xs font-semibold transition-colors border-b-2 ${
                  activeSubTab === 'invoices'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Top-Up Invoices & Audit ({walletInvoices.length})
              </button>
            </div>

            {/* Sub-tab 1: Transactions */}
            {activeSubTab === 'transactions' && (
              <div className="space-y-2">
                {walletTransactions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No recent transactions recorded for this wallet.
                  </p>
                ) : (
                  walletTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs transition-colors flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            {tx.transaction_number}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              tx.transaction_type === 'TOP_UP'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.transaction_type === 'USAGE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {tx.transaction_type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{tx.transaction_at}</span>
                          <span>•</span>
                          <span>Ref: {tx.mudabbir_reference}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-bold tabular-nums text-xs ${
                            tx.amount > 0 ? 'text-emerald-700' : 'text-slate-800'
                          }`}
                        >
                          {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)} SAR
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {tx.result || tx.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sub-tab 2: Invoices */}
            {activeSubTab === 'invoices' && (
              <div className="space-y-2">
                {walletInvoices.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No linked advance invoices found.
                  </p>
                ) : (
                  walletInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-800 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          {inv.invoice_id}
                        </span>
                        <span className="font-bold text-slate-900">
                          {inv.total_amount.toFixed(2)} SAR
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Units Added: {inv.quantity.toLocaleString()}</span>
                        <span>VAT (15%): +{inv.vat_amount.toFixed(2)} SAR</span>
                      </div>
                      <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-1 flex justify-between">
                        <span>Approved by: {inv.approved_by || 'Auto'}</span>
                        <span>{inv.created_at}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">Property ID: {wallet.property_id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
