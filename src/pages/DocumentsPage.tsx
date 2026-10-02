import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { DocumentCategory, DocumentItem } from '../types';
import { getDocuments, uploadDocument } from '../lib/db';
import { canUploadDocument } from '../lib/permissions';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { FileText, Search, Upload, ArrowLeft } from 'lucide-react';

interface DocumentsPageProps {
  onNavigate: (path: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onNavigate }) => {
  const { profile, role, cluster } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load documents (strictly permission-aware database query)
  const documents = getDocuments(profile, role, {
    category: selectedCategory,
    search: searchTerm,
  });

  const handleUpload = async (data: {
    title: string;
    description?: string;
    category: DocumentCategory;
    fileName: string;
    fileSize: number;
    mimeType: string;
    visibility: 'public' | 'members' | 'coordinators' | 'admins';
  }) => {
    if (!profile) return;
    await uploadDocument(data, profile, role);
    setRefreshKey((k) => k + 1);
  };

  const categories: string[] = [
    'all',
    'Cluster Resources',
    'Activity Resources',
    'Training Materials',
    'Guidelines',
    'Forms',
    'Reports',
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6" key={refreshKey}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-950 mb-2 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
            Approved Document Repository
          </h1>
          <p className="text-xs text-slate-600">
            Official educational curriculum, training materials, guidelines, and forms for {cluster?.name || 'Kimana Cluster'}.
          </p>
        </div>

        {canUploadDocument(role) && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 transition"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-700/60" />
            <input
              type="text"
              placeholder="Search documents by title, description, or filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-emerald-900/5 pt-2 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-emerald-900/5 text-emerald-900 hover:bg-emerald-900/10'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-emerald-800 font-mono tabular-nums whitespace-nowrap pl-2">
            {documents.length} authorized {documents.length === 1 ? 'file' : 'files'}
          </span>
        </div>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center space-y-2">
          <FileText className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">No documents found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No approved documents match your search. Protected documents outside your clearance level are not shown.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onRefresh={() => setRefreshKey((k) => k + 1)}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};
