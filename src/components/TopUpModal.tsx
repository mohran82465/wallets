import React, { useState } from 'react';
import { Wallet, TopUpAudit, Transaction } from '../types/wallet';
import { Language, TRANSLATIONS } from '../utils/translations';
import {
  X,
  CreditCard,
  PlusCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  selectedWalletCode?: string;
  lang: Language;
  onConfirmTopUp: (audit: TopUpAudit, transaction: Transaction) => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  wallets,
  selectedWalletCode,
  lang,
  onConfirmTopUp,
}) => {
  const t = TRANSLATIONS[lang];
  const [walletCode, setWalletCode] = useState<string>(
    selectedWalletCode || (wallets[0] ? wallets[0].wallet_code : '')
  );
  const [quantity, setQuantity] = useState<number>(2500);

  // Card Payment States
  const [cardHolder, setCardHolder] = useState<string>('Saeed Al-Ghamdi');
  const [cardNumber, setCardNumber] = useState<string>('4282 3400 9812 7741');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvc, setCardCvc] = useState<string>('842');
  const [approver, setApprover] = useState<string>('Saeed Al-Ghamdi (Owner)');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentWallet = wallets.find((w) => w.wallet_code === walletCode) || wallets[0];
  const unitPrice = currentWallet ? currentWallet.unit_price : 1.0;
  const subtotal = quantity * unitPrice;
  const vatAmount = subtotal * 0.15; // 15% ZATCA VAT in Saudi Arabia
  const totalAmount = subtotal + vatAmount;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvc(raw);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWallet) return;

    setIsProcessing(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `INV-2026-0${randomSuffix}`;
    const invoiceLineId = `${invoiceId}-LN-01`;
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);

    const cleanCard = cardNumber.replace(/\s/g, '');
    const last4 = cleanCard.slice(-4) || '7741';
    const cardBrand = cleanCard.startsWith('4')
      ? 'mada / Visa'
      : cleanCard.startsWith('5')
      ? 'mada / Mastercard'
      : 'mada Corporate Card';

    const auditRecord: TopUpAudit = {
      id: `aud-${Date.now()}`,
      wallet_code: currentWallet.wallet_code,
      wallet_type: currentWallet.type,
      property_name: currentWallet.property_name,
      invoice_id: invoiceId,
      invoice_line_id: invoiceLineId,
      quantity,
      unit_price: unitPrice,
      subtotal,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      approved_by: approver,
      created_at: formattedDate,
      payment_method: `${cardBrand} (•••• ${last4})`,
    };

    const txnPrefix =
      currentWallet.type === 'shomoos' ? 'SHT' : currentWallet.type === 'claude' ? 'CLT' : 'VCT';
    const txnRecord: Transaction = {
      id: `tx-top-${Date.now()}`,
      wallet_code: currentWallet.wallet_code,
      wallet_type: currentWallet.type,
      property_name: currentWallet.property_name,
      operator: currentWallet.operator,
      transaction_number: `${txnPrefix}-2026-000${randomSuffix}`,
      transaction_at: formattedDate,
      transaction_type: 'TOP_UP',
      amount: subtotal, // VAT-exclusive amount added to operational balance
      status: 'POSTED',
      unit_price: unitPrice,
      mudabbir_reference: invoiceId,
      result: 'SUCCESS',
    };

    setTimeout(() => {
      onConfirmTopUp(auditRecord, txnRecord);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0b3824] text-emerald-300 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top-Up Operational Wallet</h3>
              <p className="text-[11px] text-slate-500">
                Advance prepaid balance with ZATCA tax invoice (15% VAT)
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

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">Payment Processed Successfully!</h4>
            <p className="text-xs text-slate-600">
              +{quantity.toLocaleString()} units credited to {currentWallet?.wallet_code} (
              {currentWallet?.property_name}). Tax Invoice generated and posted to audit ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleTopUpSubmit} className="p-5 space-y-4 text-xs">
            {/* Wallet Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Property Wallet</label>
              <select
                value={walletCode}
                onChange={(e) => setWalletCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-emerald-600"
              >
                {wallets.map((w) => (
                  <option key={w.wallet_code + w.property_id} value={w.wallet_code}>
                    {w.wallet_code} - {w.property_name} ({w.operator}) • Balance: {w.balance} SAR
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Selector */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  {currentWallet?.type === 'shomoos'
                    ? 'Submissions Quantity'
                    : 'Est. Capture Units'}
                </label>
                <span className="text-[11px] text-slate-500">
                  Current Unit Rate: <strong>{unitPrice.toFixed(2)} SAR</strong>
                </span>
              </div>
              <input
                type="number"
                min="100"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-emerald-600"
              />

              {/* Quick Preset Buttons */}
              <div className="flex gap-2 mt-2">
                {[1000, 2500, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                      quantity === preset
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial & Tax Breakdown Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Financial Breakdown (ZATCA Compliant)
              </span>

              <div className="flex justify-between text-slate-600">
                <span>Subtotal (VAT-Exclusive Added to Wallet):</span>
                <span className="font-semibold font-mono">{subtotal.toFixed(2)} SAR</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>VAT (15%):</span>
                <span className="font-semibold font-mono text-amber-700">
                  +{vatAmount.toFixed(2)} SAR
                </span>
              </div>

              <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center text-slate-900 font-bold">
                <span className="text-xs">Total Advance Payment Invoice:</span>
                <span className="text-sm font-mono text-emerald-800">
                  {totalAmount.toFixed(2)} SAR
                </span>
              </div>
            </div>

            {/* Card Payment Section (Replacing Payment Method Dropdown) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>Card Payment</span>
                </div>
                {/* Brand badges */}
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white tracking-wider text-[9px]">
                    mada
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-700 text-white tracking-wider text-[9px]">
                    VISA
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white tracking-wider text-[9px]">
                    Mastercard
                  </span>
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                  placeholder="e.g. Saeed Al-Ghamdi"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    required
                    placeholder="4282 3400 9812 7741"
                    maxLength={19}
                    className="w-full px-3 py-2 pr-10 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-xs tracking-wider focus:outline-none focus:border-emerald-600"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Expiry Date, CVV, and Approver */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Expires (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    required
                    placeholder="08/28"
                    maxLength={5}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-center text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center justify-between">
                    <span>CVV / CVC</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="password"
                    value={cardCvc}
                    onChange={handleCvcChange}
                    required
                    placeholder="•••"
                    maxLength={4}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-center text-xs font-bold tracking-widest focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Approved By
                  </label>
                  <input
                    type="text"
                    value={approver}
                    onChange={(e) => setApprover(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs truncate focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Security info note */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Encrypted 256-bit tokenized card payment via Saudi Payments (mada)</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2.5 bg-[#0b3824] hover:bg-[#124930] text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-75 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-emerald-300" />
                    <span>Pay {totalAmount.toFixed(2)} SAR & Top-Up</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
