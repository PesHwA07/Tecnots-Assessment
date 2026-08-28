import React, { useState } from 'react';
import { MainNavTab, TopSubTab } from '../types';

interface TopAppBarProps {
  currentMainTab: MainNavTab;
  currentSubTab: TopSubTab;
  onSelectSubTab: (tab: TopSubTab) => void;
  onOpenUpload: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  showSearch?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentMainTab,
  currentSubTab,
  onSelectSubTab,
  onOpenUpload,
  searchQuery = '',
  onSearchChange,
  showSearch = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-[#f8f9ff] border-b border-[#c6c6cd]/50 flex items-center justify-between px-6 h-16 flex-shrink-0">
      {/* Left: Section Context & Sub-navigation Tabs */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-4">
          <span className="font-semibold text-lg text-[#0b1c30]">
            {currentMainTab === 'research-hub' && 'Analysis Hub'}
            {currentMainTab === 'document-library' && 'Document Library'}
            {currentMainTab === 'conflict-reports' && 'Conflict Inspector'}
            {currentMainTab === 'analysis-history' && 'Analysis History'}
            {currentMainTab === 'settings' && 'Workspace Settings'}
          </span>
          <div className="h-4 w-px bg-[#c6c6cd]/60"></div>
        </div>

        <nav className="flex items-center gap-2 md:gap-4 h-full">
          <button
            onClick={() => onSelectSubTab('active-files')}
            className={`px-3 py-5 text-sm font-medium transition-all relative ${
              currentSubTab === 'active-files'
                ? 'text-[#0051d5] font-semibold'
                : 'text-[#45464d] hover:text-[#0051d5]'
            }`}
          >
            Active Files
            {currentSubTab === 'active-files' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0051d5]"></span>
            )}
          </button>

          <button
            onClick={() => onSelectSubTab('source-inspector')}
            className={`px-3 py-5 text-sm font-medium transition-all relative ${
              currentSubTab === 'source-inspector'
                ? 'text-[#0051d5] font-semibold'
                : 'text-[#45464d] hover:text-[#0051d5]'
            }`}
          >
            Source Inspector
            {currentSubTab === 'source-inspector' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0051d5]"></span>
            )}
          </button>

        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {showSearch && onSearchChange && (
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search references..."
              className="pl-9 pr-3 py-1.5 bg-white border border-[#c6c6cd] rounded-full text-xs font-normal focus:outline-none focus:border-[#0051d5] w-56 text-[#0b1c30] shadow-sm"
            />
          </div>
        )}

        <button
          onClick={onOpenUpload}
          className="bg-[#0b1c30] text-white hover:bg-[#1f2d42] px-3.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          Upload Document
        </button>

        <div className="h-5 w-px bg-[#c6c6cd]/60 mx-1 hidden sm:block"></div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-[#45464d] hover:text-[#0051d5] hover:bg-[#e5eeff] rounded-full transition-colors relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#BE123C] rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-[#c6c6cd] p-3 z-50 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-[#c6c6cd]/50 mb-2">
                <span className="font-semibold text-xs text-[#0b1c30]">Recent Verification Alerts</span>
                <span className="text-[10px] text-[#0051d5] font-mono-data cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-[#fff1f2] border-l-2 border-[#BE123C] rounded text-xs">
                  <div className="font-medium text-[#BE123C] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Conflict in Q3 Revenue
                  </div>
                  <p className="text-[#45464d] text-[11px] mt-0.5">
                    $2.6M mismatch between Internal Audit & Shareholder Report.
                  </p>
                </div>
                <div className="p-2 bg-[#f8f9ff] border border-[#c6c6cd]/50 rounded text-xs">
                  <div className="font-medium text-[#059669] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Vendor Security Addendum Indexed
                  </div>
                  <p className="text-[#45464d] text-[11px] mt-0.5">
                    Article 4 verified with 100% clause consistency.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Share Button */}
        <div className="relative">
          <button
            onClick={() => setShowShareModal(!showShareModal)}
            className="p-1.5 text-[#45464d] hover:text-[#0051d5] hover:bg-[#e5eeff] rounded-full transition-colors"
            title="Share Research Session"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>

          {showShareModal && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-[#c6c6cd] p-3.5 z-50 text-left">
              <div className="font-semibold text-xs text-[#0b1c30] mb-1">Share Verification Workspace</div>
              <p className="text-[#45464d] text-[11px] mb-3">
                Team members can inspect citations, verify reasoning, and view indexed sources.
              </p>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="bg-[#f8f9ff] border border-[#c6c6cd] rounded px-2 py-1 text-[11px] font-mono-data text-[#45464d] flex-1 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-[#0051d5] text-white text-xs px-2.5 py-1 rounded hover:bg-[#003ea8] transition-colors whitespace-nowrap"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full overflow-hidden border border-[#c6c6cd] hover:ring-2 hover:ring-[#0051d5] transition-all flex items-center justify-center bg-[#131b2e] text-white ml-1 cursor-pointer"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzrpku5fw78xfdFVzEIFG7yFGvtr9gXSrJLW8PMM_uOwNPDPGDdO0ABfTUQDmh3VZYpKuLP7oX9FfXmS6zgOeNMfQQl34hvfyG_pbEXbKdalHvcuwuoWqOaw5olKAlQlgsAeZfzc8amXvVvK2PtgdprrMaHenXheBED4Q5dmoAbxuMh0VmYqYNaz_cBbogVDAbZOZUT30u8L_Ve6QAoZFBxJ9vXdYmmLgNioZ7-ScMQZS1DEv9fpgyeA"
              alt="Researcher Avatar"
              className="w-full h-full object-cover"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#c6c6cd] p-3 z-50 text-left">
              <div className="font-semibold text-xs text-[#0b1c30]">Dr. Elena Rostova</div>
              <div className="text-[11px] text-[#45464d]">Senior Legal Research Fellow</div>
              <div className="text-[10px] font-mono-data text-[#059669] mt-0.5">Workspace: Corp-Legal-Tier-1</div>
              <div className="border-t border-[#c6c6cd]/50 my-2 pt-1 text-xs space-y-1.5">
                <div className="text-[#45464d] hover:text-[#0051d5] cursor-pointer py-0.5">Audit Log</div>
                <div className="text-[#45464d] hover:text-[#0051d5] cursor-pointer py-0.5">Export Reports (PDF/JSON)</div>
                <div className="text-[#BE123C] hover:underline cursor-pointer py-0.5">Switch Workspace</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
