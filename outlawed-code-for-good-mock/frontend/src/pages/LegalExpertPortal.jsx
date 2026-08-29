import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Scale, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  User, 
  Calendar, 
  Send, 
  Plus, 
  Check, 
  MessageSquare, 
  AlertCircle,
  Eye,
  BookOpen,
  Search,
  Filter,
  Download,
  ShieldCheck,
  ChevronRight,
  Archive,
  History
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import DocumentViewerModal from '../components/DocumentViewerModal';
import { caseService } from '../services/api';
import { 
  getClientDisplayName, 
  getClientDisplayAddress, 
  getFieldVisitDisplayLocation, 
  isCaseResolved 
} from '../utils/privacy';

export default function LegalExpertPortal({ user, initialTab = 'active' }) {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState(
    initialTab === 'previous_cases' ? 'completed' : 'active'
  ); // 'active' | 'pending' | 'completed' (previous cases)

  // Selected case to inspect & provide advice
  const [selectedCase, setSelectedCase] = useState(null);
  const [isProvideAdviceModalOpen, setIsProvideAdviceModalOpen] = useState(false);

  // Advice form states
  const [formalOpinion, setFormalOpinion] = useState('');
  const [statutesInput, setStatutesInput] = useState('');
  const [recommendedActionsInput, setRecommendedActionsInput] = useState('');
  const [draftingSuggestions, setDraftingSuggestions] = useState('');
  const [aiReviewFeedback, setAiReviewFeedback] = useState('');
  const [aiSuggestionsApproved, setAiSuggestionsApproved] = useState(true);
  const [isSubmittingAdvice, setIsSubmittingAdvice] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Document preview state
  const [viewingDoc, setViewingDoc] = useState(null);

  const fetchAssignedCases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await caseService.getCases();
      setCases(res.data.cases || []);
    } catch (err) {
      setError(err.message || 'Error loading assigned legal cases.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedCases();
  }, []);

  useEffect(() => {
    if (initialTab === 'previous_cases') {
      setSelectedStatusTab('completed');
    }
  }, [initialTab]);

  const handleOpenAdviceModal = (c) => {
    setSelectedCase(c);
    // Pre-fill statutory suggestions from AI analysis if available
    const existingActs = c.aiAnalysis?.applicableActs?.join(', ') || '';
    setStatutesInput(existingActs);
    setRecommendedActionsInput(c.aiAnalysis?.suggestedRemedies?.join('\n') || '');
    setFormalOpinion(c.expertGuidance?.[0]?.formalOpinion || '');
    setDraftingSuggestions(c.expertGuidance?.[0]?.draftingSuggestions || '');
    setAiReviewFeedback(c.expertGuidance?.[0]?.aiReviewFeedback || 'AI statutory analysis reviewed, citations verified against judicial precedents.');
    setAiSuggestionsApproved(true);
    setIsProvideAdviceModalOpen(true);
  };

  // Quick helper to insert statute into input
  const handleAddStatuteToForm = (statute) => {
    if (!statutesInput.includes(statute)) {
      setStatutesInput(prev => prev ? `${prev}, ${statute}` : statute);
    }
  };

  const handleSubmitAdvice = async (e) => {
    if (e) e.preventDefault();
    if (!formalOpinion.trim()) {
      alert('Please enter a formal legal advisory opinion.');
      return;
    }

    setIsSubmittingAdvice(true);
    try {
      const statutesArray = statutesInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const actionsArray = recommendedActionsInput
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      await caseService.provideExpertGuidance(selectedCase._id, {
        statutesAndSections: statutesArray,
        formalOpinion,
        recommendedActions: actionsArray,
        draftingSuggestions,
        aiSuggestionsReviewed: aiSuggestionsApproved,
        aiReviewFeedback
      });

      setIsProvideAdviceModalOpen(false);
      setSuccessToast(`Formal Legal Advice dispatched for Case ${selectedCase.caseNumber || selectedCase.caseId}!`);
      setTimeout(() => setSuccessToast(null), 5000);
      fetchAssignedCases();
    } catch (err) {
      alert(err.message || 'Error submitting legal advice.');
    } finally {
      setIsSubmittingAdvice(false);
    }
  };

  // Mark Case as Resolved / Disposed
  const handleMarkResolved = async (caseId, currentTitle) => {
    if (!window.confirm(`Mark case "${currentTitle}" as Resolved & Disposed? It will be archived into Previous Cases.`)) {
      return;
    }
    try {
      await caseService.updateCase(caseId, { status: 'resolved' });
      setSuccessToast(`Case marked as Resolved and moved to Previous Cases Archive!`);
      setTimeout(() => setSuccessToast(null), 5000);
      fetchAssignedCases();
    } catch (err) {
      alert(err.message || 'Error updating case status.');
    }
  };

  // Filter cases based on search, category, and status tabs
  const filteredCases = cases.filter((c) => {
    const matchesSearch = 
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.caseNumber || c.caseId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || 
      (c.category === selectedCategory) || 
      (c.client?.category === selectedCategory);

    const hasGuidance = (c.expertGuidance?.length || 0) > 0;
    const isResolvedOrClosed = c.status === 'resolved' || c.status === 'closed';

    let matchesStatus = true;
    if (selectedStatusTab === 'active') {
      matchesStatus = !isResolvedOrClosed;
    } else if (selectedStatusTab === 'pending') {
      matchesStatus = !hasGuidance && !isResolvedOrClosed;
    } else if (selectedStatusTab === 'completed') {
      // Previous / Completed Cases: cases that are resolved/closed OR where formal advice is completed
      matchesStatus = isResolvedOrClosed || hasGuidance;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const previousCasesCount = cases.filter(c => c.status === 'resolved' || c.status === 'closed' || (c.expertGuidance?.length > 0)).length;
  const activeCasesCount = cases.filter(c => c.status !== 'resolved' && c.status !== 'closed').length;
  const pendingAdviceCount = cases.filter(c => !c.expertGuidance?.length && c.status !== 'resolved' && c.status !== 'closed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-slate-900 p-6 rounded-2xl text-sand-50 border border-charcoal-800 shadow-corporate">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sand-200/20 text-sand-300 border border-sand-300/30">
              Senior Legal Counsel & Mentor Portal
            </span>
            <span className="text-xs text-sand-300">DLSA Legal Advisory Panel</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-sand-50">
            {selectedStatusTab === 'completed' ? 'Previous & Disposed Cases Archive' : 'Complex Case Review & Legal Guidance Hub'}
          </h1>
          <p className="text-xs text-sand-300/80 mt-1 max-w-xl">
            {selectedStatusTab === 'completed' 
              ? 'Access institutional legal memory, examine completed advice dossiers, retrieve attached evidence documents, and review judicial precedents from previous cases.'
              : 'Review active legal aid briefs, verify AI-generated statutory citations, inspect attached evidence, and dispatch formal legal opinions for paralegals.'}
          </p>
        </div>

        <div className="bg-sand-900/40 backdrop-blur-md p-3.5 rounded-xl border border-sand-700/30 text-right shrink-0">
          <p className="text-xs text-sand-300">Logged in Counsel</p>
          <p className="text-sm font-bold text-sand-50">{user?.name || 'Adv. Legal Counsel'}</p>
          <p className="text-[10px] text-taupe-300">{user?.specialization || 'Senior Advocate • Legal Counsel'}</p>
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-4 bg-sand-100 border border-sand-300 rounded-xl text-charcoal-900 flex items-center justify-between shadow-corporate animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-taupe-700 shrink-0" />
            <span className="text-xs font-bold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-charcoal-700 hover:text-charcoal-950 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-[#fdfcfb] p-3 rounded-xl border border-sand-200 shadow-corporate space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex rounded-lg bg-sand-100/70 p-1 w-full md:w-auto overflow-x-auto border border-sand-200">
            <button
              onClick={() => setSelectedStatusTab('active')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all tracking-tight ${
                selectedStatusTab === 'active' ? 'bg-charcoal-900 !text-white shadow-corporate' : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
            >
              Active Cases ({activeCasesCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('pending')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all tracking-tight ${
                selectedStatusTab === 'pending' ? 'bg-charcoal-900 !text-white shadow-corporate' : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
            >
              Pending Advice ({pendingAdviceCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('completed')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap flex items-center gap-1.5 transition-all tracking-tight ${
                selectedStatusTab === 'completed' ? 'bg-taupe-800 !text-white shadow-corporate' : 'text-taupe-800 hover:bg-sand-200'
              }`}
            >
              <Archive className="h-3.5 w-3.5" />
              Previous / Disposed Cases ({previousCasesCount})
            </button>
          </div>

          {/* Search Input & Category Dropdown */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cases, client, facts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Legal Categories</option>
              <option value="Domestic Violence & Maintenance">Domestic Violence</option>
              <option value="Land & Tenancy Dispute">Land & Tenancy</option>
              <option value="PROPERTY">Property / Land</option>
              <option value="Labor & Wage Exploitation">Labor & Wages</option>
              <option value="Welfare & Pension Entitlements">Welfare & Pension</option>
              <option value="SC/ST Atrocities Act Relief">SC/ST PoA Relief</option>
              <option value="Consumer & Microfinance Fraud">Consumer Fraud</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Cases List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 bg-white rounded-xl border border-gray-200 flex justify-center items-center">
            <Loading message="Loading legal aid briefs..." />
          </div>
        ) : error ? (
          <ErrorMessage title="Error Loading Cases" message={error} onRetry={fetchAssignedCases} />
        ) : filteredCases.length === 0 ? (
          <div className="p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
            {selectedStatusTab === 'completed' ? (
              <>
                <Archive className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-gray-700">No Previous / Disposed Cases Found</h3>
                <p className="text-xs text-gray-400 mt-1">Cases that are resolved or where formal advice is issued will be cataloged here.</p>
              </>
            ) : (
              <>
                <Scale className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-gray-700">No active cases match your filters</h3>
                <p className="text-xs text-gray-400 mt-1">Try clearing your search query or selecting "All Legal Categories".</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((c) => {
              const hasGuidance = (c.expertGuidance?.length || 0) > 0;
              const isResolved = c.status === 'resolved' || c.status === 'closed';

              return (
                <div
                  key={c._id}
                  className={`bg-white rounded-2xl border ${isResolved ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-200'} shadow-sm p-6 space-y-4 hover:border-purple-300 hover:shadow-md transition-all`}
                >
                  {/* Case Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-gray-150 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                        {c.caseNumber || c.caseId || 'CASE'}
                      </span>
                      <StatusBadge status={c.priority} type="priority" />
                      <StatusBadge status={c.status} />
                      {isResolved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> Previous Case Record
                        </span>
                      )}
                      <span className="text-xs text-gray-500 font-medium">{c.client?.category || c.category || 'General'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>Paralegal: <strong>{c.assignedTo?.name || 'Nyaaya Mitra'}</strong></span>
                      {c.assignedExpert?.name && (
                        <>
                          <span>•</span>
                          <span className="text-purple-700 font-semibold">Counsel: <strong>{c.assignedExpert.name}</strong></span>
                        </>
                      )}
                      <span>•</span>
                      <span>District: <strong>{c.district}</strong></span>
                    </div>
                  </div>

                  {/* Title and Summary */}
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{c.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{c.description}</p>
                  </div>

                  {/* Grievance Facts & Field Visit Observations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px] block mb-1">
                        Beneficiary Profile & Facts {isCaseResolved(c) && <span className="text-emerald-700 font-bold">(Protected)</span>}
                      </span>
                      <p className="text-gray-800 font-semibold">{getClientDisplayName(c)} ({c.client?.age || 35} yrs, {c.client?.gender || 'Citizen'})</p>
                      <p className="text-gray-600 text-[11px] mt-0.5">{getClientDisplayAddress(c)}</p>
                      {c.facts && <p className="text-gray-600 mt-1 italic">Facts: {c.facts}</p>}
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] block mb-1">
                        Ground Field Verification Notes ({c.fieldVisits?.length || 0} visits)
                      </span>
                      {c.fieldVisits?.length > 0 ? (
                        <p className="text-emerald-950">
                          <strong>{getFieldVisitDisplayLocation(c, c.fieldVisits[0].location)}:</strong> {c.fieldVisits[0].observations}
                        </p>
                      ) : (
                        <p className="text-emerald-700 italic">Verified at site during intake.</p>
                      )}
                    </div>
                  </div>

                  {/* Attached Documents Vault Quick Strip */}
                  {c.documents?.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-primary-600" />
                          Attached Evidence Documents ({c.documents.length})
                        </span>
                        <span className="text-[10px] text-slate-500">Accessible in Previous Case Vault</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {c.documents.map((doc, idx) => (
                          <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                            <div className="overflow-hidden pr-2">
                              <p className="font-bold text-slate-900 truncate text-[11px]" title={doc.title}>{doc.title}</p>
                              <p className="text-[10px] text-slate-400">{doc.docType}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setViewingDoc(doc)}
                              className="px-2 py-1 text-[10px] font-bold bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-md flex items-center gap-1 shrink-0"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Statutory Suggestions Review Box */}
                  {c.aiAnalysis?.summary && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-indigo-600" />
                          AI Statutory Citations & Grounded Precedent
                        </span>
                        <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-100/70 px-2 py-0.5 rounded">
                          RAG Verified
                        </span>
                      </div>
                      <p className="text-xs text-indigo-900">{c.aiAnalysis.summary}</p>
                      {c.aiAnalysis.applicableActs?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {c.aiAnalysis.applicableActs.map((act, i) => (
                            <span 
                              key={i} 
                              className="bg-white text-indigo-900 text-[11px] font-semibold px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1 shadow-2xs cursor-pointer hover:bg-indigo-50"
                              title="Click to inspect"
                              onClick={() => handleOpenAdviceModal(c)}
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formal Guidance History */}
                  {hasGuidance && (
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-purple-700" />
                          Formal Legal Opinion Dispatched by {c.expertGuidance[0].expertName}
                        </span>
                        <span className="text-[10px] text-purple-600">
                          {new Date(c.expertGuidance[0].createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-purple-900 leading-relaxed">{c.expertGuidance[0].formalOpinion}</p>
                      {c.expertGuidance[0].draftingSuggestions && (
                        <p className="text-purple-800 text-[11px]">
                          <strong>Drafting Advice:</strong> {c.expertGuidance[0].draftingSuggestions}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-150 gap-2">
                    <span className="text-xs text-gray-500">
                      {c.documents?.length || 0} Evidence Docs attached • Status: <strong>{c.status}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      {!isResolved && (
                        <Button
                          onClick={() => handleMarkResolved(c._id, c.title)}
                          className="text-xs !py-1 !px-2.5 bg-sand-200 hover:bg-sand-300 !text-black border border-sand-300 font-bold flex items-center gap-1 shadow-corporate"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Mark Resolved
                        </Button>
                      )}
                      <Button
                        onClick={() => handleOpenAdviceModal(c)}
                        className="bg-charcoal-900 hover:bg-charcoal-800 !text-white font-bold text-xs flex items-center gap-1.5 shadow-corporate border border-charcoal-950"
                      >
                        <Scale className="h-4 w-4" />
                        {hasGuidance ? 'Review & Update Advice' : 'Provide Formal Legal Advice'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: PROVIDE FORMAL LEGAL ADVICE & REVIEW AI CITATIONS */}
      {/* ======================================================== */}
      {selectedCase && (
        <Modal
          isOpen={isProvideAdviceModalOpen}
          onClose={() => setIsProvideAdviceModalOpen(false)}
          title={`Senior Counsel Legal Guidance: ${selectedCase.caseNumber || selectedCase.caseId}`}
          size="xl"
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsProvideAdviceModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitAdvice} isLoading={isSubmittingAdvice} className="bg-charcoal-900 hover:bg-charcoal-800 !text-white font-bold border border-charcoal-950 shadow-corporate">
                Approve AI Review & Dispatch Advice
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Case Snapshot */}
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <h4 className="font-bold text-purple-950 text-sm">{selectedCase.title}</h4>
              <p className="text-purple-900 text-xs mt-0.5">
                Beneficiary: <strong>{selectedCase.client?.name}</strong> • Category: {selectedCase.client?.category || selectedCase.category}
              </p>
            </div>

            {/* Attached Evidence Documents Vault */}
            {selectedCase.documents?.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  Attached Case Evidence Documents ({selectedCase.documents.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCase.documents.map((doc, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 text-primary-600 shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 truncate text-[11px]" title={doc.title}>{doc.title}</p>
                          <p className="text-[10px] text-slate-400">{doc.docType}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingDoc(doc)}
                        className="px-2 py-1 text-[10px] font-bold bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-md flex items-center gap-1 shrink-0"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Review Verification Box */}
            <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 block text-xs">
                  1. Review AI-Generated Legal Suggestions & Statutory Findings
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-indigo-900">
                  <input
                    type="checkbox"
                    checked={aiSuggestionsApproved}
                    onChange={(e) => setAiSuggestionsApproved(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  AI Citations Approved
                </label>
              </div>

              <p className="text-indigo-900 text-[11px]">
                {selectedCase.aiAnalysis?.summary || 'AI analysis suggests immediate interim protection under relevant statutory code.'}
              </p>

              {/* Clickable AI acts pills */}
              {selectedCase.aiAnalysis?.applicableActs?.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-800 block">Click statute to insert into advice:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCase.aiAnalysis.applicableActs.map((act, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddStatuteToForm(act)}
                        className="text-[10px] bg-white text-indigo-900 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-1"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                  Expert Review Comments / Verification Note on AI Citations:
                </label>
                <input
                  type="text"
                  value={aiReviewFeedback}
                  onChange={(e) => setAiReviewFeedback(e.target.value)}
                  className="w-full text-xs rounded-md border border-indigo-300 p-2 bg-white"
                  placeholder="e.g. AI citations verified; Section 18 PWDVA and Rajnesh v. Neha precedent are directly applicable."
                />
              </div>
            </div>

            {/* Applicable Statutes and Sections */}
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                2. Applicable Statutory Provisions & Sections (Comma-separated) *
              </label>
              <input
                type="text"
                value={statutesInput}
                onChange={(e) => setStatutesInput(e.target.value)}
                placeholder="e.g. Specific Relief Act 1963 Sec 6, Order 39 CPC, PWDVA 2005 Sec 18"
                className="w-full text-xs rounded-md border border-gray-300 p-2"
              />
            </div>

            {/* Formal Legal Opinion */}
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                3. Formal Legal Advisory Opinion & Strategic Assessment *
              </label>
              <textarea
                rows={4}
                value={formalOpinion}
                onChange={(e) => setFormalOpinion(e.target.value)}
                placeholder="Detailed counsel opinion: prima facie evaluation, strength of beneficiary evidence, recommended court forum, jurisdictional notes..."
                className="w-full text-xs rounded-md border border-gray-300 p-2 leading-relaxed"
              />
            </div>

            {/* Petition Drafting & Next Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  4. Recommended Action Steps (One per line)
                </label>
                <textarea
                  rows={3}
                  value={recommendedActionsInput}
                  onChange={(e) => setRecommendedActionsInput(e.target.value)}
                  placeholder="File IA-1 under Order 39\nRepresentation to Tahsildar\nPolice protection notice"
                  className="w-full text-xs rounded-md border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  5. Petition Drafting Advice for Paralegal / Panel Lawyer
                </label>
                <textarea
                  rows={3}
                  value={draftingSuggestions}
                  onChange={(e) => setDraftingSuggestions(e.target.value)}
                  placeholder="Ensure mandatory disclosure affidavit is attached; cite irreparable loss of livelihood in para 8..."
                  className="w-full text-xs rounded-md border border-gray-300 p-2"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* DOCUMENT PREVIEW & VIEWER MODAL */}
      <DocumentViewerModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
      />
    </div>
  );
}
