import React, { useState, useRef } from 'react';
import { DocumentItem } from '../types';

interface DocumentLibraryProps {
  documents: DocumentItem[];
  onUploadFiles: (files: FileList | File[]) => void;
  onDeleteDocument: (docId: string) => void;
  onSelectDocument: (doc: DocumentItem) => void;
  onOpenUploadModal: () => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  onUploadFiles,
  onDeleteDocument,
  onSelectDocument,
  onOpenUploadModal,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(e.target.files);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'docx':
        return 'article';
      case 'txt':
        return 'text_snippet';
      case 'md':
        return 'description';
      default:
        return 'draft';
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-[1100px] mx-auto min-h-screen">
      {/* Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0b1c30]">Document Library</h2>
          <p className="text-sm text-[#45464d] mt-1">Manage and ingest source material for analysis.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#ecfdf5] border border-[#059669]/30 text-[#059669] px-3 py-1.5 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span className="font-mono-data text-xs font-semibold tracking-wider uppercase">Ready to Query</span>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center mb-10 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden group ${
          isDragOver
            ? 'border-[#0051d5] bg-[#eff4ff] ring-2 ring-[#0051d5]/20'
            : 'border-[#c6c6cd] hover:border-[#0051d5] hover:bg-[#eff4ff]/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md,.csv"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="w-16 h-16 bg-[#dce9ff] rounded-full flex items-center justify-center text-[#0051d5] mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
          <span className="material-symbols-outlined text-[32px]">upload_file</span>
        </div>

        <h3 className="text-lg font-semibold text-[#0b1c30] mb-2">Drag &amp; Drop Documents Here</h3>
        <p className="text-sm text-[#45464d] mb-6 max-w-md mx-auto leading-relaxed">
          Supports PDF, TXT, and Markdown files up to 50MB. Complex tables and vector graphics will be parsed automatically.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="bg-transparent border border-[#76777d] text-[#0b1c30] hover:bg-[#eff4ff] py-1.5 px-4 rounded transition-colors text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Files
          </button>
          <button
            type="button"
            className="bg-[#0051d5] text-white hover:bg-[#003ea8] py-1.5 px-4 rounded transition-colors text-sm font-medium flex items-center gap-1 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenUploadModal();
            }}
          >
            <span className="material-symbols-outlined text-[16px]">add_box</span>
            Import Samples
          </button>
        </div>
      </div>

      {/* Document Grid Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-[#0b1c30]">
          Indexed Documents ({documents.length})
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#76777d] text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter documents..."
              className="pl-8 pr-3 py-1 bg-white border border-[#c6c6cd] rounded text-xs text-[#0b1c30] focus:outline-none focus:border-[#0051d5] w-48"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-[#c6c6cd] rounded py-1 px-2 text-xs text-[#45464d] focus:outline-none focus:border-[#0051d5]"
          >
            <option value="all">All Formats</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
            <option value="md">Markdown</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const isError = doc.status === 'error';
          const isParsing = doc.status === 'parsing';
          const isIndexed = doc.status === 'indexed';

          return (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className={`bg-white rounded-lg p-4 border transition-all hover:shadow-sm relative overflow-hidden cursor-pointer group ${
                isError
                  ? 'border-l-4 border-l-[#BE123C] border-y-[#c6c6cd] border-r-[#c6c6cd] bg-[#fff1f2]/20'
                  : 'border-[#c6c6cd] hover:border-[#0051d5] hover:bg-[#f8f9ff]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Icon Container */}
                <div
                  className={`w-10 h-10 flex-shrink-0 rounded flex items-center justify-center ${
                    isError
                      ? 'bg-[#ffdad6] text-[#93000a]'
                      : 'bg-[#e5eeff] text-[#45464d] group-hover:text-[#0051d5]'
                  }`}
                >
                  <span className={`material-symbols-outlined ${isParsing ? 'animate-spin' : ''}`}>
                    {isError ? 'error' : isParsing ? 'sync' : getDocIcon(doc.type)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-[#0b1c30] truncate pr-6 group-hover:text-[#0051d5] transition-colors">
                      {doc.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {isIndexed && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                        <span className="font-mono-data text-xs text-[#45464d]">Indexed</span>
                        <span className="text-[#c6c6cd] text-xs">•</span>
                        <span className="font-mono-data text-xs text-[#45464d]">{doc.size}</span>
                      </>
                    )}

                    {isParsing && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse"></span>
                        <span className="font-mono-data text-xs text-[#45464d]">
                          {doc.statusText || 'Parsing Layout...'}
                        </span>
                        <span className="text-[#c6c6cd] text-xs">•</span>
                        <span className="font-mono-data text-xs text-[#45464d]">{doc.size}</span>
                      </>
                    )}

                    {isError && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#BE123C]"></span>
                        <span className="font-mono-data text-xs text-[#BE123C] font-medium">
                          {doc.statusText || 'OCR Failed - Unreadable Text'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(doc.id);
                  }}
                  className={`absolute top-3.5 right-3.5 p-1 rounded-full text-[#45464d] hover:text-[#BE123C] hover:bg-white shadow-sm border border-transparent hover:border-[#c6c6cd]/50 transition-all ${
                    isError ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="Remove document"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isParsing ? 'close' : 'delete'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
