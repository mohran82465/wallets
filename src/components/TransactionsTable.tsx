import React, { useState } from 'react';
import { Transaction, WalletType } from '../types/wallet';
import { Language, TRANSLATIONS } from '../utils/translations';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Receipt,
  Eye,
  X,
  FileCode,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  walletType: WalletType;
  lang: Language;
  onInitiateReversal?: (txn: Transaction) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  walletType,
  lang,
  onInitiateReversal,
}) => {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<string>('ALL');
  const [inspectTxn, setInspectTxn] = useState<Transaction | null>(null);

  // Filter logic
  const filtered = transactions.filter((txn) => {
    if (txn.wallet_type !== walletType) return false;
    if (selectedType !== 'ALL' && txn.transaction_type !== selectedType) return false;
    if (selectedResult !== 'ALL' && txn.result !== selectedResult) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        txn.transaction_number.toLowerCase().includes(q) ||
        txn.wallet_code.toLowerCase().includes(q) ||
        txn.mudabbir_reference.toLowerCase().includes(q) ||
        txn.property_name.toLowerCase().includes(q) ||
        (txn.shomoos_reference && txn.shomoos_reference.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getMovementBadge = (type: Transaction['transaction_type']) => {
    switch (type) {
      case 'TOP_UP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <ArrowDownLeft className="w-3 h-3" />
            TOP UP
          </span>
        );
      case 'USAGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <ArrowUpRight className="w-3 h-3" />
            USAGE
          </span>
        );
      case 'REVERSAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <RotateCcw className="w-3 h-3" />
            REVERSAL
          </span>
        );
      case 'REFUND':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Receipt className="w-3 h-3" />
            REFUND
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            ADJUSTMENT
          </span>
        );
      default:
        return null;
    }
  };

  const getResultBadge = (txn: Transaction) => {
    if (txn.result === 'SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          SUCCESS {txn.wallet_type === 'shomoos' ? '(201)' : ''}
        </span>
      );
    }
    if (txn.result === 'FAILED') {
      return (
        <button
          onClick={() => setInspectTxn(txn)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
          title="Click to view failure details & staff guidance"
        >
          <XCircle className="w-3 h-3 text-red-600" />
          FAILED {txn.fault_code ? `(${txn.fault_code})` : ''}
        </button>
      );
    }
    return <span className="text-xs text-slate-400">—</span>;
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Txn code, Mudabbir ref, Elm ID, or property..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Movement Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="ALL">All Movement Types</option>
            <option value="USAGE">USAGE (Debits)</option>
            <option value="TOP_UP">TOP_UP (Credits)</option>
            <option value="REVERSAL">REVERSAL</option>
            <option value="REFUND">REFUND</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
          </select>

          {/* Result Filter */}
          <select
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="ALL">All Status Results</option>
            <option value="SUCCESS">Success Only</option>
            <option value="FAILED">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#edf2f7] text-slate-600 font-medium text-xs border-b border-slate-200 select-none">
                <th className="py-3 px-4 w-40">{t.txn_code}</th>
                <th className="py-3 px-4 w-40">{t.date_time}</th>
                <th className="py-3 px-4 w-28">{t.movement_type}</th>
                <th className="py-3 px-4">{t.operation_doc}</th>
                <th className="py-3 px-4 w-32">{t.result}</th>
                <th className="py-3 px-4 text-right w-32">{t.amount}</th>
                <th className="py-3 px-4 w-44">{t.references}</th>
                <th className="py-3 px-4 text-center w-20">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    No transactions found for the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Txn Code */}
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-800">
                      <div>{txn.transaction_number}</div>
                      <span className="text-[10px] text-slate-400 font-sans">
                        {txn.wallet_code}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{txn.transaction_at.split(' ')[0]}</div>
                      <span className="text-[11px] text-slate-400">
                        {txn.transaction_at.split(' ')[1]}
                      </span>
                    </td>

                    {/* Movement Type */}
                    <td className="py-3.5 px-4">{getMovementBadge(txn.transaction_type)}</td>

                    {/* Operation / Doc */}
                    <td className="py-3.5 px-4 text-xs">
                      {walletType === 'shomoos' ? (
                        <div>
                          <span className="font-semibold text-slate-800">
                            {txn.shomoos_operation?.replace('_', ' ') || 'CREDIT LOAD'}
                          </span>
                          <div className="text-[11px] text-slate-500">{txn.property_name}</div>
                        </div>
                      ) : walletType === 'claude' ? (
                        <div>
                          <span className="font-semibold text-slate-800">
                            {txn.document_type || 'BALANCE MOVEMENT'}
                          </span>
                          {txn.total_tokens ? (
                            <div className="text-[11px] text-slate-500 font-mono">
                              {txn.input_tokens} in / {txn.output_tokens} out (
                              {txn.total_tokens.toLocaleString()} tok)
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500">{txn.property_name}</div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="font-semibold text-slate-800">
                            {txn.vercel_service?.replace(/_/g, ' ') || 'EDGE BANDWIDTH USAGE'}
                          </span>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {txn.bandwidth_mb ? `${txn.bandwidth_mb} MB transfer` : txn.property_name}
                            {txn.region && ` • ${txn.region}`}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Result */}
                    <td className="py-3.5 px-4">{getResultBadge(txn)}</td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <span
                        className={`font-bold text-xs ${
                          txn.amount > 0
                            ? 'text-emerald-700'
                            : txn.amount < 0
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {txn.amount > 0 ? `+${txn.amount.toFixed(2)}` : txn.amount.toFixed(2)} SAR
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {txn.status === 'POSTED' ? 'Posted' : txn.status}
                      </div>
                    </td>

                    {/* References */}
                    <td className="py-3.5 px-4 text-xs font-mono">
                      <div className="text-slate-700 flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">Mudabbir:</span>
                        <span className="font-semibold">{txn.mudabbir_reference}</span>
                      </div>
                      {txn.shomoos_reference && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          Elm: {txn.shomoos_reference}
                        </div>
                      )}
                      {txn.api_request_id && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          Req: {txn.api_request_id}
                        </div>
                      )}
                    </td>

                    {/* Audit view */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setInspectTxn(txn)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        title="View Full Transaction Audit"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Inspector Modal */}
      {inspectTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Transaction Audit: {inspectTxn.transaction_number}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {inspectTxn.property_name} • {inspectTxn.wallet_code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectTxn(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs">
              {/* Highlight summary */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">
                    Movement Type
                  </span>
                  <div className="mt-1">{getMovementBadge(inspectTxn.transaction_type)}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">
                    Amount & Status
                  </span>
                  <p className="mt-1 font-bold text-slate-900 text-sm">
                    {inspectTxn.amount.toFixed(2)} SAR (VAT-Excl)
                  </p>
                  <span className="text-[10px] text-slate-500">Status: {inspectTxn.status}</span>
                </div>
              </div>

              {/* Shomoos specific details */}
              {inspectTxn.wallet_type === 'shomoos' && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <h4 className="font-semibold text-slate-800">Shomoos Integration Audit</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Operation Type:</span>
                      <strong className="text-slate-800">{inspectTxn.shomoos_operation}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Elm Shomoos Txn ID:</span>
                      <span className="font-mono">{inspectTxn.shomoos_reference || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Mudabbir Ref:</span>
                      <span className="font-mono">{inspectTxn.mudabbir_reference}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Unit Price Snapshot:</span>
                      <span>{inspectTxn.unit_price.toFixed(2)} SAR</span>
                    </div>
                  </div>

                  {inspectTxn.result === 'FAILED' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 mt-2">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>Elm Gateway Fault: {inspectTxn.fault_code}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-red-700">
                        {inspectTxn.fault_description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Claude ID Capture specific details */}
              {inspectTxn.wallet_type === 'claude' && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <h4 className="font-semibold text-slate-800">Claude OCR & Token Audit</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Document Type:</span>
                      <strong className="text-slate-800">{inspectTxn.document_type || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">API Request ID:</span>
                      <span className="font-mono text-[11px]">
                        {inspectTxn.api_request_id || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Token Breakdown:</span>
                      <span className="font-mono">
                        {inspectTxn.input_tokens || 0} in + {inspectTxn.output_tokens || 0} out ={' '}
                        {inspectTxn.total_tokens || 0} total
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Captured By Staff:</span>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{inspectTxn.captured_by || 'Staff Terminal'}</span>
                      </div>
                    </div>
                  </div>

                  {inspectTxn.result === 'FAILED' && inspectTxn.failure_reason && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 mt-2">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Staff Guidance (Action Required):</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        {inspectTxn.failure_reason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Vercel specific details */}
              {inspectTxn.wallet_type === 'vercel' && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-current text-slate-900" viewBox="0 0 24 24">
                      <path d="M24 22.525H0l12-21.05 12 21.05z" />
                    </svg>
                    <span>Vercel Edge & Cloud Deployment Audit</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Service Module:</span>
                      <strong className="text-slate-800">{inspectTxn.vercel_service || 'Edge Fast Data'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Deployment ID:</span>
                      <span className="font-mono text-[11px] text-blue-700">
                        {inspectTxn.deployment_id || 'dpl_live_auto'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Bandwidth Transfer:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {inspectTxn.bandwidth_mb ? `${inspectTxn.bandwidth_mb} MB` : '150 MB'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Edge Node Region:</span>
                      <span className="text-slate-700">{inspectTxn.region || 'me-central-1 (Saudi Edge)'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamp and Audit details */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Logged at {inspectTxn.transaction_at}</span>
                </div>
                <span>Server Node: riyadh-elm-proxy-01</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              {onInitiateReversal && inspectTxn.transaction_type === 'USAGE' ? (
                <button
                  onClick={() => {
                    const t = inspectTxn;
                    setInspectTxn(null);
                    onInitiateReversal(t);
                  }}
                  className="px-3 py-1.5 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium transition-colors"
                >
                  Initiate Reversal
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setInspectTxn(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
