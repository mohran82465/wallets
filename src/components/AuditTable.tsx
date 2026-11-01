import React, { useState } from 'react';
import { TopUpAudit } from '../types/wallet';
import { Language } from '../utils/translations';
import {
  FileText,
  FileCheck2,
  Receipt,
  Download,
  Search,
  CheckCircle2,
  CreditCard,
  UserCheck,
} from 'lucide-react';

interface AuditTableProps {
  auditLogs: TopUpAudit[];
  lang: Language;
}

export const AuditTable: React.FC<AuditTableProps> = ({ auditLogs, lang }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      log.invoice_id.toLowerCase().includes(q) ||
      log.property_name.toLowerCase().includes(q) ||
      log.wallet_code.toLowerCase().includes(q) ||
      (log.approved_by && log.approved_by.toLowerCase().includes(q))
    );
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            Financial Top-Up & Tax Audit Trail
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ZATCA-compliant advance payment invoices, 15% VAT breakdown, and authorized credit notes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoice ID, property..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <button
            onClick={() => {
              // Simulated export
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                'Invoice ID,Wallet Code,Property,Units,Unit Price,Subtotal (SAR),VAT 15% (SAR),Total (SAR),Approved By,Date\n' +
                auditLogs
                  .map(
                    (l) =>
                      `"${l.invoice_id}","${l.wallet_code}","${l.property_name}",${l.quantity},${l.unit_price},${l.subtotal},${l.vat_amount},${l.total_amount},"${l.approved_by || ''}","${l.created_at}"`
                  )
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', 'mudabbir_wallet_financial_audit.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#edf2f7] text-slate-600 font-medium text-xs border-b border-slate-200 select-none">
                <th className="py-3 px-4 w-40">Tax Invoice / Credit Note</th>
                <th className="py-3 px-4 w-32">Wallet & Property</th>
                <th className="py-3 px-4 text-right w-28">Units Added</th>
                <th className="py-3 px-4 text-right w-24">Unit Price</th>
                <th className="py-3 px-4 text-right w-32">Subtotal (SAR)</th>
                <th className="py-3 px-4 text-right w-28">VAT 15%</th>
                <th className="py-3 px-4 text-right w-36">Total (SAR)</th>
                <th className="py-3 px-4 w-48">Approval & Notes</th>
                <th className="py-3 px-4 w-36">Payment / Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No financial audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Invoice ID */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-800 flex items-center gap-1.5">
                        {log.credit_note_id ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                            CREDIT NOTE
                          </span>
                        ) : (
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>{log.invoice_id}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Line: {log.invoice_line_id}
                      </span>
                    </td>

                    {/* Property */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{log.wallet_code}</div>
                      <div className="text-[11px] text-slate-500">{log.property_name}</div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 text-right font-medium text-slate-800 tabular-nums">
                      {log.quantity.toLocaleString()}
                    </td>

                    {/* Unit Price */}
                    <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                      {log.unit_price.toFixed(2)} SAR
                    </td>

                    {/* Subtotal */}
                    <td className="py-3 px-4 text-right font-medium text-slate-800 tabular-nums">
                      {formatNumber(log.subtotal)}
                    </td>

                    {/* VAT */}
                    <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                      +{formatNumber(log.vat_amount)}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                      {formatNumber(log.total_amount)} SAR
                    </td>

                    {/* Approver & Reason */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{log.approved_by || 'Auto-Provisioned'}</span>
                      </div>
                      {log.reason && (
                        <p className="text-[10px] text-amber-700 mt-0.5 italic">{log.reason}</p>
                      )}
                      {log.reversal_of_id && (
                        <p className="text-[10px] text-purple-700 font-mono mt-0.5">
                          Reversal of: {log.reversal_of_id}
                        </p>
                      )}
                    </td>

                    {/* Payment & Date */}
                    <td className="py-3 px-4 text-slate-600">
                      <div className="text-[11px] font-medium text-slate-800">
                        {log.payment_method}
                      </div>
                      <span className="text-[10px] text-slate-400">{log.created_at}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
