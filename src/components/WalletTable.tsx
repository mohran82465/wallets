import React from 'react';
import { Wallet, WalletType } from '../types/wallet';
import { Language, TRANSLATIONS } from '../utils/translations';
import { PlusCircle, ExternalLink, Zap, AlertCircle } from 'lucide-react';

interface WalletTableProps {
  wallets: Wallet[];
  type: WalletType;
  lang: Language;
  onSelectWallet: (wallet: Wallet) => void;
  onTopUpWallet: (wallet: Wallet) => void;
  onSimulateWallet?: (wallet: Wallet) => void;
}

export const WalletTable: React.FC<WalletTableProps> = ({
  wallets,
  type,
  lang,
  onSelectWallet,
  onTopUpWallet,
  onSimulateWallet,
}) => {
  const t = TRANSLATIONS[lang];

  const getStatusBadge = (status: Wallet['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#137333]">
            {t.active}
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fce8e6] text-[#c5221f]">
            {t.suspended}
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e8eaed] text-[#5f6368]">
            {t.closed}
          </span>
        );
      default:
        return null;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatTokens = (tokens?: number) => {
    if (!tokens) return '0';
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
    return tokens.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#edf2f7] text-slate-600 font-medium text-xs border-b border-slate-200 select-none">
              <th className="py-3 px-4 w-32">{t.wallet_code}</th>
              <th className="py-3 px-4">{t.operator}</th>
              <th className="py-3 px-4">{t.property}</th>
              <th className="py-3 px-4 w-28 text-center">{t.status}</th>

              {type === 'shomoos' ? (
                <>
                  <th className="py-3 px-4 text-right w-28">{t.successful}</th>
                  <th className="py-3 px-4 text-right w-24">{t.failed}</th>
                  <th className="py-3 px-4 text-right w-28">{t.available}</th>
                  <th className="py-3 px-4 text-right w-36">{t.balance_sar}</th>
                </>
              ) : type === 'claude' ? (
                <>
                  <th className="py-3 px-4 text-right w-28">{t.successful}</th>
                  <th className="py-3 px-4 text-right w-20">{t.failed}</th>
                  <th className="py-3 px-4 text-right w-32">{t.est_captures_left}</th>
                  <th className="py-3 px-4 text-right w-28">{t.avg_cost_capture}</th>
                  <th className="py-3 px-4 text-right w-28">{t.total_tokens}</th>
                  <th className="py-3 px-4 text-right w-36">{t.balance_sar}</th>
                </>
              ) : (
                /* Vercel Columns */
                <>
                  <th className="py-3 px-4 text-right w-28">Processed Reqs</th>
                  <th className="py-3 px-4 text-right w-20">Edge Errors</th>
                  <th className="py-3 px-4 text-right w-28">Est. Reqs Left</th>
                  <th className="py-3 px-4 text-right w-28">Bandwidth</th>
                  <th className="py-3 px-4 text-right w-28">Functions</th>
                  <th className="py-3 px-4 text-right w-36">{t.balance_sar}</th>
                </>
              )}

              <th className="py-3 px-4 text-center w-28">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {wallets.length === 0 ? (
              <tr>
                <td
                  colSpan={type === 'shomoos' ? 9 : 11}
                  className="py-12 text-center text-slate-400 text-sm"
                >
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  No wallets found matching your filter criteria.
                </td>
              </tr>
            ) : (
              wallets.map((wallet) => (
                <tr
                  key={wallet.wallet_code + wallet.property_id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Wallet Code */}
                  <td className="py-3.5 px-4 font-medium">
                    <button
                      onClick={() => onSelectWallet(wallet)}
                      className="text-[#147d6f] hover:text-[#0b4d44] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{wallet.wallet_code}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                    </button>
                  </td>

                  {/* Operator */}
                  <td className="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                    {wallet.operator}
                  </td>

                  {/* Property */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {wallet.property_name}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(wallet.status)}
                  </td>

                  {/* Shomoos columns */}
                  {type === 'shomoos' ? (
                    <>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-800 font-medium">
                        {formatNumber(wallet.success)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-500">
                        {formatNumber(wallet.failed)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-900 font-semibold">
                        {formatNumber(wallet.available)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <span className="font-bold text-slate-900">
                          {formatNumber(wallet.balance)}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500 font-medium">SAR</span>
                      </td>
                    </>
                  ) : type === 'claude' ? (
                    /* Claude columns */
                    <>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-800 font-medium">
                        {formatNumber(wallet.success)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-500">
                        {formatNumber(wallet.failed)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-900 font-semibold">
                        {formatNumber(wallet.available)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-600">
                        {wallet.average_cost_per_capture?.toFixed(2)} SAR
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-600 font-mono text-xs">
                        {formatTokens(wallet.total_tokens)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <span className="font-bold text-slate-900">
                          {formatNumber(wallet.balance)}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500 font-medium">SAR</span>
                      </td>
                    </>
                  ) : (
                    /* Vercel columns */
                    <>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-800 font-medium">
                        {formatNumber(wallet.edge_requests || wallet.success * 100)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-500">
                        {formatNumber(wallet.failed)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-900 font-semibold">
                        {formatNumber(wallet.available)}k reqs
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-600 font-medium">
                        {wallet.bandwidth_gb?.toFixed(1) || '0.0'} GB
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-600 font-mono text-xs">
                        {formatTokens(wallet.function_invocations)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <span className="font-bold text-slate-900">
                          {formatNumber(wallet.balance)}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500 font-medium">SAR</span>
                      </td>
                    </>
                  )}

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => onTopUpWallet(wallet)}
                        className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                        title={t.top_up_btn}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span>
            Showing <strong className="text-slate-700">{wallets.length}</strong> wallets
          </span>
          <span className="text-slate-300">|</span>
          <span>
            Total Active Submissions/Captures Available:{' '}
            <strong className="text-slate-800">
              {formatNumber(wallets.reduce((acc, w) => acc + w.available, 0))}
            </strong>
          </span>
        </div>
        <div>
          Total VAT-Exclusive Portfolio Balance:{' '}
          <strong className="text-emerald-700 font-bold">
            {formatNumber(wallets.reduce((acc, w) => acc + w.balance, 0))} SAR
          </strong>
        </div>
      </div>
    </div>
  );
};
