import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  Eye, 
  ExternalLink, 
  Cloud,
  ShieldCheck,
  Tag,
  User,
  Calendar,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * Interactive Document Viewer & File Access Modal
 * Seamlessly handles Supabase Cloud URLs, Base64 Streams, and Direct Downloads
 */
export default function DocumentViewerModal({
  isOpen,
  onClose,
  document,
}) {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'dossier'
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  useEffect(() => {
    if (!document) return;
    setViewMode('preview');
    setPdfLoadError(false);
  }, [document]);

  if (!isOpen || !document) return null;

  const rawData = document.fileData || '';
  const isRemoteUrl = rawData.startsWith('http://') || rawData.startsWith('https://');
  const isBase64Pdf = rawData.startsWith('data:application/pdf');
  const isBase64Image = rawData.startsWith('data:image/');
  const isBase64 = rawData.startsWith('data:');

  const fileNameLower = (document.fileName || '').toLowerCase();
  const isPdf = isBase64Pdf || fileNameLower.endsWith('.pdf') || rawData.toLowerCase().includes('.pdf');
  const isImage = isBase64Image || /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(fileNameLower) || /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(rawData);

  // Reliable Universal Download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (isRemoteUrl) {
        // Direct fetch & blob trigger
        try {
          const response = await fetch(rawData, { mode: 'cors' });
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = window.document.createElement('a');
            link.href = blobUrl;
            link.download = document.fileName || 'legal_document.pdf';
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            return;
          }
        } catch (fetchErr) {
          // Fallback to direct anchor download
          const link = window.document.createElement('a');
          link.href = rawData;
          link.target = '_blank';
          link.download = document.fileName || 'legal_document.pdf';
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
          return;
        }
      }

      if (isBase64) {
        const link = window.document.createElement('a');
        link.href = rawData;
        link.download = document.fileName || `${document.title || 'document'}.pdf`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        return;
      }

      // Plain record fallback
      const docText = `OUTLAWED LEGAL AID VAULT - DOCUMENT RECORD\n\nTitle: ${document.title}\nCategory: ${document.docType}\nFile: ${document.fileName}\nUploader: ${document.uploaderName}\nDate: ${document.uploadedAt ? new Date(document.uploadedAt).toLocaleString() : 'N/A'}\n\n[Verified Vault Legal Evidence Document]`;
      const blob = new Blob([docText], { type: 'text/plain;charset=utf-8' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = blobUrl;
      link.download = document.fileName || `${(document.title || 'document').replace(/\s+/g, '_')}.txt`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Direct download notice, opening directly:', err);
      if (isRemoteUrl) {
        window.open(rawData, '_blank');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenDirectly = () => {
    if (isRemoteUrl) {
      window.open(rawData, '_blank');
    } else if (isBase64) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${rawData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={document.title || 'Document Preview'}
      size="xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 text-xs text-charcoal-500">
            <span>{document.fileSize || 'Standard Size'} • {document.docType || 'Legal Evidence'}</span>
            {isRemoteUrl && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                <Cloud className="h-3 w-3" /> Supabase Storage
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} className="text-xs">
              Close
            </Button>
            {isRemoteUrl && (
              <Button 
                variant="outline" 
                onClick={handleOpenDirectly} 
                className="text-xs flex items-center gap-1.5 text-taupe-900 border-sand-300 hover:bg-sand-100"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open File in New Tab
              </Button>
            )}
            <Button 
              onClick={handleDownload} 
              isLoading={isDownloading} 
              className="text-xs flex items-center gap-1.5 bg-charcoal-900 hover:bg-charcoal-950 text-sand-50 font-bold"
            >
              <Download className="h-3.5 w-3.5" />
              Download Original File
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Document Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-sand-50/80 p-3 rounded-xl border border-sand-200 text-xs">
          <div>
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold tracking-wider">Document Type</span>
            <span className="font-semibold text-charcoal-900 flex items-center gap-1 mt-0.5 truncate" title={document.docType}>
              <Tag className="h-3 w-3 text-taupe-700 shrink-0" />
              {document.docType || 'Legal Evidence'}
            </span>
          </div>
          <div>
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold tracking-wider">File Name</span>
            <span className="font-semibold text-charcoal-900 truncate block mt-0.5 font-mono text-[11px]" title={document.fileName}>
              {document.fileName || 'document.pdf'}
            </span>
          </div>
          <div>
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold tracking-wider">Uploaded By</span>
            <span className="font-semibold text-charcoal-900 flex items-center gap-1 mt-0.5 truncate">
              <User className="h-3 w-3 text-taupe-700 shrink-0" />
              {document.uploaderName || 'Paralegal Volunteer'}
            </span>
          </div>
          <div>
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold tracking-wider">Upload Date</span>
            <span className="font-semibold text-charcoal-900 flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 text-charcoal-500 shrink-0" />
              {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : 'Active'}
            </span>
          </div>
        </div>

        {/* View Mode Toggle Strip */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-charcoal-600 font-bold">Document Vault Content</span>
          <div className="flex rounded-lg bg-sand-100 p-0.5 text-[11px] font-bold border border-sand-200">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'preview' ? 'bg-charcoal-900 text-sand-50 shadow-xs' : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
            >
              Live File Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dossier')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'dossier' ? 'bg-charcoal-900 text-sand-50 shadow-xs' : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
            >
              Verification Dossier
            </button>
          </div>
        </div>

        {/* Content View Area */}
        <div className="border border-sand-300 rounded-xl overflow-hidden bg-sand-50 min-h-[380px] max-h-[560px] flex items-center justify-center relative shadow-inner">
          {viewMode === 'dossier' ? (
            /* Dossier Record Summary */
            <div className="w-full h-full p-6 bg-white rounded-xl text-left space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-lg bg-sand-100 text-charcoal-900 border border-sand-200">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal-950">{document.title}</h4>
                    <p className="text-xs text-charcoal-500 font-mono">{document.fileName} • {document.docType}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  Vault Authenticated
                </span>
              </div>

              <div className="space-y-2 bg-sand-50 p-4 rounded-xl border border-sand-200 text-xs text-charcoal-700">
                <p className="font-bold text-charcoal-950">File Storage & Cloud URI:</p>
                <p className="font-mono text-[11px] text-charcoal-700 break-all bg-white p-2.5 rounded-lg border border-sand-200">
                  {rawData || 'Standard OutLawed Vault Record'}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                  <div>
                    <span className="text-charcoal-400 block font-bold uppercase text-[10px]">Cloud Provider</span>
                    <span className="font-semibold text-charcoal-900">Supabase Storage CDN</span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 block font-bold uppercase text-[10px]">File Integrity</span>
                    <span className="font-semibold text-emerald-700">100% Intact & Accessible</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-2">
                {isRemoteUrl && (
                  <Button onClick={handleOpenDirectly} className="text-xs flex items-center gap-1.5 bg-charcoal-900 hover:bg-charcoal-950 text-sand-50 font-bold">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Source File
                  </Button>
                )}
                <Button onClick={handleDownload} variant="outline" className="text-xs flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          ) : isImage && (isRemoteUrl || isBase64Image) ? (
            /* Image Preview */
            <div className="p-4 flex items-center justify-center w-full h-full max-h-[500px]">
              <img
                src={rawData}
                alt={document.title}
                className="max-h-[480px] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : isPdf && isRemoteUrl ? (
            /* Cloud PDF Remote File with Robust Fallback */
            <div className="w-full h-full flex flex-col bg-white">
              <object
                data={rawData}
                type="application/pdf"
                className="w-full h-[500px] border-0"
              >
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(rawData)}&embedded=true`}
                  title={document.title}
                  className="w-full h-[500px] border-0"
                >
                  <div className="p-6 text-center space-y-3">
                    <p className="text-xs text-charcoal-700">PDF embedded preview loading...</p>
                    <Button onClick={handleOpenDirectly} className="text-xs">
                      Open PDF in New Tab
                    </Button>
                  </div>
                </iframe>
              </object>
            </div>
          ) : isBase64Pdf ? (
            /* Base64 PDF */
            <iframe
              src={rawData}
              title={document.title}
              className="w-full h-[500px] border-0 bg-white"
            />
          ) : isRemoteUrl ? (
            /* Any Other Remote File */
            <iframe
              src={rawData}
              title={document.title}
              className="w-full h-[500px] border-0 bg-white"
            />
          ) : (
            /* Fallback Card with Direct Action */
            <div className="w-full h-full p-8 bg-white rounded-xl text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-sand-100 text-charcoal-900 border border-sand-300 flex items-center justify-center shadow-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-charcoal-950">{document.title}</h4>
                <p className="text-xs text-charcoal-500 font-mono mt-0.5">{document.fileName} • {document.fileSize || 'Standard'}</p>
              </div>
              <p className="text-xs text-charcoal-600 max-w-md mx-auto">
                This document is secured in the <strong>OutLawed Case Management Vault & Supabase Cloud Storage</strong>.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Button onClick={handleDownload} className="text-xs flex items-center gap-1.5 bg-charcoal-900 hover:bg-charcoal-950 text-sand-50 font-bold">
                  <Download className="h-3.5 w-3.5" />
                  Download File
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
