import React, { useState } from 'react';
import { Wallet, Transaction, TopUpAudit } from '../types/wallet';
import { Language } from '../utils/translations';
import { X, RotateCcw, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  selectedWallet?: Wallet | null;
  selectedTransaction?: Transaction | null;
  lang: Language;
  onConfirmAdjustment: (
    updatedWallet: Wallet,
    newTransaction: Transaction,
    newAudit: TopUpAudit
  ) => void;
}

export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
  isOpen,
  onClose,
  wallets,
  selectedWallet,
  selectedTransaction,
  lang,
  onConfirmAdjustment,
}) => {
  const [walletCode, setWalletCode] = useState(
    selectedWallet?.wallet_code || selectedTransaction?.wallet_code || wallets[0]?.wallet_code || ''
  );
  const [adjustmentType, setAdjustmentType] = useState<'REVERSAL' | 'REFUND'>('REVERSAL');
  const [reversalTxnId, setReversalTxnId] = useState(
    selectedTransaction?.transaction_number || 'SHT-2026-0009842'
  );
  const [amount, setAmount] = useState<number>(1.0);
  const [reason, setReason] = useState<string>(
    'Duplicate Elm submission due to guest terminal retry - authorized reversal'
  );
  const [approvedBy, setApprovedBy] = useState<string>('Tareq Mansoor (Finance Controller)');

  if (!isOpen) return null;

  const currentWallet =
    wallets.find((w) => w.wallet_code === walletCode) || selectedWallet || wallets[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWallet) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);

    const creditNoteId =
      adjustmentType === 'REFUND' ? `CRN-2026-00${randomSuffix}` : undefined;
    const reversalId =
      adjustmentType === 'REVERSAL' ? reversalTxnId : undefined;

    const txnPrefix = currentWallet.type === 'shomoos' ? 'SHT' : 'CLT';
    const newTxn: Transaction = {
      id: `tx-adj-${Date.now()}`,
      wallet_code: currentWallet.wallet_code,
      wallet_type: currentWallet.type,
      property_name: currentWallet.property_name,
      operator: currentWallet.operator,
      transaction_number: `${txnPrefix}-2026-000${randomSuffix}`,
      transaction_at: formattedDate,
      transaction_type: adjustmentType,
      amount: amount, // Positive reimbursement to wallet balance
      status: 'POSTED',
      unit_price: currentWallet.unit_price,
      mudabbir_reference: creditNoteId || reversalId || `ADJ-${randomSuffix}`,
      result: 'SUCCESS',
      fault_code: adjustmentType === 'REVERSAL' ? 'OPERATIONAL_REVERSAL' : undefined,
      fault_description: reason,
    };

    const newAudit: TopUpAudit = {
      id: `aud-adj-${Date.now()}`,
      wallet_code: currentWallet.wallet_code,
      wallet_type: currentWallet.type,
      property_name: currentWallet.property_name,
      invoice_id: creditNoteId || `REV-${randomSuffix}`,
      invoice_line_id: `LN-ADJ-01`,
      quantity: Math.max(1, Math.round(amount / currentWallet.unit_price)),
      unit_price: currentWallet.unit_price,
      subtotal: amount,
      vat_amount: Number((amount * 0.15).toFixed(2)),
      total_amount: Number((amount * 1.15).toFixed(2)),
      credit_note_id: creditNoteId,
      reversal_of_id: reversalId,
      reason: reason,
      approved_by: approvedBy,
      created_at: formattedDate,
      payment_method:
        adjustmentType === 'REVERSAL' ? 'Ledger Reversal' : 'Credit Note Refund',
    };

    const updatedWallet: Wallet = {
      ...currentWallet,
      balance: Number((currentWallet.balance + amount).toFixed(2)),
      available: currentWallet.available + Math.round(amount / currentWallet.unit_price),
      last_usage_at: formattedDate,
    };

    onConfirmAdjustment(updatedWallet, newTxn, newAudit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Financial Reversal & Credit Note Adjustment
              </h3>
              <p className="text-[11px] text-slate-500">
                Reverse an incorrect submission or issue credit note refund
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Wallet</label>
            <select
              value={walletCode}
              onChange={(e) => setWalletCode(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              {wallets.map((w) => (
                <option key={w.wallet_code + w.property_id} value={w.wallet_code}>
                  {w.wallet_code} - {w.property_name} ({w.operator})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdjustmentType('REVERSAL')}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                adjustmentType === 'REVERSAL'
                  ? 'border-purple-600 bg-purple-50 text-purple-950 ring-1 ring-purple-500'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <RotateCcw className="w-4 h-4 mt-0.5 text-purple-600" />
              <div>
                <p className="font-bold">REVERSAL</p>
                <p className="text-[10px] text-slate-500">
                  Undo a specific erroneous transaction number
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAdjustmentType('REFUND')}
              className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                adjustmentType === 'REFUND'
                  ? 'border-amber-600 bg-amber-50 text-amber-950 ring-1 ring-amber-500'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Receipt className="w-4 h-4 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold">REFUND (Credit Note)</p>
                <p className="text-[10px] text-slate-500">
                  Generate credit note with formal ZATCA refund ref
                </p>
              </div>
            </button>
          </div>

          {adjustmentType === 'REVERSAL' ? (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Reversed Transaction ID (reversal_of_id)
              </label>
              <input
                type="text"
                value={reversalTxnId}
                onChange={(e) => setReversalTxnId(e.target.value)}
                placeholder="e.g. SHT-2026-0009842"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                required
              />
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Refund / Reversal Amount (SAR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Approved By</label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Audit Reason</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Post Adjustment to Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
