export type WalletType = 'shomoos' | 'claude' | 'vercel';

export type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

export type TransactionType = 'TOP_UP' | 'USAGE' | 'REVERSAL' | 'REFUND' | 'ADJUSTMENT';

export type TransactionStatus = 'POSTED' | 'PENDING' | 'REVERSED' | 'NOT_POSTED';

export type ShomoosOperation = 'GUEST_REGISTRATION' | 'GUEST_CHECKOUT' | 'VISITOR_PASS' | 'EXTEND_STAY';

export type DocumentType = 'NATIONAL_ID' | 'IQAMA' | 'PASSPORT' | 'GCC_ID';

export type VercelServiceType = 'GUEST_PORTAL' | 'QR_MENU_EDGE' | 'SELF_CHECKIN_PWA' | 'ROOM_AUTOMATION_API';

export interface Wallet {
  wallet_code: string;
  type: WalletType;
  operator: string;
  property_id: string;
  property_name: string;
  status: WalletStatus;
  balance: number; // VAT-exclusive remaining balance in SAR
  unit_price: number; // Unit price in SAR
  available: number; // Shomoos: remaining transactions; Claude: est. captures left; Vercel: est. GB/requests left
  success: number;
  failed: number;
  // Claude specific
  total_tokens?: number;
  average_cost_per_capture?: number;
  // Vercel specific
  bandwidth_gb?: number;
  edge_requests?: number;
  function_invocations?: number;
  // Timestamps
  last_top_up_at: string;
  last_usage_at: string;
}

export interface Transaction {
  id: string;
  wallet_code: string;
  wallet_type: WalletType;
  property_name: string;
  operator: string;
  transaction_number: string;
  transaction_at: string;
  transaction_type: TransactionType;
  amount: number; // Signed VAT-exclusive SAR amount moved (positive for TOP_UP, negative for USAGE)
  status: TransactionStatus;
  unit_price: number;
  mudabbir_reference: string;

  // Shomoos specific
  shomoos_operation?: ShomoosOperation;
  shomoos_reference?: string;
  result?: 'SUCCESS' | 'FAILED';
  fault_code?: string;
  fault_description?: string;

  // Claude specific
  document_type?: DocumentType;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  failure_reason?: string;
  captured_by?: string;
  acknowledged_at?: string;
  api_request_id?: string;

  // Vercel specific
  vercel_service?: VercelServiceType;
  deployment_id?: string;
  bandwidth_mb?: number;
  region?: string;
}

export interface TopUpAudit {
  id: string;
  wallet_code: string;
  wallet_type: WalletType;
  property_name: string;
  invoice_id: string;
  invoice_line_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  vat_amount: number; // 15% VAT
  total_amount: number;
  credit_note_id?: string;
  reversal_of_id?: string;
  reason?: string;
  approved_by?: string;
  created_at: string;
  payment_method: string;
}
