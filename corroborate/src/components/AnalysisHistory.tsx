import React, { useState } from 'react';
import { AnalysisHistoryItem } from '../types';

interface AnalysisHistoryProps {
  history: AnalysisHistoryItem[];
  onSelectHistoryItem: (item: AnalysisHistoryItem) => void;
  onDeleteHistoryItem?: (id: string) => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'conflicts' | 'verified'>('all');

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'conflicts' && item.hasConflicts) ||
      (statusFilter === 'verified' && !item.hasConflicts);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 md:p-12 max-w-[1000px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0b1c30]">Analysis History</h2>
          <p className="text-sm text-[#45464d] mt-1">Review and resume past verification sessions.</p>
        </div>
        <div className="font-mono-data text-xs text-[#76777d] bg-white border border-[#c6c6cd] px-3 py-1.5 rounded-full shadow-2xs self-start sm:self-auto">
          {history.length} Sessions Recorded
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Q&amp;A history..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#c6c6cd] rounded-lg text-sm text-[#0b1c30] placeholder-[#808488] focus:outline-none focus:border-[#0051d5] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#0b1c30] text-white shadow-xs'
                : 'bg-white text-[#45464d] border border-[#c6c6cd] hover:bg-[#eff4ff]'
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setStatusFilter('conflicts')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              statusFilter === 'conflicts'
                ? 'bg-[#BE123C] text-white shadow-xs'
                : 'bg-white text-[#BE123C] border border-[#c6c6cd] hover:bg-[#fff1f2]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            Conflicts Found
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              statusFilter === 'verified'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'bg-white text-[#059669] border border-[#c6c6cd] hover:bg-[#ecfdf5]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            Verified
          </button>
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#76777d] mb-2">
              manage_search
            </span>
            <h4 className="text-sm font-semibold text-[#0b1c30]">No matching research sessions</h4>
            <p className="text-xs text-[#45464d] mt-1">Try adjusting your search query or filter criteria.</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistoryItem(item)}
              className="bg-white border border-[#c6c6cd] rounded-lg p-5 transition-all hover:shadow-md hover:border-l-[3px] hover:border-l-[#0051d5] hover:-ml-[1px] cursor-pointer relative group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-mono-data text-xs text-[#76777d]">{item.formattedDate}</span>
                {item.hasConflicts ? (
                  <span className="self-start sm:self-auto bg-[#fff1f2] border border-[#BE123C]/30 text-[#BE123C] px-2.5 py-0.5 rounded text-xs font-mono-data font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Conflicts Found
                  </span>
                ) : (
                  <span className="self-start sm:self-auto bg-[#ecfdf5] border border-[#059669]/30 text-[#059669] px-2.5 py-0.5 rounded text-xs font-mono-data font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Verified
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-[#0b1c30] mt-2.5 mb-1.5 group-hover:text-[#0051d5] transition-colors">
                {item.query}
              </h3>

              <p className="text-sm text-[#45464d] line-clamp-2 leading-relaxed mb-4">{item.summary}</p>

              <div className="flex items-center justify-between pt-2 border-t border-[#c6c6cd]/40">
                <span className="bg-[#e5eeff] text-[#003ea8] px-2 py-0.5 rounded text-xs font-mono-data font-medium">
                  {item.documentCount} {item.documentCount === 1 ? 'Document' : 'Documents'}
                </span>

                <div className="text-xs font-semibold text-[#0051d5] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Resume Analysis</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
