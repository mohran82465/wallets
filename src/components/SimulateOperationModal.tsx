import React, { useState } from 'react';
import { Wallet, Transaction, DocumentType, ShomoosOperation } from '../types/wallet';
import { Language, TRANSLATIONS } from '../utils/translations';
import {
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Scan,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  User,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface SimulateOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  selectedWalletCode?: string;
  lang: Language;
  onExecuteSimulation: (
    updatedWallet: Wallet,
    newTransaction: Transaction,
    isSuccess: boolean
  ) => void;
}

export const SimulateOperationModal: React.FC<SimulateOperationModalProps> = ({
  isOpen,
  onClose,
  wallets,
  selectedWalletCode,
  lang,
  onExecuteSimulation,
}) => {
  const t = TRANSLATIONS[lang];
  const [walletCode, setWalletCode] = useState<string>(
    selectedWalletCode || (wallets[0] ? wallets[0].wallet_code : '')
  );

  const currentWallet = wallets.find((w) => w.wallet_code === walletCode) || wallets[0];
  const isShomoos = currentWallet?.type === 'shomoos';

  // Shomoos form state
  const [shomoosOp, setShomoosOp] = useState<ShomoosOperation>('GUEST_REGISTRATION');
  const [guestName, setGuestName] = useState('Mansoor Khalid Al-Harbi');
  const [guestId, setGuestId] = useState('1098442190');
  const [reservationRef, setReservationRef] = useState('RES-2026-99388');

  // Claude form state
  const [docType, setDocType] = useState<DocumentType>('NATIONAL_ID');
  const [scannedBy, setScannedBy] = useState('Saeed Al-Ghamdi (Front Desk)');

  // Simulation execution settings
  const [simulateOutcome, setSimulateOutcome] = useState<'SUCCESS' | 'FAILED'>('SUCCESS');
  const [faultType, setFaultType] = useState<string>('ERR_404_CIVIL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    message: string;
    txnNumber: string;
    guidance?: string;
  } | null>(null);

  if (!isOpen || !currentWallet) return null;

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setExecutionResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      const isSuccess = simulateOutcome === 'SUCCESS';
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const now = new Date();
      const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);

      let newTxn: Transaction;
      let updatedWallet: Wallet;

      if (isShomoos) {
        const txnNum = `SHT-2026-000${randomSuffix}`;
        const cost = isSuccess ? currentWallet.unit_price : 0; // Unbilled monitoring if failed

        newTxn = {
          id: `tx-sim-${Date.now()}`,
          wallet_code: currentWallet.wallet_code,
          wallet_type: 'shomoos',
          property_name: currentWallet.property_name,
          operator: currentWallet.operator,
          transaction_number: txnNum,
          transaction_at: formattedDate,
          transaction_type: 'USAGE',
          amount: isSuccess ? -cost : 0,
          status: isSuccess ? 'POSTED' : 'NOT_POSTED',
          unit_price: currentWallet.unit_price,
          mudabbir_reference: reservationRef,
          shomoos_operation: shomoosOp,
          shomoos_reference: isSuccess ? `ELM-SHM-${randomSuffix * 2}` : `ELM-ERR-${randomSuffix}`,
          result: isSuccess ? 'SUCCESS' : 'FAILED',
          fault_code: isSuccess
            ? undefined
            : faultType === 'ERR_404_CIVIL'
            ? 'ERR_404_CIVIL_RECORD'
            : 'ERR_500_ELM_TIMEOUT',
          fault_description: isSuccess
            ? undefined
            : faultType === 'ERR_404_CIVIL'
            ? 'Guest National ID not recognized in Elm NIC gateway. Staff should verify digit entry.'
            : 'Elm security gateway timeout during encrypted payload transfer.',
        };

        updatedWallet = {
          ...currentWallet,
          balance: isSuccess ? Math.max(0, currentWallet.balance - cost) : currentWallet.balance,
          available: isSuccess
            ? Math.max(0, currentWallet.available - 1)
            : currentWallet.available,
          success: isSuccess ? currentWallet.success + 1 : currentWallet.success,
          failed: isSuccess ? currentWallet.failed : currentWallet.failed + 1,
          last_usage_at: formattedDate,
        };

        setExecutionResult({
          success: isSuccess,
          message: isSuccess
            ? `Shomoos Elm Accepted (201 Created). Reference: ${newTxn.shomoos_reference}`
            : `Elm Submission Rejected: ${newTxn.fault_description}`,
          txnNumber: txnNum,
        });
      } else if (currentWallet.type === 'claude') {
        // Claude ID Capture
        const txnNum = `CLT-2026-000${randomSuffix}`;
        const cost = isSuccess ? currentWallet.average_cost_per_capture || 0.42 : 0;
        const inputTokens = isSuccess ? 1420 : 1100;
        const outputTokens = isSuccess ? 380 : 95;
        const totalTokens = inputTokens + outputTokens;

        const failureGuidance =
          'Severe glare or angle distortion detected across document MRZ optical zone. Please place card flat under diffused light and retake.';

        newTxn = {
          id: `tx-sim-${Date.now()}`,
          wallet_code: currentWallet.wallet_code,
          wallet_type: 'claude',
          property_name: currentWallet.property_name,
          operator: currentWallet.operator,
          transaction_number: txnNum,
          transaction_at: formattedDate,
          transaction_type: 'USAGE',
          amount: isSuccess ? -cost : 0,
          status: isSuccess ? 'POSTED' : 'NOT_POSTED',
          unit_price: cost,
          mudabbir_reference: reservationRef,
          document_type: docType,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: totalTokens,
          result: isSuccess ? 'SUCCESS' : 'FAILED',
          failure_reason: isSuccess ? undefined : failureGuidance,
          captured_by: scannedBy,
          acknowledged_at: formattedDate,
          api_request_id: `req_01QxK${randomSuffix}AbC`,
        };

        updatedWallet = {
          ...currentWallet,
          balance: isSuccess
            ? Math.max(0, Number((currentWallet.balance - cost).toFixed(2)))
            : currentWallet.balance,
          available: isSuccess
            ? Math.max(0, currentWallet.available - 1)
            : currentWallet.available,
          success: isSuccess ? currentWallet.success + 1 : currentWallet.success,
          failed: isSuccess ? currentWallet.failed : currentWallet.failed + 1,
          total_tokens: (currentWallet.total_tokens || 0) + totalTokens,
          last_usage_at: formattedDate,
        };

        setExecutionResult({
          success: isSuccess,
          message: isSuccess
            ? `Claude ID Scan Validated! Extracted ${docType} fields with 1,800 tokens.`
            : 'Claude OCR Extraction Failed due to document glare.',
          txnNumber: txnNum,
          guidance: isSuccess ? undefined : failureGuidance,
        });
      } else {
        // Vercel Edge Simulation
        const txnNum = `VCT-2026-000${randomSuffix}`;
        const cost = isSuccess ? 0.15 : 0;
        const bandwidthMb = isSuccess ? 340 : 15;

        newTxn = {
          id: `tx-sim-${Date.now()}`,
          wallet_code: currentWallet.wallet_code,
          wallet_type: 'vercel',
          property_name: currentWallet.property_name,
          operator: currentWallet.operator,
          transaction_number: txnNum,
          transaction_at: formattedDate,
          transaction_type: 'USAGE',
          amount: isSuccess ? -cost : 0,
          status: isSuccess ? 'POSTED' : 'NOT_POSTED',
          unit_price: currentWallet.unit_price,
          mudabbir_reference: 'PORTAL-GUEST-TEST',
          vercel_service: 'GUEST_PORTAL',
          deployment_id: `dpl_${randomSuffix}xx99`,
          bandwidth_mb: bandwidthMb,
          region: 'me-central-1 (Dammam Edge)',
          result: isSuccess ? 'SUCCESS' : 'FAILED',
        };

        updatedWallet = {
          ...currentWallet,
          balance: isSuccess
            ? Math.max(0, Number((currentWallet.balance - cost).toFixed(2)))
            : currentWallet.balance,
          available: isSuccess
            ? Math.max(0, currentWallet.available - 1)
            : currentWallet.available,
          success: isSuccess ? currentWallet.success + 1 : currentWallet.success,
          failed: isSuccess ? currentWallet.failed : currentWallet.failed + 1,
          bandwidth_gb: Number(((currentWallet.bandwidth_gb || 0) + bandwidthMb / 1024).toFixed(2)),
          last_usage_at: formattedDate,
        };

        setExecutionResult({
          success: isSuccess,
          message: isSuccess
            ? `Vercel Edge Request Deployed! Served 340 MB fast data via me-central-1 edge node.`
            : 'Vercel Edge function execution timeout (504 Gateway Timeout).',
          txnNumber: txnNum,
        });
      }

      onExecuteSimulation(updatedWallet, newTxn, isSuccess);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live Operational Simulator ({isShomoos ? 'Shomoos Elm' : 'Claude ID Capture'})
              </h3>
              <p className="text-[11px] text-slate-500">
                Simulate real check-in payloads, balance deduction & fault audits
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

        {/* Form Body */}
        <form onSubmit={handleRunSimulation} className="p-5 space-y-4 text-xs">
          {/* Wallet Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Wallet</label>
            <select
              value={walletCode}
              onChange={(e) => {
                setWalletCode(e.target.value);
                setExecutionResult(null);
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-blue-600"
            >
              {wallets.map((w) => (
                <option key={w.wallet_code + w.property_id} value={w.wallet_code}>
                  {w.wallet_code} - {w.property_name} ({w.type === 'shomoos' ? 'Shomoos' : 'Claude'})
                  • Avail: {w.available}
                </option>
              ))}
            </select>
          </div>

          {/* Shomoos Configuration */}
          {isShomoos ? (
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Shomoos Elm Submission Payload
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-0.5">Operation Type</label>
                  <select
                    value={shomoosOp}
                    onChange={(e) => setShomoosOp(e.target.value as ShomoosOperation)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="GUEST_REGISTRATION">GUEST_REGISTRATION (Check-In)</option>
                    <option value="GUEST_CHECKOUT">GUEST_CHECKOUT</option>
                    <option value="VISITOR_PASS">VISITOR_PASS</option>
                    <option value="EXTEND_STAY">EXTEND_STAY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-0.5">Reservation Ref</label>
                  <input
                    type="text"
                    value={reservationRef}
                    onChange={(e) => setReservationRef(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-0.5">Guest National ID / Iqama</label>
                  <input
                    type="text"
                    value={guestId}
                    onChange={(e) => setGuestId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-0.5">Guest Full Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Claude ID Capture Configuration */
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Claude OCR Scan Parameters
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-0.5">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentType)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="NATIONAL_ID">Saudi National ID (الهوية الوطنية)</option>
                    <option value="IQAMA">Saudi Iqama Resident (الإقامة)</option>
                    <option value="PASSPORT">International Passport</option>
                    <option value="GCC_ID">GCC Identity Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-0.5">Scanned By Operator</label>
                  <input
                    type="text"
                    value={scannedBy}
                    onChange={(e) => setScannedBy(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Visual simulated document card */}
              <div className="p-3 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl text-white shadow-inner flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">
                    Kingdom of Saudi Arabia • {docType}
                  </div>
                  <div className="font-mono text-xs tracking-widest text-emerald-100">
                    ID: 1098 4421 90
                  </div>
                  <div className="text-[11px] font-medium text-white">{guestName}</div>
                </div>
                <div className="w-12 h-14 bg-white/10 rounded-md border border-white/20 flex items-center justify-center text-white/50">
                  <User className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Outcome Choice (Success or Failure simulation) */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Test Outcome Scenario</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSimulateOutcome('SUCCESS')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                  simulateOutcome === 'SUCCESS'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 ${
                    simulateOutcome === 'SUCCESS' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <div>
                  <p className="font-bold">Simulate SUCCESS</p>
                  <p className="text-[10px] text-slate-500">
                    Valid API payload. Balance decremented by unit cost.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSimulateOutcome('FAILED')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                  simulateOutcome === 'FAILED'
                    ? 'border-red-600 bg-red-50 text-red-950 ring-1 ring-red-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 mt-0.5 ${
                    simulateOutcome === 'FAILED' ? 'text-red-600' : 'text-slate-400'
                  }`}
                />
                <div>
                  <p className="font-bold">Simulate FAILED</p>
                  <p className="text-[10px] text-slate-500">
                    Unbilled monitoring. Staff failure guidance triggered.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* If failed, choose fault type */}
          {simulateOutcome === 'FAILED' && isShomoos && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Elm Fault Code</label>
              <select
                value={faultType}
                onChange={(e) => setFaultType(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="ERR_404_CIVIL">
                  ERR_404_CIVIL_RECORD (National ID not found in Elm NIC)
                </option>
                <option value="ERR_500_TIMEOUT">
                  ERR_500_ELM_TIMEOUT (Gateway handshake failure)
                </option>
              </select>
            </div>
          )}

          {/* Feedback message banner */}
          {executionResult && (
            <div
              className={`p-3 rounded-xl border ${
                executionResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {executionResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span>{executionResult.txnNumber}</span>
              </div>
              <p className="text-[11px] mt-1">{executionResult.message}</p>
              {executionResult.guidance && (
                <div className="mt-1.5 p-2 bg-white/70 rounded border border-red-200 text-[10px] font-medium text-red-800">
                  ⚠️ Staff Action: {executionResult.guidance}
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Gateway...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Execute Test Operation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
