import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Search, 
  Filter, 
  Sparkles, 
  FileText, 
  MapPin, 
  User, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  Eye, 
  ShieldAlert, 
  MessageSquare, 
  ExternalLink, 
  Send, 
  RefreshCw, 
  Clock, 
  Layers, 
  ChevronRight,
  BookOpen,
  Scale,
  Download,
  Archive,
  History,
  Check
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import DocumentViewerModal from '../components/DocumentViewerModal';
import { caseService, aiService } from '../services/api';
import { uploadToSupabase } from '../config/supabase';
import { 
  getClientDisplayName, 
  getClientDisplayPhone, 
  getClientDisplayAddress, 
  getFieldVisitDisplayLocation, 
  isCaseResolved 
} from '../utils/privacy';

export default function NyaayaMitraPortal({ user, initialOpenAddModal = false, initialTab = 'active' }) {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Top-level View Tab: 'active' | 'previous'
  const [mainPortalTab, setMainPortalTab] = useState(initialTab === 'previous_cases' ? 'previous' : 'active');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Add Case Modal Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenAddModal);
  const [isSubmittingCase, setIsSubmittingCase] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formClientName, setFormClientName] = useState('');
  const [formClientAge, setFormClientAge] = useState('32');
  const [formClientGender, setFormClientGender] = useState('Female');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formClientAddress, setFormClientAddress] = useState('');
  const [formClientVillage, setFormClientVillage] = useState('');
  const [formCategory, setFormCategory] = useState('Domestic Violence & Maintenance');
  const [formCaseTitle, setFormCaseTitle] = useState('');
  const [formCaseDescription, setFormCaseDescription] = useState('');
  const [formCaseFacts, setFormCaseFacts] = useState('');
  const [formPriority, setFormPriority] = useState('high');

  // Initial Document in Add Form
  const [formDocTitle, setFormDocTitle] = useState('');
  const [formDocType, setFormDocType] = useState('Aadhaar / ID Proof');
  const [formDocFile, setFormDocFile] = useState(null);

  // Initial Field Visit in Add Form
  const [hasFieldVisit, setHasFieldVisit] = useState(true);
  const [formVisitLocation, setFormVisitLocation] = useState('');
  const [formBeneficiaryStatement, setFormBeneficiaryStatement] = useState('');
  const [formObservations, setFormObservations] = useState('');
  const [formActionRecommended, setFormActionRecommended] = useState('');

  // Selected Case Detail View
  const [selectedCase, setSelectedCase] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('overview'); // 'overview' | 'field_visits' | 'updates' | 'docs' | 'similar' | 'ai_copilot'

  // Sub-action Modals inside Case Detail
  const [isFieldVisitModalOpen, setIsFieldVisitModalOpen] = useState(false);
  const [fvLocation, setFvLocation] = useState('');
  const [fvStatement, setFvStatement] = useState('');
  const [fvObservations, setFvObservations] = useState('');
  const [fvAction, setFvAction] = useState('');
  const [isSavingFieldVisit, setIsSavingFieldVisit] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [upTitle, setUpTitle] = useState('');
  const [upNote, setUpNote] = useState('');
  const [upType, setUpType] = useState('field_work');
  const [isSavingUpdate, setIsSavingUpdate] = useState(false);

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Other');
  const [docFile, setDocFile] = useState(null);
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);

  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [escalateUrgency, setEscalateUrgency] = useState('urgent');
  const [isSavingEscalate, setIsSavingEscalate] = useState(false);

  // Similar Cases & AI Copilot State
  const [similarCasesData, setSimilarCasesData] = useState(null);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Fetch Cases on mount / filter change
  const fetchCases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await caseService.getCases({
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });
      setCases(response.data.cases || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch cases.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [selectedPriority, selectedCategory]);

  useEffect(() => {
    if (initialTab === 'previous_cases') {
      setMainPortalTab('previous');
    }
  }, [initialTab]);

  // Handle Mark as Resolved / Reopen
  const handleToggleResolveCase = async (caseId, currentStatus) => {
    const newStatus = (currentStatus === 'resolved' || currentStatus === 'closed') ? 'in_progress' : 'resolved';
    try {
      const res = await caseService.updateCase(caseId, { status: newStatus });
      setSelectedCase(res.data.case);
      fetchCases();
      alert(newStatus === 'resolved' ? 'Case marked as Resolved and moved to Previous Cases!' : 'Case reopened and moved to Active Caseload.');
    } catch (err) {
      alert(err.message || 'Error updating case status.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCases();
  };

  // Open Case Details
  const handleOpenCaseDetail = async (c) => {
    setSelectedCase(c);
    setIsDetailModalOpen(true);
    setActiveDetailTab('overview');

    // Fetch fresh full case details
    try {
      const res = await caseService.getCaseById(c._id);
      setSelectedCase(res.data.case);
    } catch (err) {
      console.error('Error fetching case detail:', err);
    }
  };

  // Load Similar Cases on tab switch
  const loadSimilarCases = async (caseObj) => {
    if (!caseObj) return;
    setIsLoadingSimilar(true);
    try {
      const res = await caseService.getSimilarCases(caseObj._id);
      setSimilarCasesData(res.data);
    } catch (err) {
      console.error('Error loading similar cases:', err);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  // Handle Form Submit: Add New Case
  const handleAddCaseSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errs = {};
    if (!formClientName.trim()) errs.clientName = 'Client name is required';
    if (!formCaseTitle.trim()) errs.caseTitle = 'Case title is required';
    if (!formCaseDescription.trim()) errs.caseDescription = 'Description is required';
    if (hasFieldVisit && !formVisitLocation.trim()) errs.visitLocation = 'Field visit location is required';
    if (hasFieldVisit && !formObservations.trim()) errs.observations = 'Field observations are required';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setIsSubmittingCase(true);

    try {
      const documentsPayload = [];
      if (formDocTitle && formDocFile) {
        const uploadResult = await uploadToSupabase(formDocFile, 'case-documents', 'cases');
        documentsPayload.push({
          title: formDocTitle,
          docType: formDocType,
          fileName: uploadResult.fileName,
          fileData: uploadResult.publicUrl,
          fileSize: uploadResult.fileSize
        });
      }

      const fieldVisitsPayload = [];
      if (hasFieldVisit && formVisitLocation) {
        fieldVisitsPayload.push({
          visitDate: new Date(),
          location: formVisitLocation,
          beneficiaryStatement: formBeneficiaryStatement,
          observations: formObservations,
          evidenceNotes: 'Verified at site during intake.',
          actionRecommended: formActionRecommended || 'Assign priority legal aid support.'
        });
      }

      const payload = {
        title: formCaseTitle,
        client: {
          name: formClientName,
          age: Number(formClientAge) || 30,
          gender: formClientGender,
          phone: formClientPhone,
          address: formClientAddress,
          villageTaluk: formClientVillage,
          category: formCategory,
          district: user?.district || 'Bengaluru Urban'
        },
        description: formCaseDescription,
        facts: formCaseFacts,
        priority: formPriority,
        district: user?.district || 'Bengaluru Urban',
        documents: documentsPayload,
        fieldVisits: fieldVisitsPayload
      };

      const res = await caseService.createCase(payload);
      setIsAddModalOpen(false);
      
      // Reset form
      setFormClientName('');
      setFormCaseTitle('');
      setFormCaseDescription('');
      setFormCaseFacts('');
      setFormVisitLocation('');
      setFormObservations('');
      setFormBeneficiaryStatement('');
      setFormDocTitle('');
      setFormDocFile(null);

      // Refresh cases and open created case details
      await fetchCases();
      if (res.data.case) {
        handleOpenCaseDetail(res.data.case);
      }
    } catch (err) {
      alert(err.message || 'Failed to create case.');
    } finally {
      setIsSubmittingCase(false);
    }
  };

  // Add Field Visit action
  const handleSaveFieldVisit = async (e) => {
    e.preventDefault();
    if (!fvLocation || !fvObservations) {
      alert('Location and Observations are required.');
      return;
    }
    setIsSavingFieldVisit(true);
    try {
      const res = await caseService.addFieldVisit(selectedCase._id, {
        location: fvLocation,
        beneficiaryStatement: fvStatement,
        observations: fvObservations,
        actionRecommended: fvAction
      });
      setSelectedCase(res.data.case);
      setIsFieldVisitModalOpen(false);
      setFvLocation('');
      setFvStatement('');
      setFvObservations('');
      setFvAction('');
      fetchCases();
    } catch (err) {
      alert(err.message || 'Error recording field visit.');
    } finally {
      setIsSavingFieldVisit(false);
    }
  };

  // Add Case Update action
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!upTitle || !upNote) {
      alert('Title and update note are required.');
      return;
    }
    setIsSavingUpdate(true);
    try {
      const res = await caseService.addCaseUpdate(selectedCase._id, {
        title: upTitle,
        note: upNote,
        updateType: upType
      });
      setSelectedCase(res.data.case);
      setIsUpdateModalOpen(false);
      setUpTitle('');
      setUpNote('');
    } catch (err) {
      alert(err.message || 'Error adding update.');
    } finally {
      setIsSavingUpdate(false);
    }
  };

  // Add Document action
  const handleSaveDoc = async (e) => {
    e.preventDefault();
    if (!docTitle || !docFile) {
      alert('Document Title and File are required.');
      return;
    }
    setIsSavingDoc(true);
    try {
      // Upload directly to Supabase Storage
      const uploadResult = await uploadToSupabase(docFile, 'case-documents', 'cases');

      const res = await caseService.addDocument(selectedCase._id, {
        title: docTitle,
        docType: docType,
        fileName: uploadResult.fileName,
        fileData: uploadResult.publicUrl,
        fileSize: uploadResult.fileSize
      });
      setSelectedCase(res.data.case);
      setIsDocModalOpen(false);
      setDocTitle('');
      setDocFile(null);
    } catch (err) {
      alert(err.message || 'Error uploading document to Supabase.');
    } finally {
      setIsSavingDoc(false);
    }
  };

  // Escalate to Legal Expert
  const handleSaveEscalate = async (e) => {
    e.preventDefault();
    if (!escalateReason) {
      alert('Please specify the reason for escalation.');
      return;
    }
    setIsSavingEscalate(true);
    try {
      const res = await caseService.requestLegalExpert(selectedCase._id, {
        reason: escalateReason,
        urgency: escalateUrgency
      });
      setSelectedCase(res.data.case);
      setIsEscalateModalOpen(false);
      setEscalateReason('');
      fetchCases();
      alert('Escalation request submitted to District Case Manager!');
    } catch (err) {
      alert(err.message || 'Error submitting escalation request.');
    } finally {
      setIsSavingEscalate(false);
    }
  };

  // AI Legal Chat query
  const handleSendAiChat = async (e) => {
    e.preventDefault();
    if (!aiChatQuery.trim()) return;

    const userMsg = { role: 'user', text: aiChatQuery };
    setAiChatHistory(prev => [...prev, userMsg]);
    const currentQ = aiChatQuery;
    setAiChatQuery('');
    setIsAiResponding(true);

    try {
      const res = await aiService.chat(currentQ, selectedCase);
      const aiMsg = {
        role: 'assistant',
        text: res.data.answer,
        citations: res.data.citations,
        actionableSteps: res.data.actionableSteps
      };
      setAiChatHistory(prev => [...prev, aiMsg]);
    } catch (err) {
      setAiChatHistory(prev => [
        ...prev,
        { role: 'assistant', text: 'Error retrieving legal knowledge. Please try again.' }
      ]);
    } finally {
      setIsAiResponding(false);
    }
  };

  // Quick stats calculation
  const totalCount = cases.length;
  const activeCasesList = cases.filter(c => c.status !== 'resolved' && c.status !== 'closed');
  const previousCasesList = cases.filter(c => c.status === 'resolved' || c.status === 'closed');
  const highPriorityCount = activeCasesList.filter(c => c.priority === 'high').length;
  const resolvedCount = previousCasesList.length;
  const fieldVisitsTotal = cases.reduce((acc, c) => acc + (c.fieldVisits?.length || 0), 0);

  // Active vs Previous cases list based on mainPortalTab
  const displayedCases = mainPortalTab === 'active' ? activeCasesList : previousCasesList;

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-slate-900 p-6 rounded-2xl text-sand-50 border border-charcoal-800 shadow-corporate">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sand-200/20 text-sand-300 border border-sand-300/30">
              Paralegal Volunteer Workspace
            </span>
            <span className="text-xs text-sand-300">{user?.district || 'Mandya / Bengaluru'}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-sand-50">
            {mainPortalTab === 'previous' ? 'Previous & Resolved Cases Vault' : 'Nyaaya Mitra Case Queue & Priority Board'}
          </h1>
          <p className="text-xs text-sand-300/80 mt-1 max-w-xl">
            {mainPortalTab === 'previous'
              ? 'Access institutional legal memory, inspect previous case evidence, review field observations, and retrieve completed beneficiary records.'
              : 'Register new legal aid intakes, review active cases, set High/Low priority, upload field visit observations, inspect similar cases, and access the RAG AI Legal Copilot.'}
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-sand-100 hover:bg-sand-200 !text-black font-bold text-xs flex items-center gap-2 py-2.5 px-4 shadow-corporate border border-sand-400 shrink-0"
        >
          <FolderPlus className="h-4 w-4" />
          Add Legal Aid Case Intake
        </Button>
      </div>

      {/* Main Mode Toggle: Active vs Previous Cases */}
      <div className="bg-[#fdfcfb] p-1.5 rounded-xl border border-sand-200 shadow-corporate flex items-center justify-between">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setMainPortalTab('active')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 tracking-tight ${
              mainPortalTab === 'active'
                ? 'bg-charcoal-900 !text-white shadow-corporate'
                : 'text-charcoal-600 hover:bg-sand-100 hover:text-charcoal-950'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Active Caseload & Field Board ({activeCasesList.length})
          </button>
          <button
            type="button"
            onClick={() => setMainPortalTab('previous')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 tracking-tight ${
              mainPortalTab === 'previous'
                ? 'bg-charcoal-900 !text-white shadow-corporate'
                : 'text-charcoal-600 hover:bg-sand-100 hover:text-charcoal-950'
            }`}
          >
            <Archive className="h-4 w-4" />
            Previous & Resolved Cases Vault ({previousCasesList.length})
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4 border-l-4 border-l-primary-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Handled</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalCount}</p>
          <p className="text-[10px] text-gray-400 mt-1">Assigned to your queue</p>
        </Card>

        <Card 
          onClick={() => setSelectedPriority(selectedPriority === 'high' ? 'all' : 'high')}
          className={`!p-4 border-l-4 border-l-red-500 cursor-pointer transition-all hover:scale-[1.02] ${
            selectedPriority === 'high' ? 'ring-2 ring-red-500 bg-red-50/40' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1">
              High Priority
            </p>
            {selectedPriority === 'high' && (
              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">ACTIVE FILTER</span>
            )}
          </div>
          <p className="mt-1 text-2xl font-black text-red-600">{highPriorityCount}</p>
          <p className="text-[10px] text-red-500 mt-1">Requires immediate action</p>
        </Card>

        <Card className="!p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Field Visits</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{fieldVisitsTotal}</p>
          <p className="text-[10px] text-gray-400 mt-1">Spot inspections logged</p>
        </Card>

        <Card className="!p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolved</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{resolvedCount}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Successful resolutions</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 flex items-center gap-2">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search beneficiary, case #, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <Button type="submit" variant="outline" className="!py-1.5 !px-3 text-xs shrink-0">
            Search
          </Button>
        </form>

        {/* Priority & Category Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <Filter className="h-3.5 w-3.5" />
            <span>Priority:</span>
          </div>
          <div className="flex gap-1">
            {['all', 'high', 'medium', 'low'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                  selectedPriority === p
                    ? p === 'high' ? 'bg-red-600 text-white' : 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p === 'high' ? 'High' : p}
              </button>
            ))}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-lg border border-gray-300 py-1.5 px-2 text-gray-700 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Legal Categories</option>
            <option value="Domestic Violence & Maintenance">Domestic Violence & Maintenance</option>
            <option value="Land & Tenancy Dispute">Land & Tenancy Dispute</option>
            <option value="Labor & Wage Exploitation">Labor & Wage Exploitation</option>
            <option value="Welfare & Pension Entitlements">Welfare & Pension</option>
            <option value="SC/ST Atrocities Act Relief">SC/ST PoA Relief</option>
            <option value="Consumer & Microfinance Fraud">Consumer / Microfinance</option>
          </select>

          <Button
            variant="outline"
            onClick={fetchCases}
            className="!py-1.5 !px-2 text-xs flex items-center gap-1"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Cases Grid / List */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-gray-200 flex justify-center items-center">
          <Loading message="Loading legal aid case records..." />
        </div>
      ) : error ? (
        <ErrorMessage title="Error Loading Cases" message={error} onRetry={fetchCases} />
      ) : displayedCases.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          {mainPortalTab === 'previous' ? (
            <>
              <Archive className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-700">No Previous / Resolved Cases Yet</h3>
              <p className="text-xs text-gray-400 mt-1">When cases are marked as resolved, they will appear in this permanent vault.</p>
            </>
          ) : (
            <>
              <Scale className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-700">No matching active cases found</h3>
              <p className="text-xs text-gray-400 mt-1">Try clearing filters or add a new case intake.</p>
              <Button onClick={() => setIsAddModalOpen(true)} className="mt-4 text-xs font-semibold">
                Add New Case
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayedCases.map((c) => {
            const isHigh = c.priority === 'high';
            return (
              <div
                key={c._id}
                className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isHigh ? 'border-red-200 ring-1 ring-red-500/10' : 'border-gray-200'
                }`}
              >
                {/* Card Top / Header */}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-extrabold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                      {c.caseNumber}
                    </span>
                    <StatusBadge status={c.priority} type="priority" />
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 mt-1">
                    {c.title}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Beneficiary Badge */}
                  <div className="mt-3.5 p-2.5 rounded-lg bg-gray-50 border border-gray-150 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800 flex items-center gap-1.5" title={isCaseResolved(c) ? 'Beneficiary Name Masked for Resolved Case' : c.client?.name}>
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {getClientDisplayName(c)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {c.client?.age} yrs • {c.client?.gender}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="truncate max-w-[170px]">{c.client?.category}</span>
                      <span className="flex items-center gap-0.5 text-[10px]" title={isCaseResolved(c) ? 'Landmark Protected' : c.district}>
                        <MapPin className="h-3 w-3 text-taupe-500" />
                        {isCaseResolved(c) ? `${c.district} (Protected)` : (c.client?.villageTaluk ? `${c.client.villageTaluk}, ${c.district}` : c.district)}
                      </span>
                    </div>
                  </div>

                  {/* Badges Bar: Docs count, Field visits, Expert Guidance */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <FileText className="h-3 w-3 text-gray-400" />
                      {c.documents?.length || 0} Docs
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {c.fieldVisits?.length || 0} Visits
                    </span>
                    {c.assignedTo?.name && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                        Mitra: {c.assignedTo.name}
                      </span>
                    )}
                    {c.assignedExpert?.name && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                        Counsel: {c.assignedExpert.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer / Action */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-150 flex items-center justify-between">
                  <StatusBadge status={c.status} />
                  <Button
                    onClick={() => handleOpenCaseDetail(c)}
                    className="!py-1 !px-3 text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {c.status === 'resolved' || c.status === 'closed' ? 'View Case Dossier & Docs' : 'Inspect & Act'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD NEW LEGAL AID CASE INTAKE */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Legal Aid Case Intake (Nyaaya Mitra Form)"
        size="xl"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCaseSubmit} isLoading={isSubmittingCase}>
              Create & Generate AI Legal Analysis
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddCaseSubmit} className="space-y-6">
          {/* Section 1: Beneficiary / Client Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary-600" />
              1. Beneficiary Information (Client Profile)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Beneficiary Full Name *"
                placeholder="e.g. Basavarajappa Gowda"
                value={formClientName}
                onChange={(e) => setFormClientName(e.target.value)}
                error={formErrors.clientName}
              />
              <Input
                label="Age"
                type="number"
                value={formClientAge}
                onChange={(e) => setFormClientAge(e.target.value)}
              />
              <Select
                label="Gender"
                value={formClientGender}
                onChange={(e) => setFormClientGender(e.target.value)}
                options={[
                  { value: 'Female', label: 'Female' },
                  { value: 'Male', label: 'Male' },
                  { value: 'Transgender / Other', label: 'Transgender / Other' }
                ]}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Phone Contact"
                placeholder="+91 98450 XXXXX"
                value={formClientPhone}
                onChange={(e) => setFormClientPhone(e.target.value)}
              />
              <Input
                label="Village / Ward / Taluk"
                placeholder="e.g. Hulimavu, Doddaballapura"
                value={formClientVillage}
                onChange={(e) => setFormClientVillage(e.target.value)}
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Legal Aid Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-1.5 px-2 text-xs shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Domestic Violence & Maintenance">Domestic Violence & Maintenance</option>
                  <option value="Land & Tenancy Dispute">Land & Tenancy Dispute</option>
                  <option value="Labor & Wage Exploitation">Labor & Wage Exploitation</option>
                  <option value="Welfare & Pension Entitlements">Welfare & Pension Entitlements</option>
                  <option value="SC/ST Atrocities Act Relief">SC/ST Atrocities Act Relief</option>
                  <option value="Consumer & Microfinance Fraud">Consumer & Microfinance Fraud</option>
                  <option value="Family & Child Custody">Family & Child Custody</option>
                  <option value="General Legal Aid">General Legal Aid</option>
                </select>
              </div>
            </div>
            <Input
              label="Residential Address"
              placeholder="House no, street, landmark..."
              value={formClientAddress}
              onChange={(e) => setFormClientAddress(e.target.value)}
            />
          </div>

          {/* Section 2: Case Details & Priority */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-primary-600" />
              2. Case Grievance Details & Priority Assessment
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Case Title / Subject *"
                  placeholder="e.g. Encroachment of 2-acre agricultural land and crop damage"
                  value={formCaseTitle}
                  onChange={(e) => setFormCaseTitle(e.target.value)}
                  error={formErrors.caseTitle}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Case Priority Level *
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormPriority('high')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-extrabold border transition-all ${
                      formPriority === 'high'
                        ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50'
                    }`}
                  >
                    High
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPriority('medium')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-extrabold border transition-all ${
                      formPriority === 'medium'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-50'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPriority('low')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-extrabold border transition-all ${
                      formPriority === 'low'
                        ? 'bg-slate-700 text-white border-slate-800 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-slate-50'
                    }`}
                  >
                    Low
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  High priority cases trigger real-time escalation alerts on District Coordinator dashboard.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Detailed Case Description *
              </label>
              <textarea
                rows={3}
                placeholder="Narrative of the incident, sequence of events, respondent details..."
                value={formCaseDescription}
                onChange={(e) => setFormCaseDescription(e.target.value)}
                className={`block w-full rounded-md shadow-sm text-xs border ${
                  formErrors.caseDescription ? 'border-red-500' : 'border-gray-300'
                } p-2 focus:ring-primary-500 focus:border-primary-500`}
              />
              {formErrors.caseDescription && (
                <p className="text-red-500 text-[11px] mt-0.5">{formErrors.caseDescription}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Specific Legal Facts & Proofs (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="RTC survey numbers, dates of complaint, names of witnesses..."
                value={formCaseFacts}
                onChange={(e) => setFormCaseFacts(e.target.value)}
                className="block w-full rounded-md shadow-sm text-xs border border-gray-300 p-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Section 3: Legal Document Upload */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary-600" />
              3. Legal Documents Upload
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Document Title"
                placeholder="e.g. Ancestral Patta / FIR Copy"
                value={formDocTitle}
                onChange={(e) => setFormDocTitle(e.target.value)}
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Document Type</label>
                <select
                  value={formDocType}
                  onChange={(e) => setFormDocType(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-1.5 px-2 text-xs"
                >
                  <option value="Aadhaar / ID Proof">Aadhaar / ID Proof</option>
                  <option value="FIR / Police Complaint">FIR / Police Complaint</option>
                  <option value="Land Title / Patta / Revenue Record">Land Title / Patta / RTC</option>
                  <option value="Medical Report / Certificate">Medical Report / MLC</option>
                  <option value="Salary / Wage Slip / Bank Statement">Wage Slip / Bank Statement</option>
                  <option value="Legal Notice">Legal Notice</option>
                  <option value="Court Order / Summons">Court Order / Summons</option>
                  <option value="Field Photo / Evidence">Field Photo / Evidence</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Attach File</label>
                <input
                  type="file"
                  onChange={(e) => setFormDocFile(e.target.files[0])}
                  className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Initial Field Visit Record */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary-600" />
                4. Field Visit Record (Ground Inspection)
              </h4>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFieldVisit}
                  onChange={(e) => setHasFieldVisit(e.target.checked)}
                  className="rounded text-primary-600"
                />
                Include field visit record
              </label>
            </div>

            {hasFieldVisit && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Inspection Location / Site *"
                    placeholder="e.g. Survey No. 142/3, Hulimavu Village"
                    value={formVisitLocation}
                    onChange={(e) => setFormVisitLocation(e.target.value)}
                    error={formErrors.visitLocation}
                  />
                  <Input
                    label="Action Recommended"
                    placeholder="e.g. Urgent injunction suit required"
                    value={formActionRecommended}
                    onChange={(e) => setFormActionRecommended(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Beneficiary Statement Recorded at Site
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Words spoken by beneficiary during volunteer visit..."
                    value={formBeneficiaryStatement}
                    onChange={(e) => setFormBeneficiaryStatement(e.target.value)}
                    className="block w-full rounded-md shadow-sm text-xs border border-gray-300 p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Volunteer Field Observations & Evidence Gathered *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Observations of damaged crops, injuries, neighbor statements..."
                    value={formObservations}
                    onChange={(e) => setFormObservations(e.target.value)}
                    className={`block w-full rounded-md shadow-sm text-xs border ${
                      formErrors.observations ? 'border-red-500' : 'border-gray-300'
                    } p-2`}
                  />
                  {formErrors.observations && (
                    <p className="text-red-500 text-[11px] mt-0.5">{formErrors.observations}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: COMPREHENSIVE CASE DETAIL WORKSPACE */}
      {/* ======================================================== */}
      {selectedCase && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Case Workspace: ${selectedCase.caseNumber} - ${selectedCase.title}`}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Quick Priority Switch:</span>
                {['high', 'medium', 'low'].map(p => (
                  <button
                    key={p}
                    onClick={async () => {
                      try {
                        const res = await caseService.updateCase(selectedCase._id, { priority: p });
                        setSelectedCase(res.data.case);
                        fetchCases();
                      } catch (err) {
                        alert(err.message);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                      selectedCase.priority === p
                        ? p === 'high' ? 'bg-red-600 text-white border-red-700' : 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close Workspace
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Top Workspace Header */}
            <div className="p-4 bg-charcoal-950 text-sand-50 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-corporate border border-charcoal-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-sand-300 bg-charcoal-900 px-2 py-0.5 rounded border border-charcoal-700">
                    {selectedCase.caseNumber}
                  </span>
                  <StatusBadge status={selectedCase.priority} type="priority" />
                  <StatusBadge status={selectedCase.status} />
                </div>
                <h3 className="font-bold text-base text-sand-50">{selectedCase.title}</h3>
                <p className="text-xs text-sand-300 mt-0.5">
                  Beneficiary: <strong>{selectedCase.client?.name}</strong> • District: {selectedCase.district}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleToggleResolveCase(selectedCase._id, selectedCase.status)}
                  className={`!py-1.5 !px-3 text-xs font-bold flex items-center gap-1 shadow-corporate ${
                    selectedCase.status === 'resolved' || selectedCase.status === 'closed'
                      ? 'bg-sand-300 !text-black border border-sand-400 hover:bg-sand-200'
                      : 'bg-sand-100 !text-black border border-sand-300 hover:bg-sand-200'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  {selectedCase.status === 'resolved' || selectedCase.status === 'closed' ? 'Reopen Case' : 'Mark as Resolved'}
                </Button>
                <Button
                  onClick={() => setIsEscalateModalOpen(true)}
                  className="bg-taupe-700 hover:bg-taupe-800 !text-white !py-1.5 !px-3 text-xs font-bold flex items-center gap-1 shadow-corporate border border-taupe-800"
                >
                  <Scale className="h-3.5 w-3.5" />
                  Request Legal Expert
                </Button>
                <Button
                  onClick={() => setIsFieldVisitModalOpen(true)}
                  className="bg-charcoal-800 hover:bg-charcoal-700 !text-white !py-1.5 !px-3 text-xs font-bold flex items-center gap-1 shadow-corporate border border-charcoal-700"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Log Field Visit
                </Button>
                <Button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="bg-charcoal-900 !text-white border border-charcoal-700 hover:bg-charcoal-800 !py-1.5 !px-3 text-xs font-bold flex items-center gap-1 shadow-corporate"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Add Progress Note
                </Button>
              </div>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div className="flex border-b border-gray-200 overflow-x-auto gap-1">
              {[
                { id: 'overview', label: 'Case Overview', icon: BookOpen },
                { id: 'field_visits', label: `Field Visits (${selectedCase.fieldVisits?.length || 0})`, icon: MapPin },
                { id: 'updates', label: `Progress Timeline (${selectedCase.updates?.length || 0})`, icon: Clock },
                { id: 'docs', label: `Documents (${selectedCase.documents?.length || 0})`, icon: FileText },
                { id: 'similar', label: 'Similar Cases (RAG)', icon: Layers, highlight: true },
                { id: 'ai_copilot', label: 'AI Legal Copilot', icon: Sparkles, highlight: true },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeDetailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveDetailTab(tab.id);
                      if (tab.id === 'similar') loadSimilarCases(selectedCase);
                    }}
                    className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                        : tab.highlight
                        ? 'border-transparent text-indigo-700 bg-indigo-50/30 hover:bg-indigo-50'
                        : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: Overview */}
            {activeDetailTab === 'overview' && (
              <div className="space-y-4">
                {/* Beneficiary Card */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Beneficiary Demographics & Location
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">
                        Beneficiary Name {isCaseResolved(selectedCase) && <span className="text-emerald-700 font-bold">(Protected)</span>}
                      </span>
                      <span className="font-bold text-gray-900">{getClientDisplayName(selectedCase)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Age / Gender</span>
                      <span className="font-bold text-gray-900">
                        {selectedCase.client?.age} yrs • {selectedCase.client?.gender}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">
                        Phone Contact {isCaseResolved(selectedCase) && <span className="text-emerald-700 font-bold">(Confidential)</span>}
                      </span>
                      <span className="font-bold text-gray-900">{getClientDisplayPhone(selectedCase)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Category</span>
                      <span className="font-bold text-primary-700">{selectedCase.client?.category}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="text-gray-400 text-[10px] block">
                      Address / Village / Landmark {isCaseResolved(selectedCase) && <span className="text-emerald-700 font-bold">(Landmark Protected)</span>}
                    </span>
                    <span className="font-medium text-gray-800">{getClientDisplayAddress(selectedCase)}</span>
                  </div>
                </div>

                {/* Grievance Narrative */}
                <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Case Description</h4>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedCase.description}
                  </p>

                  {selectedCase.facts && (
                    <div className="mt-3 pt-3 border-t border-gray-150">
                      <h5 className="text-xs font-bold text-gray-800">Documented Legal Facts & References:</h5>
                      <p className="text-xs text-gray-600 mt-1">{selectedCase.facts}</p>
                    </div>
                  )}
                </div>

                {/* Legal Expert Guidance Snapshot (if assigned) */}
                {selectedCase.expertGuidance?.length > 0 && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <Scale className="h-4 w-4 text-purple-700" />
                        Formal Legal Expert Guidance ({selectedCase.expertGuidance[0].expertName})
                      </span>
                      <span className="text-[10px] text-purple-600">
                        {new Date(selectedCase.expertGuidance[0].createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-purple-950 font-medium">
                      {selectedCase.expertGuidance[0].formalOpinion}
                    </p>
                    {selectedCase.expertGuidance[0].statutesAndSections?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedCase.expertGuidance[0].statutesAndSections.map((st, i) => (
                          <span key={i} className="bg-purple-200 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded">
                            {st}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Field Visits */}
            {activeDetailTab === 'field_visits' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-gray-700">Recorded Field Visits</h4>
                  <Button onClick={() => setIsFieldVisitModalOpen(true)} className="!py-1 !px-2.5 text-xs">
                    + Log New Field Visit
                  </Button>
                </div>

                {selectedCase.fieldVisits?.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No field visits logged yet.</p>
                ) : (
                  selectedCase.fieldVisits.map((fv, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {fv.location}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(fv.visitDate).toLocaleDateString()} • By {fv.officerName}
                        </span>
                      </div>
                      {fv.beneficiaryStatement && (
                        <div className="p-2.5 rounded bg-white border border-gray-150 text-xs italic text-gray-700">
                          "{fv.beneficiaryStatement}"
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Observations</span>
                        <p className="text-xs text-gray-800">{fv.observations}</p>
                      </div>
                      {fv.actionRecommended && (
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          Recommended Action: {fv.actionRecommended}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: Progress Updates */}
            {activeDetailTab === 'updates' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-gray-700">Case Work Timeline</h4>
                  <Button onClick={() => setIsUpdateModalOpen(true)} className="!py-1 !px-2.5 text-xs">
                    + Add Progress Update
                  </Button>
                </div>

                {selectedCase.updates?.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No updates logged.</p>
                ) : (
                  <div className="relative border-l-2 border-primary-200 ml-4 space-y-4 py-2">
                    {selectedCase.updates.map((up, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary-600 ring-4 ring-white" />
                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-gray-900">{up.title}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(up.date).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700">{up.note}</p>
                          <span className="text-[10px] text-gray-400 font-medium mt-1 block">
                            By {up.authorName} ({up.authorRole})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Documents */}
            {activeDetailTab === 'docs' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-gray-700">Legal Documents Vault</h4>
                  <Button onClick={() => setIsDocModalOpen(true)} className="!py-1 !px-2.5 text-xs">
                    + Upload Document
                  </Button>
                </div>

                {selectedCase.documents?.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No documents uploaded.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCase.documents.map((doc, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-primary-300 transition-all flex flex-col justify-between">
                        <div className="flex items-start gap-2.5 mb-3">
                          <div className="p-2.5 rounded-lg bg-primary-50 text-primary-700 shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-900 truncate" title={doc.title}>{doc.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{doc.docType} • {doc.fileSize}</p>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{doc.fileName}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Vault Verified
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingDoc(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewingDoc(doc)}
                              className="p-1 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                              title="Download document"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Similar Cases (RAG Matcher) */}
            {activeDetailTab === 'similar' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-950">
                    <strong>RAG Similarity Matching Engine:</strong> Historical legal cases and Supreme Court precedents matched against current grievance facts and statutory category.
                  </div>
                </div>

                {isLoadingSimilar ? (
                  <div className="p-8 text-center"><Loading message="Searching past cases & legal precedents..." /></div>
                ) : similarCasesData ? (
                  <div className="space-y-4">
                    {/* Landmark Precedents */}
                    {similarCasesData.landmarkPrecedents?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                          <Scale className="h-4 w-4" />
                          Binding Judicial Precedents (Supreme Court / High Court)
                        </h4>
                        {similarCasesData.landmarkPrecedents.map((p, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-purple-950">{p.caseTitle} ({p.year})</span>
                              <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
                                {p.confidence}% Relevance Match
                              </span>
                            </div>
                            <p className="text-xs text-purple-900 mt-1">{p.rulingSummary}</p>
                            <p className="text-[11px] text-purple-700 font-semibold mt-1">
                              Key Takeaway: {p.keyTakeaway}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Matched Historical Cases */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Similar Historical Cases Handled in Platform
                      </h4>
                      {similarCasesData.similarCases?.map((sc) => (
                        <div key={sc.id} className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-gray-900">{sc.title}</span>
                              <span className="text-[10px] text-gray-400 ml-2">({sc.caseNumber} • {sc.district})</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {sc.confidence}% Match
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {sc.matchReasons?.map((r, i) => (
                              <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                {r}
                              </span>
                            ))}
                          </div>

                          <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                            <span className="font-semibold text-gray-800 block text-[11px]">Past Resolution Strategy:</span>
                            {sc.resolutionOutcome}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* TAB CONTENT: AI Legal Copilot */}
            {activeDetailTab === 'ai_copilot' && (
              <div className="space-y-4">
                {/* AI Analysis Snapshot */}
                {selectedCase.aiAnalysis?.summary && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-50 border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                        AI Statutory Analysis & Rights Guidance
                      </span>
                      <span className="text-[10px] text-indigo-600">RAG Grounded</span>
                    </div>

                    <p className="text-xs text-indigo-950 font-medium">
                      {selectedCase.aiAnalysis.summary}
                    </p>

                    {selectedCase.aiAnalysis.applicableActs?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">
                          Applicable Indian Statutory Acts & Sections:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCase.aiAnalysis.applicableActs.map((act, i) => (
                            <span key={i} className="bg-white text-indigo-900 border border-indigo-200 text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm">
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCase.aiAnalysis.requiredDocuments?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">
                          Required Evidence Checklist for Paralegal:
                        </span>
                        <ul className="text-xs text-indigo-900 list-disc list-inside space-y-0.5">
                          {selectedCase.aiAnalysis.requiredDocuments.map((doc, i) => (
                            <li key={i}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive AI Chat Assistant */}
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-primary-600" />
                    Ask AI Legal Assistant about this case
                  </h4>

                  {/* Chat Message History */}
                  <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded-lg border border-gray-150">
                    {aiChatHistory.length === 0 ? (
                      <p className="text-[11px] text-gray-400 text-center py-4">
                        Ask any question regarding court petitions, BNS sections, maintenance formulas, or NALSA entitlements.
                      </p>
                    ) : (
                      aiChatHistory.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl text-xs ${
                            msg.role === 'user'
                              ? 'bg-primary-600 text-white ml-6 font-medium'
                              : 'bg-white text-gray-800 mr-6 border border-gray-200 shadow-sm'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.text}</p>
                          {msg.citations?.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-150 text-[10px] text-indigo-600">
                              <strong>Citations:</strong> {msg.citations.join(' • ')}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {isAiResponding && (
                      <div className="p-2 text-xs text-gray-400 italic">AI Legal Assistant is thinking...</div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendAiChat} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. How to draft emergency stay petition under Section 18 DV Act?"
                      value={aiChatQuery}
                      onChange={(e) => setAiChatQuery(e.target.value)}
                      className="flex-1 text-xs rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <Button type="submit" isLoading={isAiResponding} className="!py-2 !px-4 text-xs font-bold">
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* SUB-MODAL: LOG FIELD VISIT */}
      <Modal
        isOpen={isFieldVisitModalOpen}
        onClose={() => setIsFieldVisitModalOpen(false)}
        title="Record Ground Field Visit"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFieldVisitModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFieldVisit} isLoading={isSavingFieldVisit}>Save Field Visit</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveFieldVisit} className="space-y-3">
          <Input
            label="Location Visited *"
            placeholder="e.g. Beneficiary home, Doddaballapura"
            value={fvLocation}
            onChange={(e) => setFvLocation(e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Beneficiary Statement</label>
            <textarea
              rows={2}
              placeholder="Statement recorded during conversation..."
              value={fvStatement}
              onChange={(e) => setFvStatement(e.target.value)}
              className="block w-full rounded-md border border-gray-300 p-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Field Observations *</label>
            <textarea
              rows={3}
              placeholder="Detailed observations, witness accounts, damage..."
              value={fvObservations}
              onChange={(e) => setFvObservations(e.target.value)}
              className="block w-full rounded-md border border-gray-300 p-2 text-xs"
            />
          </div>
          <Input
            label="Action Recommended"
            placeholder="e.g. Schedule DLSA pre-litigation meeting"
            value={fvAction}
            onChange={(e) => setFvAction(e.target.value)}
          />
        </form>
      </Modal>

      {/* SUB-MODAL: ADD PROGRESS UPDATE */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Add Case Timeline Progress Note"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUpdate} isLoading={isSavingUpdate}>Log Progress Note</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveUpdate} className="space-y-3">
          <Input
            label="Update Title *"
            placeholder="e.g. Met with Village Accountant / Filed Police Complaint"
            value={upTitle}
            onChange={(e) => setUpTitle(e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Update Category</label>
            <select
              value={upType}
              onChange={(e) => setUpType(e.target.value)}
              className="block w-full rounded-md border border-gray-300 p-1.5 text-xs"
            >
              <option value="field_work">Field Work / Investigation</option>
              <option value="status_change">Status Update</option>
              <option value="hearing_note">Court / Mediation Hearing Note</option>
              <option value="general">General Note</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Progress Details *</label>
            <textarea
              rows={3}
              placeholder="Details of the progress made..."
              value={upNote}
              onChange={(e) => setUpNote(e.target.value)}
              className="block w-full rounded-md border border-gray-300 p-2 text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* SUB-MODAL: UPLOAD DOCUMENT */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Upload Legal Document to Vault"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDocModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDoc} isLoading={isSavingDoc}>Upload Document</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveDoc} className="space-y-3">
          <Input
            label="Document Title *"
            placeholder="e.g. Village Survey Map / Hospital Report"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Document Category</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="block w-full rounded-md border border-gray-300 p-1.5 text-xs"
            >
              <option value="Aadhaar / ID Proof">Aadhaar / ID Proof</option>
              <option value="FIR / Police Complaint">FIR / Police Complaint</option>
              <option value="Land Title / Patta / Revenue Record">Land Title / Patta</option>
              <option value="Medical Report / Certificate">Medical Report / MLC</option>
              <option value="Salary / Wage Slip / Bank Statement">Wage Slip / Bank Statement</option>
              <option value="Legal Notice">Legal Notice</option>
              <option value="Court Order / Summons">Court Order / Summons</option>
              <option value="Field Photo / Evidence">Field Photo / Evidence</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Attach File *</label>
            <input
              type="file"
              onChange={(e) => setDocFile(e.target.files[0])}
              className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700"
            />
          </div>
        </form>
      </Modal>

      {/* SUB-MODAL: ESCALATE TO LEGAL EXPERT */}
      <Modal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        title="Request Legal Expert Escalation"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEscalateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEscalate} isLoading={isSavingEscalate} className="bg-purple-600 hover:bg-purple-700 text-white">
              Submit Escalation Request
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEscalate} className="space-y-3">
          <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-900 border border-purple-200">
            This request will be routed to the <strong>District Case Manager</strong> for review and assignment to an empanelled Senior Advocate / Legal Expert.
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Urgency Level</label>
            <select
              value={escalateUrgency}
              onChange={(e) => setEscalateUrgency(e.target.value)}
              className="block w-full rounded-md border border-gray-300 p-1.5 text-xs font-bold"
            >
              <option value="critical">Critical (Stay order / Emergency within 24 hours)</option>
              <option value="urgent">Urgent (Complex statutory interpretation needed)</option>
              <option value="standard">Standard (Advisory guidance)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Legal Expert Escalation *</label>
            <textarea
              rows={3}
              placeholder="Describe the legal complexity, risk of irreparable harm, or specific sections requiring senior counsel opinion..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className="block w-full rounded-md border border-gray-300 p-2 text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* DOCUMENT PREVIEW & VIEWER MODAL */}
      <DocumentViewerModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
      />
    </div>
  );
}
