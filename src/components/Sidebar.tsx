import React, { useState } from 'react';
import {
  Home,
  Calendar,
  Clock,
  Wallet as WalletIcon,
  Users,
  Package,
  FileEdit,
  ClipboardList,
  MessageSquare,
  ShoppingCart,
  BarChart3,
  Moon,
  Briefcase,
  Landmark,
  ChevronDown,
  ChevronRight,
  Search,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from 'lucide-react';
import { WalletType } from '../types/wallet';
import { Language, TRANSLATIONS } from '../utils/translations';

interface SidebarProps {
  currentWalletType: WalletType;
  onSelectWalletType: (type: WalletType) => void;
  lang: Language;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentWalletType,
  onSelectWalletType,
  lang,
  collapsed,
  onToggleCollapse,
}) => {
  const [walletsOpen, setWalletsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const t = TRANSLATIONS[lang];

  return (
    <aside
      className={`bg-[#0b3824] text-white flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out border-r border-[#082a1b] z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#144932]">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            {/* Custom Mudabbir 8-pointed star icon */}
            <div className="w-8 h-8 rounded-lg bg-[#144932] flex items-center justify-center text-[#5ce1a6]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="w-5 h-5"
              >
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[17px] tracking-tight leading-tight text-white">
                {t.brand_name}
              </span>
              <span className="text-[10px] text-[#93c7af] font-medium tracking-wide">
                {t.by_durrat}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-lg bg-[#144932] flex items-center justify-center text-[#5ce1a6]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="w-5 h-5"
            >
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
            </svg>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="text-[#93c7af] hover:text-white p-1 rounded-md hover:bg-[#144932] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu Search */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#76a590]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search_menu}
              className="w-full bg-[#082b1c] text-white text-xs pl-8 pr-3 py-2 rounded-lg border border-[#144932] placeholder-[#76a590] focus:outline-none focus:border-[#5ce1a6] transition-colors"
            />
          </div>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 text-sm font-normal">
        {/* Dashboard */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <Home className="w-4 h-4 text-[#89b9a4]" />
          {!collapsed && <span>{t.dashboard}</span>}
        </div>

        {/* Reservations */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <Calendar className="w-4 h-4 text-[#89b9a4]" />
          {!collapsed && <span>{t.reservations}</span>}
        </div>

        {/* Sales */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#89b9a4]" />
            {!collapsed && <span>{t.sales}</span>}
          </div>
          {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#76a590]" />}
        </div>

        {/* Wallets Accordion (Active Section) */}
        <div className="pt-1">
          <button
            onClick={() => setWalletsOpen(!walletsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white bg-[#194a37] font-medium transition-colors"
          >
            <div className="flex items-center gap-3">
              <WalletIcon className="w-4 h-4 text-[#5ce1a6]" />
              {!collapsed && <span>{t.wallets}</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#93c7af] transition-transform duration-200 ${
                  walletsOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {/* Submenu for Wallets */}
          {walletsOpen && !collapsed && (
            <div className="mt-1 space-y-1 pl-7 pr-1">
              <button
                onClick={() => onSelectWalletType('shomoos')}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
                  currentWalletType === 'shomoos'
                    ? 'bg-[#22664b] text-white shadow-sm ring-1 ring-[#3ca87e]'
                    : 'text-[#a2cfbc] hover:text-white hover:bg-[#144932]/60'
                }`}
              >
                <span>{t.shomoos_wallets}</span>
                {currentWalletType === 'shomoos' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5ce1a6]"></span>
                )}
              </button>

              <button
                onClick={() => onSelectWalletType('claude')}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
                  currentWalletType === 'claude'
                    ? 'bg-[#22664b] text-white shadow-sm ring-1 ring-[#3ca87e]'
                    : 'text-[#a2cfbc] hover:text-white hover:bg-[#144932]/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.claude_wallets}</span>
                </div>
                {currentWalletType === 'claude' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5ce1a6]"></span>
                )}
              </button>

            
            </div>
          )}
        </div>

        {/* Profiles */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-[#89b9a4]" />
            {!collapsed && <span>{t.profiles}</span>}
          </div>
          {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#76a590]" />}
        </div>

        {/* Products */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-[#89b9a4]" />
            {!collapsed && <span>{t.products}</span>}
          </div>
          {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#76a590]" />}
        </div>

        {/* Procurement */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <FileEdit className="w-4 h-4 text-[#89b9a4]" />
            {!collapsed && <span>{t.procurement}</span>}
          </div>
          {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#76a590]" />}
        </div>

        {/* Task Manager */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-4 h-4 text-[#89b9a4]" />
            {!collapsed && <span>{t.task_manager}</span>}
          </div>
          {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#76a590]" />}
        </div>

        {/* Chats */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <MessageSquare className="w-4 h-4 text-[#89b9a4]" />
          {!collapsed && <span>{t.chats}</span>}
        </div>

        {/* POS */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-4 h-4 text-[#89b9a4]" />
            {!collapsed && <span>{t.pos}</span>}
          </div>
          {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#76a590]" />}
        </div>

        {/* Inventory */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-4 h-4 text-[#89b9a4]" />
            {!collapsed && <span>{t.inventory}</span>}
          </div>
          {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#76a590]" />}
        </div>

        {/* Night Audit */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <Moon className="w-4 h-4 text-[#89b9a4]" />
          {!collapsed && <span>{t.night_audit}</span>}
        </div>

        {/* Human Resources */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-[#89b9a4]" />
            {!collapsed && <span>{t.human_resources}</span>}
          </div>
          {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#76a590]" />}
        </div>

        {/* Accounting */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-[#b8d8cb] hover:text-white hover:bg-[#144932]/70 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Landmark className="w-4 h-4 text-[#89b9a4]" />
            {!collapsed && <span>{t.accounting}</span>}
          </div>
          {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-[#76a590]" />}
        </div>
      </div>

      {/* Footer Info / Version */}
      {!collapsed && (
        <div className="p-3 border-t border-[#144932] text-[11px] text-[#76a590] flex items-center justify-between">
          <span>Mudabbir PMS v3.4.1</span>
          <span className="flex items-center gap-1 text-[#5ce1a6]">
            <span className="w-2 h-2 rounded-full bg-[#5ce1a6] animate-pulse"></span>
            Elm Live
          </span>
        </div>
      )}
    </aside>
  );
};
