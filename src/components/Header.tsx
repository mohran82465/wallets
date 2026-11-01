import React, { useState } from 'react';
import {
  Zap,
  Globe,
  MessageSquare,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Scan,
  ShieldCheck,
  ChevronDown,
  X,
  PlusCircle,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenQuickTopUp: () => void;
  onOpenSimulation: () => void;
  onOpenAuditTab: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  onOpenQuickTopUp,
  onOpenSimulation,
  onOpenAuditTab,
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showVercelSetup, setShowVercelSetup] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const t = TRANSLATIONS[lang];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left side empty or search indicator */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Elm & Claude OCR Active</span>
        </div>

        {/* Vercel Status Badge Button */}
        <button
          onClick={() => setShowVercelSetup(true)}
          className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/90 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ring-1 ring-slate-200"
          title="Click to view Vercel deployment setup & CLI status"
        >
          <svg className="w-3 h-3 fill-current text-black" viewBox="0 0 24 24">
            <path d="M24 22.525H0l12-21.05 12 21.05z" />
          </svg>
          <span>Vercel Deploy Ready</span>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Quick Actions Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{t.quick_actions}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Quick Actions Dropdown */}
          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Operational Actions</span>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenQuickTopUp();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-medium">Top-Up Operational Wallet</p>
                    <p className="text-[10px] text-slate-400">Advance tax invoice & VAT</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenSimulation();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <Scan className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-medium">Test Live Shomoos / Claude Scan</p>
                    <p className="text-[10px] text-slate-400">Elm gateway & OCR extractor</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenAuditTab();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-medium">Financial & Tax Audit Log</p>
                    <p className="text-[10px] text-slate-400">Invoices, Credit notes & Approvals</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher Pill */}
        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs text-xs font-medium">
          <button
            onClick={() => lang !== 'en' && onToggleLang()}
            className={`px-2.5 py-1.5 flex items-center gap-1 transition-colors ${
              lang === 'en'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-3 h-3 text-slate-400" />
            <span>EN</span>
          </button>
          <div className="w-[1px] h-4 bg-slate-200" />
          <button
            onClick={() => lang !== 'ar' && onToggleLang()}
            className={`px-2.5 py-1.5 flex items-center gap-1 transition-colors ${
              lang === 'ar'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-3 h-3 text-slate-400" />
            <span>عربي</span>
          </button>
        </div>

        {/* Chat icon */}
        <button
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
          title="Mudabbir Internal Staff Chat"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Notification Bell with 99+ Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white">
              99+
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Wallet Alerts & Activity</h4>
                  <p className="text-[11px] text-slate-400">99+ unread notifications</p>
                </div>
                <span className="text-[11px] text-emerald-600 font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                <div className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      Low Balance Alert: Mada Al Khobar Residence
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Claude wallet balance is below threshold (72.00 SAR remaining).
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">15 mins ago</span>
                  </div>
                </div>

                <div className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      Top-Up Successful: Durrat Dammam Suites
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      +5,000 SAR credit added via Invoice INV-2026-08891.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago</span>
                  </div>
                </div>

                <div className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      Elm Shomoos Gateway Heartbeat OK
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Average response latency 140ms across all 7 properties.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Today 08:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 leading-tight">SAEED</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider">
                {t.owner}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0b3824] text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20">
              S
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">Saeed Al-Ghamdi</p>
                <p className="text-[11px] text-slate-400">Executive Hospitality Owner</p>
                <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                  Durrat Hospitality Portfolio
                </p>
              </div>
              <div className="p-1 text-xs text-slate-700">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-md"
                >
                  Manage Portfolio
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-md"
                >
                  Billing & Tax Invoices
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-md text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vercel Setup & Deployment Modal */}
      {showVercelSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black border border-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M24 22.525H0l12-21.05 12 21.05z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    Vercel Setup & Deployment
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Configured
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Production configuration & CLI deployment ready
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVercelSetup(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              {/* Checklist */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Vercel Setup Checklist
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>vercel.json created with SPA rewrites & asset caching headers</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>vercel CLI installed in devDependencies (^65.9.0)</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>@vercel/analytics package installed & mounted in main.tsx</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>NPM scripts configured: "vercel-build", "deploy", "deploy:preview"</span>
                  </div>
                </div>
              </div>

              {/* Deployment Commands */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-800">Deployment Commands</span>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-900 text-slate-100 rounded-xl flex items-center justify-between border border-slate-800">
                    <div>
                      <span className="text-slate-500"># Deploy to Production</span>
                      <p className="text-emerald-400 font-bold">npx vercel --prod</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard('npx vercel --prod', 'prod')}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-sans font-medium transition-colors"
                    >
                      {copiedCmd === 'prod' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-900 text-slate-100 rounded-xl flex items-center justify-between border border-slate-800">
                    <div>
                      <span className="text-slate-500"># Deploy to Preview</span>
                      <p className="text-blue-400 font-bold">npx vercel</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard('npx vercel', 'preview')}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-sans font-medium transition-colors"
                    >
                      {copiedCmd === 'preview' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* GitHub / Git Integration Note */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <span>Git Integration (Recommended)</span>
                </span>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  Import this repository into your Vercel Dashboard (vercel.com/new). Vercel will automatically detect Vite, use <code className="font-mono bg-blue-100 px-1 rounded">npm run build</code>, and deploy on every git push.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowVercelSetup(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
