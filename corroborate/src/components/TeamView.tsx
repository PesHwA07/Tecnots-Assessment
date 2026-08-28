import React, { useState } from 'react';
import { TeamAnnotation } from '../types';

interface TeamViewProps {
  annotations: TeamAnnotation[];
  onAddAnnotation: (targetRef: string, comment: string) => void;
  onToggleStatus: (id: string) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({
  annotations,
  onAddAnnotation,
  onToggleStatus,
}) => {
  const [newComment, setNewComment] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('Conflict: Cure Periods');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddAnnotation(selectedTarget, newComment.trim());
    setNewComment('');
  };

  return (
    <div className="p-8 md:p-12 max-w-[1000px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0b1c30]">Team Verification &amp; Annotations</h2>
          <p className="text-sm text-[#45464d] mt-1">
            Collaborative review logs, citation audits, and resolution sign-offs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzrpku5fw78xfdFVzEIFG7yFGvtr9gXSrJLW8PMM_uOwNPDPGDdO0ABfTUQDmh3VZYpKuLP7oX9FfXmS6zgOeNMfQQl34hvfyG_pbEXbKdalHvcuwuoWqOaw5olKAlQlgsAeZfzc8amXvVvK2PtgdprrMaHenXheBED4Q5dmoAbxuMh0VmYqYNaz_cBbogVDAbZOZUT30u8L_Ve6QAoZFBxJ9vXdYmmLgNioZ7-ScMQZS1DEv9fpgyeA"
              alt="Elena"
            />
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLD55c5SPLWPi2a_Fmx2vW89f1bkDFfyJn2rs59P2Q2z9QI13ohqAq62P30Qj5fXXliUZh267kBuZVjyE0gK8DtbF94YZOcYTux32eHrVczuSpW71MxtqnX2iwf1lzxHsSK4eMjJnerrcMrjPSuhcOTnHREuTY5_1Fn9ZIYkAJDzec2G6RlvphmDH5u9lObNHYDh2VZ78sD0_AL6Zg0PehQgUaOGjyrwrxPZ89WyXLHx06yu7s0FxpXQ"
              alt="Marcus"
            />
            <div className="h-8 w-8 rounded-full bg-[#0b1c30] text-white flex items-center justify-center text-xs font-semibold ring-2 ring-white">
              +3
            </div>
          </div>
        </div>
      </div>

      {/* Add New Annotation Card */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 mb-8 shadow-xs">
        <h3 className="text-sm font-semibold text-[#0b1c30] mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#0051d5]">add_comment</span>
          Add Verification Note to Citation or Conflict
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="bg-[#f8f9ff] border border-[#c6c6cd] rounded-lg px-3 py-1.5 text-xs text-[#0b1c30] focus:outline-none focus:border-[#0051d5]"
            >
              <option value="Conflict: Cure Periods">Conflict: Cure Periods (Acme vs TechFlow)</option>
              <option value="Conflict: Q3 Revenue">Conflict: Q3 Revenue ($14.2M vs $16.8M)</option>
              <option value="Citation: Acme MSA §4.2">Citation: Acme MSA §4.2</option>
              <option value="Citation: Vendor Security Addendum Art 4">
                Citation: Vendor Security Addendum Art 4
              </option>
            </select>
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write an internal review note, legal interpretation, or audit finding..."
            rows={2}
            className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-lg p-3 text-xs text-[#0b1c30] focus:outline-none focus:border-[#0051d5] placeholder-[#808488]"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="bg-[#0051d5] text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-[#003ea8] transition-colors disabled:opacity-40"
            >
              Post Annotation
            </button>
          </div>
        </form>
      </div>

      {/* Annotations List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[#76777d] uppercase tracking-wider">
          Active Collaboration Log ({annotations.length})
        </h3>
        {annotations.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
              ann.status === 'resolved'
                ? 'border-[#c6c6cd]/60 opacity-80'
                : 'border-[#c6c6cd] hover:border-[#0051d5]'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <img
                  src={ann.avatar}
                  alt={ann.author}
                  className="w-9 h-9 rounded-full object-cover border border-[#c6c6cd]/80"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#0b1c30]">{ann.author}</span>
                    <span className="text-[11px] text-[#45464d] bg-[#f8f9ff] px-2 py-0.5 rounded border border-[#c6c6cd]/50">
                      {ann.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono-data text-[#76777d] mt-0.5">
                    <span>{ann.timestamp}</span>
                    <span>•</span>
                    <span className="text-[#0051d5] font-medium">{ann.targetRef}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onToggleStatus(ann.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono-data font-semibold flex items-center gap-1 transition-colors ${
                  ann.status === 'resolved'
                    ? 'bg-[#ecfdf5] text-[#059669] border border-[#059669]/30'
                    : 'bg-[#f8f9ff] text-[#45464d] border border-[#c6c6cd] hover:bg-[#eff4ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {ann.status === 'resolved' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {ann.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
              </button>
            </div>

            <p className="text-sm text-[#0b1c30] mt-3 pl-12 leading-relaxed">{ann.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
