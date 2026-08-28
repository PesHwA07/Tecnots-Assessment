import React from 'react';
import { MainNavTab } from '../types';

interface SideNavBarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onNewAnalysis: () => void;
  onOpenSystemStatus: () => void;
  onOpenHelpCenter: () => void;
  conflictCount?: number;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentTab,
  onSelectTab,
  onNewAnalysis,
  onOpenSystemStatus,
  onOpenHelpCenter,
  conflictCount = 2,
}) => {
  return (
    <nav className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-[#c6c6cd]/60 flex flex-col py-6 z-50 select-none shadow-sm">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <img
          alt="Corroborate Logo"
          className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-[#c6c6cd]/50"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeO6CMRx5pjVn4ewhJS04Od9zt0SNfHjJfl9ypi9klSLJywXXk3jN1C7M2vlatne51WK6q13HPJHQKrK23UZaeXLNMmVoGW58T7kIS9GJ8goPPXwDD7fioPrSnrEZDtv0Mf9RxIY34rfaITEJn5IB_1Yn56rwDmwsE590lcOUUEE5bO0Dyh_kO664hV1A0KmQLnVJPfz6MhL85fguGo3hCwA17veqERfBCnXlqIWHbOFcXu3XwgllneA"
        />
        <div>
          <h1 className="text-xl font-bold text-[#0b1c30] leading-none tracking-tight">Corroborate</h1>
          <p className="text-xs text-[#45464d] leading-none mt-1 font-normal">AI Research Assistant</p>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="px-6 mb-6">
        <button
          onClick={onNewAnalysis}
          className="w-full bg-[#0b1c30] text-white py-2 px-4 rounded hover:bg-[#1f2d42] transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Analysis
        </button>
      </div>

      {/* Navigation Links */}
      <ul className="flex-1 px-3 space-y-1 overflow-y-auto">
        <li>
          <button
            onClick={() => onSelectTab('research-hub')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors ${
              currentTab === 'research-hub'
                ? 'text-[#0051d5] font-bold border-l-2 border-[#0051d5] bg-[#eff4ff]'
                : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  currentTab === 'research-hub' ? 'fill-icon text-[#0051d5]' : 'text-[#45464d]'
                }`}
              >
                clinical_notes
              </span>
              <span className="text-sm">Research Hub</span>
            </div>
          </button>
        </li>

        <li>
          <button
            onClick={() => onSelectTab('document-library')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors ${
              currentTab === 'document-library'
                ? 'text-[#0051d5] font-bold border-l-2 border-[#0051d5] bg-[#eff4ff]'
                : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  currentTab === 'document-library' ? 'fill-icon text-[#0051d5]' : 'text-[#45464d]'
                }`}
              >
                folder_managed
              </span>
              <span className="text-sm">Document Library</span>
            </div>
          </button>
        </li>

        <li>
          <button
            onClick={() => onSelectTab('analysis-history')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors ${
              currentTab === 'analysis-history'
                ? 'text-[#0051d5] font-bold border-l-2 border-[#0051d5] bg-[#eff4ff]'
                : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  currentTab === 'analysis-history' ? 'fill-icon text-[#0051d5]' : 'text-[#45464d]'
                }`}
              >
                history
              </span>
              <span className="text-sm">Analysis History</span>
            </div>
          </button>
        </li>

        <li>
          <button
            onClick={() => onSelectTab('conflict-reports')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors ${
              currentTab === 'conflict-reports'
                ? 'text-[#0051d5] font-bold border-l-2 border-[#0051d5] bg-[#eff4ff]'
                : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  currentTab === 'conflict-reports' ? 'fill-icon text-[#0051d5]' : 'text-[#45464d]'
                }`}
              >
                rule
              </span>
              <span className="text-sm">Conflict Reports</span>
            </div>
            {conflictCount > 0 && (
              <span className="bg-[#fff1f2] text-[#BE123C] text-[10px] font-mono-data font-semibold px-1.5 py-0.5 rounded border border-[#BE123C]/30">
                {conflictCount}
              </span>
            )}
          </button>
        </li>

        <li>
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors ${
              currentTab === 'settings'
                ? 'text-[#0051d5] font-bold border-l-2 border-[#0051d5] bg-[#eff4ff]'
                : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  currentTab === 'settings' ? 'fill-icon text-[#0051d5]' : 'text-[#45464d]'
                }`}
              >
                settings
              </span>
              <span className="text-sm">Settings</span>
            </div>
          </button>
        </li>
      </ul>

      {/* Footer System Status & Help Links */}
      <div className="px-3 mt-auto border-t border-[#c6c6cd]/50 pt-3">
        <ul className="space-y-1">
          <li>
            <button
              onClick={onOpenSystemStatus}
              className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-[#eff4ff] transition-colors text-[#45464d] hover:text-[#0b1c30] text-left text-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-[#059669]">check_circle</span>
              <span>System Status</span>
            </button>
          </li>
          <li>
            <button
              onClick={onOpenHelpCenter}
              className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-[#eff4ff] transition-colors text-[#45464d] hover:text-[#0b1c30] text-left text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
              <span>Help Center</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};
