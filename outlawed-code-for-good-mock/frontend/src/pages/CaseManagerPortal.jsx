import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  Users, 
  Scale, 
  FileCheck2, 
  ArrowRight, 
  Filter, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Award, 
  Eye, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle,
  MapPin,
  TrendingUp,
  Briefcase,
  FileText,
  Download,
  Plus,
  Upload,
  Sparkles,
  ShieldCheck,
  Calendar,
  BookOpen,
  Search,
  Archive,
  History
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import DocumentViewerModal from '../components/DocumentViewerModal';
import { caseManagerService, caseService, authService } from '../services/api';
import { 
  getClientDisplayName, 
  getClientDisplayPhone, 
  getClientDisplayAddress, 
  isCaseResolved 
} from '../utils/privacy';

export default function CaseManagerPortal({ user, initialTab = 'dashboard' }) {
  const [metrics, setMetrics] = useState(null);
  const [cases, setCases] = useState([]);
  const [expertRequests, setExpertRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [legalExpertsList, setLegalExpertsList] = useState([]);
  const [nyaayaMitrasList, setNyaayaMitrasList] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState(initialTab); // 'dashboard' | 'cases' | 'delayed' | 'expert_requests' | 'volunteers' | 'previous_cases'
  const [selectedDistrict, setSelectedDistrict] = useState(user?.district || 'Bengaluru Urban');
  const [caseSearch, setCaseSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Review Expert Request Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedExpertToAssign, setSelectedExpertToAssign] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Assign Case Modal
  const [selectedCaseToAssign, setSelectedCaseToAssign] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignedMitraId, setAssignedMitraId] = useState('');
  const [assignedExpertId, setAssignedExpertId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Case Detail Modal & Sub-tabs
  const [selectedCaseDetail, setSelectedCaseDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState('overview'); // 'overview' | 'docs' | 'field_visits' | 'ai_analysis' | 'expert_guidance' | 'updates'

  // Document Viewer & Upload state
  const [viewingDoc, setViewingDoc] = useState(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Court Order / Notice');
  const [docFile, setDocFile] = useState(null);
  const [isSavingDoc, setIsSavingDoc] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const distParam = selectedDistrict !== 'All' ? selectedDistrict : undefined;

      const [metricsRes, casesRes, requestsRes, volunteersRes, expertsRes, mitrasRes] = await Promise.all([
        caseManagerService.getDashboardMetrics({ district: distParam }),
        caseService.getCases({ district: distParam }),
        caseManagerService.getExpertRequests({ district: distParam }),
        caseManagerService.getVolunteerPerformance({ district: distParam }),
        authService.getUsers({ role: 'legal_expert' }),
        authService.getUsers({ role: 'nyaaya_mitra' })
      ]);

      const pendingReqs = (requestsRes.data.requests || []).filter(
        r => r.expertRequest?.status === 'pending_review' || (!r.expertRequest?.status && r.expertRequest?.isRequested)
      );

      setMetrics(metricsRes.data);
      setCases(casesRes.data.cases || []);
      setExpertRequests(pendingReqs);
      setVolunteers(volunteersRes.data.volunteers || []);
      setLegalExpertsList(expertsRes.data.users || []);
      setNyaayaMitrasList(mitrasRes.data.users || []);
    } catch (err) {
      setError(err.message || 'Error fetching case manager data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDistrict]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Handle Review of Expert Request
  const handleApproveExpertRequest = async () => {
    if (!selectedExpertToAssign) {
      alert('Please select a Legal Expert to assign.');
      return;
    }
    const reqId = selectedRequest._id;
    setIsSubmittingReview(true);
    try {
      await caseManagerService.reviewExpertRequest(reqId, {
        action: 'approve',
        expertId: selectedExpertToAssign,
        reviewNote: reviewNote
      });
      // Immediately remove from pending queue
      setExpertRequests(prev => prev.filter(r => r._id !== reqId));
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      setSelectedExpertToAssign('');
      setReviewNote('');
      await fetchData();
      alert('Senior Counsel assigned to case successfully!');
    } catch (err) {
      alert(err.message || 'Error assigning expert.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRejectExpertRequest = async () => {
    if (!reviewNote.trim()) {
      alert('Please provide a reason for declining escalation.');
      return;
    }
    const reqId = selectedRequest._id;
    setIsSubmittingReview(true);
    try {
      await caseManagerService.reviewExpertRequest(reqId, {
        action: 'reject',
        reviewNote: reviewNote
      });
      // Immediately remove from pending queue
      setExpertRequests(prev => prev.filter(r => r._id !== reqId));
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      setReviewNote('');
      await fetchData();
      alert('Escalation returned to Nyaaya Mitra with notes.');
    } catch (err) {
      alert(err.message || 'Error updating request.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle Case Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const caseId = selectedCaseToAssign?._id;
    setIsSubmittingAssign(true);
    try {
      await caseService.assignCase(caseId, {
        assignedTo: assignedMitraId || undefined,
        assignedExpert: assignedExpertId || undefined,
        status: assignedExpertId ? 'assigned_expert' : 'in_progress',
        notes: assignNotes
      });
      if (assignedExpertId) {
        setExpertRequests(prev => prev.filter(r => r._id !== caseId));
      }
      setIsAssignModalOpen(false);
      setSelectedCaseToAssign(null);
      setAssignedMitraId('');
      setAssignedExpertId('');
      setAssignNotes('');
      await fetchData();
      alert('Case assignment directives saved!');
    } catch (err) {
      alert(err.message || 'Error assigning case.');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Upload Document to Case as Case Manager
  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docTitle || !docFile) {
      alert('Document title and file are required.');
      return;
    }
    setIsSavingDoc(true);
    try {
      const uploadResult = await uploadToSupabase(docFile, 'case-documents', 'cases');
      const res = await caseService.addDocument(selectedCaseDetail._id, {
        title: docTitle,
        docType: docType,
        fileName: uploadResult.fileName,
        fileData: uploadResult.publicUrl,
        fileSize: uploadResult.fileSize
      });
      setSelectedCaseDetail(res.data.case);
      setIsDocModalOpen(false);
      setDocTitle('');
      setDocFile(null);
      fetchData();
      alert('Document saved to case vault successfully!');
    } catch (err) {
      alert(err.message || 'Error uploading document.');
    } finally {
      setIsSavingDoc(false);
    }
  };

  // Filtered cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      (c.title || '').toLowerCase().includes(caseSearch.toLowerCase()) ||
      (c.caseNumber || c.caseId || '').toLowerCase().includes(caseSearch.toLowerCase()) ||
      (c.client?.name || '').toLowerCase().includes(caseSearch.toLowerCase());
    const matchesCat = categoryFilter === 'all' || c.client?.category === categoryFilter || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-slate-900 p-6 rounded-2xl text-sand-50 border border-charcoal-800 shadow-corporate">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sand-200/20 text-sand-300 border border-sand-300/30">
              District Legal Aid Coordination Office
            </span>
            <span className="text-xs text-sand-300">DLSA Case Management Command</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-sand-50">
            District Operations & Case Allocation Board
          </h1>
          <p className="text-xs text-sand-300/80 mt-1 max-w-xl">
            Monitor ground paralegal intakes, examine attached evidence dossiers, triage legal escalations, and coordinate panel advocates across {selectedDistrict}.
          </p>
        </div>

        {/* District Filter Dropdown */}
        <div className="bg-sand-900/40 backdrop-blur-md p-3.5 rounded-xl border border-sand-700/30 text-right shrink-0 space-y-1">
          <label className="block text-[10px] uppercase font-bold text-sand-300">District Scope</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-charcoal-900 text-sand-50 font-bold text-xs rounded-lg px-3 py-1.5 border border-charcoal-700 focus:outline-none focus:ring-2 focus:ring-taupe-400"
          >
            <option value="All">All Operating Districts</option>
            <option value="Bengaluru Urban">Bengaluru Urban</option>
            <option value="Bengaluru Rural">Bengaluru Rural</option>
            <option value="Mandya">Mandya</option>
            <option value="Mysuru">Mysuru</option>
            <option value="Tumakuru">Tumakuru</option>
            <option value="Kolar">Kolar</option>
          </select>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-charcoal-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-charcoal-500 font-bold uppercase tracking-wider">Total Active Cases</p>
              <p className="text-2xl font-black text-charcoal-950 mt-1">{metrics?.summary?.totalCases || cases.length}</p>
            </div>
            <div className="p-3 bg-sand-100 text-charcoal-800 rounded-xl">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-stone-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-600 font-bold uppercase tracking-wider">Delayed / Pending</p>
              <p className="text-2xl font-black text-stone-900 mt-1">{metrics?.summary?.highPriorityCount || 0}</p>
            </div>
            <div className="p-3 bg-stone-100 text-stone-800 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-taupe-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-taupe-600 font-bold uppercase tracking-wider">Expert Escalations</p>
              <p className="text-2xl font-black text-taupe-900 mt-1">{expertRequests.length}</p>
            </div>
            <div className="p-3 bg-sand-100 text-taupe-800 rounded-xl">
              <Scale className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-sand-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-sand-600 font-bold uppercase tracking-wider">Resolved & Disposed</p>
              <p className="text-2xl font-black text-charcoal-900 mt-1">{metrics?.summary?.resolvedCount || 0}</p>
            </div>
            <div className="p-3 bg-sand-100 text-charcoal-800 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-[#fdfcfb] p-1.5 rounded-xl border border-sand-200 shadow-corporate flex flex-wrap gap-1">
        {[
          { id: 'dashboard', label: 'District Analytics & Overview' },
          { id: 'cases', label: `Active District Cases (${cases.filter(c => c.status !== 'resolved' && c.status !== 'closed').length})` },
          { id: 'previous_cases', label: `Previous & Disposed Cases (${cases.filter(c => c.status === 'resolved' || c.status === 'closed').length})` },
          { id: 'delayed', label: `Delayed & Pending Cases (${metrics?.summary?.delayedCount || 0})` },
          { id: 'expert_requests', label: `Expert Escalation Queue (${expertRequests.length})` },
          { id: 'volunteers', label: `Volunteer Performance (${volunteers.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all tracking-tight ${
              activeTab === tab.id
                ? 'bg-charcoal-900 !text-white shadow-corporate'
                : 'text-charcoal-600 hover:bg-sand-100 hover:text-charcoal-950'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DISTRICT ANALYTICS */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card title="District Caseload & Priority Distribution" subtitle="Aggregate metrics across operating jurisdictions.">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-600">District</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-600">Total Cases</th>
                      <th className="px-4 py-3 text-center font-bold text-red-600">High Priority</th>
                      <th className="px-4 py-3 text-center font-bold text-amber-600">Pending Review</th>
                      <th className="px-4 py-3 text-center font-bold text-emerald-600">Resolved</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {metrics?.districtBreakdown?.map((d) => (
                      <tr key={d.district} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-gray-900 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-blue-600" />
                          {d.district}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">{d.total}</td>
                        <td className="px-4 py-3 text-center font-bold text-red-600">{d.highPriority}</td>
                        <td className="px-4 py-3 text-center text-amber-600 font-semibold">{d.pending}</td>
                        <td className="px-4 py-3 text-center text-emerald-600 font-semibold">{d.resolved}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedDistrict(d.district);
                              setActiveTab('cases');
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:underline"
                          >
                            Filter Cases →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Category Caseload Distribution" subtitle="Types of legal aid claims received in this district. Click to filter.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {metrics?.categoryBreakdown && Object.entries(metrics.categoryBreakdown).map(([cat, count]) => (
                  <div 
                    key={cat} 
                    onClick={() => {
                      setCategoryFilter(cat);
                      setActiveTab('cases');
                    }}
                    className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 flex items-center justify-between text-xs cursor-pointer transition-all shadow-2xs"
                  >
                    <span className="font-semibold text-gray-800">{cat}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                      {count} Cases →
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card title="Pending Legal Expert Escalations" subtitle="Requests from Nyaaya Mitras requiring advocate allocation.">
              {expertRequests.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No pending expert requests.</p>
              ) : (
                <div className="space-y-3">
                  {expertRequests.map((req) => (
                    <div key={req._id} className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-purple-950 truncate max-w-[170px]">{req.title}</span>
                        <StatusBadge status={req.expertRequest?.urgency || 'urgent'} type="priority" />
                      </div>
                      <p className="text-[11px] text-purple-900 line-clamp-2">
                        Reason: {req.expertRequest?.reason}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-500">By {req.assignedTo?.name || 'Nyaaya Mitra'}</span>
                        <Button
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsReviewModalOpen(true);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white !py-1 !px-2 text-[11px] font-bold"
                        >
                          Review & Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ALL DISTRICT CASES */}
      {/* ======================================================== */}
      {activeTab === 'cases' && (
        <Card title="District Case Triage & Assignment Board" subtitle="Review case status, priority, attached evidence documents, and assign personnel.">
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="relative flex-1 w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cases, case no, client..."
                value={caseSearch}
                onChange={(e) => setCaseSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Legal Categories</option>
              <option value="Domestic Violence & Maintenance">Domestic Violence</option>
              <option value="Land & Tenancy Dispute">Land & Tenancy</option>
              <option value="PROPERTY">Property / Land</option>
              <option value="Labor & Wage Exploitation">Labor & Wages</option>
              <option value="Welfare & Pension Entitlements">Welfare & Pension</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">Case No. & Title</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">Beneficiary</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-600">Evidence Vault</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-600">Priority</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">Assigned Team</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredCases.map((c) => (
                  <tr key={c._id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] font-bold text-primary-700 block">{c.caseNumber || c.caseId}</span>
                      <span className="font-bold text-gray-900 line-clamp-1">{c.title}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      <div className="font-bold text-gray-900">{getClientDisplayName(c)}</div>
                      <div className="text-[10px] text-gray-400">{c.client?.category || c.category}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedCaseDetail(c);
                          setActiveDossierTab('docs');
                          setIsDetailModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        title="Click to view documents"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary-600" />
                        {c.documents?.length || 0} Docs
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={c.priority} type="priority" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div>
                        <span className="font-bold text-gray-900 block">{c.assignedTo?.name || 'Unassigned Mitra'}</span>
                        {c.assignedExpert && (
                          <span className="text-[10px] text-purple-700 font-semibold">Counsel: {c.assignedExpert.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1.5">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedCaseDetail(c);
                            setActiveDossierTab('overview');
                            setIsDetailModalOpen(true);
                          }}
                          className="!py-1 !px-2 text-[10px] font-bold"
                        >
                          View Dossier
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedCaseToAssign(c);
                            setAssignedMitraId(c.assignedTo?._id || '');
                            setAssignedExpertId(c.assignedExpert?._id || '');
                            setIsAssignModalOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white !py-1 !px-2 text-[10px] font-bold"
                        >
                          Assign
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DELAYED & PENDING CASES */}
      {/* ======================================================== */}
      {activeTab === 'delayed' && (
        <Card title="Delayed & SLA-Breached Cases Monitor" subtitle="Cases requiring urgent coordinator escalation to avoid administrative default.">
          {metrics?.delayedCases?.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold">All cases are within SLA deadlines!</h4>
              <p className="text-xs text-emerald-600 mt-1">No delayed cases recorded in this district.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics?.delayedCases?.map((dc) => (
                <div key={dc._id} className="p-4 rounded-xl bg-red-50/80 border border-red-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-red-900 bg-red-200 px-2 py-0.5 rounded">
                        {dc.caseNumber}
                      </span>
                      <StatusBadge status="critical" type="priority" label="DELAYED / OVERDUE" />
                      <span className="text-xs text-gray-500">{dc.client?.category}</span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">{dc.title}</h4>
                    <p className="text-xs text-red-800 mt-1">
                      Beneficiary: <strong>{dc.client?.name}</strong> • District: {dc.district} • {dc.documents?.length || 0} Evidence Docs
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => {
                        setSelectedCaseDetail(dc);
                        setActiveDossierTab('overview');
                        setIsDetailModalOpen(true);
                      }}
                      variant="outline"
                      className="!py-1.5 !px-3 text-xs"
                    >
                      View Dossier & Docs
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedCaseToAssign(dc);
                        setIsAssignModalOpen(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white !py-1.5 !px-3 text-xs font-bold"
                    >
                      Reassign / Expedite
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ======================================================== */}
      {/* TAB 4: EXPERT ESCALATION QUEUE */}
      {/* ======================================================== */}
      {activeTab === 'expert_requests' && (
        <Card title="Legal Expert Escalation Review Queue" subtitle="Nyaaya Mitra requests for Senior Counsel assignment.">
          {expertRequests.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No escalation requests pending.</p>
          ) : (
            <div className="space-y-4">
              {expertRequests.map((req) => (
                <div key={req._id} className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                        {req.caseNumber}
                      </span>
                      <StatusBadge status={req.priority} type="priority" />
                      <StatusBadge status={req.expertRequest?.urgency || 'urgent'} type="priority" />
                    </div>
                    <span className="text-[10px] text-gray-400">
                      Requested: {new Date(req.expertRequest?.requestedAt || req.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{req.title}</h4>
                    <p className="text-xs text-purple-900 bg-purple-50 p-2.5 rounded-lg border border-purple-200 mt-2">
                      <strong>Escalation Reason:</strong> {req.expertRequest?.reason}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-150">
                    <span className="text-xs text-gray-600">
                      Beneficiary: <strong>{req.client?.name}</strong> • Volunteer: {req.assignedTo?.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedCaseDetail(req);
                          setActiveDossierTab('docs');
                          setIsDetailModalOpen(true);
                        }}
                        className="!py-1.5 !px-3 text-xs"
                      >
                        Inspect Dossier & Evidence ({req.documents?.length || 0})
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsReviewModalOpen(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white !py-1.5 !px-3 text-xs font-bold"
                      >
                        Review & Assign Expert
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ======================================================== */}
      {/* TAB 5: NYAAYA MITRA VOLUNTEER PERFORMANCE */}
      {/* ======================================================== */}
      {activeTab === 'volunteers' && (
        <Card title="Nyaaya Mitra Volunteer Performance Leaderboard" subtitle="Ground-level case intake, field visit count, and resolution analytics.">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">Volunteer Name</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">District</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-600">Cases Handled</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-600">Field Visits</th>
                  <th className="px-4 py-3 text-center font-bold text-emerald-600">Resolved</th>
                  <th className="px-4 py-3 text-center font-bold text-blue-600">Resolution Rate</th>
                  <th className="px-4 py-3 text-center font-bold text-amber-600">Active Caseload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {volunteers.map((v) => (
                  <tr key={v.userId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-900 flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      {v.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{v.district}</td>
                    <td className="px-4 py-3 text-center font-semibold">{v.casesAssigned}</td>
                    <td className="px-4 py-3 text-center text-blue-700 font-bold">{v.fieldVisitsCount}</td>
                    <td className="px-4 py-3 text-center text-emerald-600 font-bold">{v.casesResolved}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600">{v.resolutionRate}</td>
                    <td className="px-4 py-3 text-center font-bold text-amber-600">{v.activeCases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TAB 6: PREVIOUS & DISPOSED CASES VAULT */}
      {/* ======================================================== */}
      {activeTab === 'previous_cases' && (
        <Card 
          title="Previous & Disposed Cases Archive" 
          subtitle="Complete historical record of resolved, closed, and arbitrated legal aid matters."
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">Case ID</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">Title & Beneficiary</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">Assigned Team</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-600">Evidence Vault</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-600">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {cases.filter(c => c.status === 'resolved' || c.status === 'closed').length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      <Archive className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="font-bold text-gray-600">No Previous / Disposed Cases Found</p>
                      <p className="text-[11px] mt-0.5">Cases marked as Resolved or Closed will be archived in this permanent record.</p>
                    </td>
                  </tr>
                ) : (
                  cases
                    .filter(c => c.status === 'resolved' || c.status === 'closed')
                    .map((c) => (
                      <tr key={c._id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-800">
                          {c.caseNumber || c.caseId}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900 line-clamp-1">{c.title}</p>
                          <p className="text-[11px] text-gray-500">
                            Beneficiary: {c.client?.name} ({c.client?.age} yrs, {c.client?.gender})
                          </p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {c.client?.category || c.category}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Disposed / Resolved
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <p className="text-[11px]">Mitra: <strong>{c.assignedTo?.name || 'Assigned'}</strong></p>
                          {c.assignedExpert && (
                            <p className="text-[10px] text-purple-700">Expert: {c.assignedExpert?.name}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            {c.documents?.length || 0} Docs
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            onClick={() => {
                              setSelectedCaseDetail(c);
                              setIsDetailModalOpen(true);
                            }}
                            className="text-xs !py-1 !px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                          >
                            View Archive Dossier
                          </Button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* MODAL: REVIEW & ASSIGN LEGAL EXPERT */}
      {/* ======================================================== */}
      {selectedRequest && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Review Legal Expert Request: ${selectedRequest.caseNumber || selectedRequest.caseId}`}
          size="lg"
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRejectExpertRequest} isLoading={isSubmittingReview}>
                Reject Escalation
              </Button>
              <Button onClick={handleApproveExpertRequest} isLoading={isSubmittingReview} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                Approve & Assign Expert
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
              <span className="font-bold text-purple-950 block text-sm">{selectedRequest.title}</span>
              <p className="text-purple-900">
                <strong>Reason:</strong> {selectedRequest.expertRequest?.reason}
              </p>
              <p className="text-purple-700 text-[11px]">
                Beneficiary: {selectedRequest.client?.name} • Category: {selectedRequest.client?.category}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Select Legal Expert / Senior Counsel to Assign *
              </label>
              <select
                value={selectedExpertToAssign}
                onChange={(e) => setSelectedExpertToAssign(e.target.value)}
                className="block w-full rounded-md border border-gray-300 py-2 px-2.5 text-xs font-bold bg-white"
              >
                <option value="">-- Choose Senior Legal Counsel --</option>
                {legalExpertsList.map((exp) => (
                  <option key={exp._id} value={exp._id}>
                    {exp.name} ({exp.specialization || 'Advocate'}) - {exp.district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Coordinator Review Notes / Guidance for Legal Expert
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please expedite Section 18 interim application drafting before JMFC court..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 text-xs"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: ASSIGN / REASSIGN CASE */}
      {/* ======================================================== */}
      {selectedCaseToAssign && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Personnel: ${selectedCaseToAssign.caseNumber || selectedCaseToAssign.caseId}`}
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignSubmit} isLoading={isSubmittingAssign} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Save Assignment</Button>
            </div>
          }
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Assign Nyaaya Mitra (Ground Paralegal)</label>
              <select
                value={assignedMitraId}
                onChange={(e) => setAssignedMitraId(e.target.value)}
                className="block w-full rounded-md border border-gray-300 py-2 px-2.5 text-xs bg-white"
              >
                <option value="">-- Unassigned --</option>
                {nyaayaMitrasList.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.district}) - {m.specialization || 'Volunteer'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Assign Legal Expert / Mentor</label>
              <select
                value={assignedExpertId}
                onChange={(e) => setAssignedExpertId(e.target.value)}
                className="block w-full rounded-md border border-gray-300 py-2 px-2.5 text-xs bg-white"
              >
                <option value="">-- No Expert Assigned --</option>
                {legalExpertsList.map((exp) => (
                  <option key={exp._id} value={exp._id}>
                    {exp.name} ({exp.specialization || 'Counsel'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Assignment Directive / Coordinator Notes</label>
              <textarea
                rows={2}
                placeholder="Specific instructions for ground verification or timeline expectation..."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 text-xs"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: COMPREHENSIVE CASE DOSSIER & DOCUMENTS VAULT */}
      {/* ======================================================== */}
      {selectedCaseDetail && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Case Dossier: ${selectedCaseDetail.caseNumber || selectedCaseDetail.caseId} - ${selectedCaseDetail.title}`}
          size="xl"
          footer={
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-gray-500">
                District: <strong>{selectedCaseDetail.district}</strong> • Status: {selectedCaseDetail.status}
              </span>
              <Button onClick={() => setIsDetailModalOpen(false)}>Close Dossier</Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Dossier Header */}
            <div className="p-4 bg-sand-100/70 rounded-xl border border-sand-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-corporate">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xs text-charcoal-900 bg-sand-200 px-2 py-0.5 rounded border border-sand-300">
                    {selectedCaseDetail.caseNumber || selectedCaseDetail.caseId}
                  </span>
                  <StatusBadge status={selectedCaseDetail.priority} type="priority" />
                  <StatusBadge status={selectedCaseDetail.status} />
                </div>
                <h4 className="font-bold text-sm text-charcoal-950">{selectedCaseDetail.title}</h4>
                <p className="text-charcoal-600 mt-0.5">
                  Beneficiary: <strong>{selectedCaseDetail.client?.name}</strong> ({selectedCaseDetail.client?.age} yrs, {selectedCaseDetail.client?.gender}) • {selectedCaseDetail.client?.category || selectedCaseDetail.category}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCaseDetail.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    try {
                      const res = await caseService.updateCase(selectedCaseDetail._id, { status: newStatus });
                      setSelectedCaseDetail(res.data.case);
                      fetchData();
                      alert(`Case status updated to ${newStatus}`);
                    } catch (err) {
                      alert(err.message || 'Error updating status');
                    }
                  }}
                  className="text-xs font-bold bg-white border border-sand-300 rounded-lg px-2.5 py-1 text-charcoal-800 focus:ring-2 focus:ring-charcoal-500 shadow-corporate"
                >
                  <option value="submitted">Status: Submitted</option>
                  <option value="under_review">Status: Under Review</option>
                  <option value="in_progress">Status: In Progress</option>
                  <option value="assigned_expert">Status: Assigned Expert</option>
                  <option value="hearing_scheduled">Status: Hearing Scheduled</option>
                  <option value="resolved">Status: Resolved</option>
                  <option value="closed">Status: Closed</option>
                </select>

                <Button
                  onClick={() => {
                    setSelectedCaseToAssign(selectedCaseDetail);
                    setAssignedMitraId(selectedCaseDetail.assignedTo?._id || selectedCaseDetail.assignedTo || '');
                    setAssignedExpertId(selectedCaseDetail.assignedExpert?._id || selectedCaseDetail.assignedExpert || '');
                    setIsAssignModalOpen(true);
                  }}
                  className="text-xs !py-1 !px-2.5 font-bold bg-sand-200 hover:bg-sand-300 !text-black border border-sand-300 shadow-corporate"
                >
                  Assign Team
                </Button>

                <Button
                  onClick={() => setIsDocModalOpen(true)}
                  className="text-xs flex items-center gap-1.5 bg-charcoal-900 hover:bg-charcoal-800 !text-white font-bold !py-1 !px-2.5 shadow-corporate"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Upload Document
                </Button>
              </div>
            </div>

            {/* Sub-tabs inside Dossier */}
            <div className="flex border-b border-gray-200 overflow-x-auto gap-1">
              {[
                { id: 'overview', label: 'Facts & Narrative' },
                { id: 'docs', label: `Evidence Documents (${selectedCaseDetail.documents?.length || 0})` },
                { id: 'field_visits', label: `Field Visits (${selectedCaseDetail.fieldVisits?.length || 0})` },
                { id: 'ai_analysis', label: 'AI Statutory Analysis' },
                { id: 'expert_guidance', label: `Expert Guidance (${selectedCaseDetail.expertGuidance?.length || 0})` },
                { id: 'updates', label: `Case Timeline (${selectedCaseDetail.updates?.length || 0})` },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveDossierTab(t.id)}
                  className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                    activeDossierTab === t.id
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: Overview */}
            {activeDossierTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                  <h5 className="font-bold text-gray-800">Case Description & Grievance:</h5>
                  <p className="text-gray-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedCaseDetail.description}
                  </p>
                </div>

                {selectedCaseDetail.facts && (
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
                    <h5 className="font-bold text-gray-800">Grievance Ground Facts:</h5>
                    <p className="text-gray-700 leading-relaxed italic">{selectedCaseDetail.facts}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <h5 className="font-bold text-slate-800 mb-1">
                      Beneficiary Contact & Address {isCaseResolved(selectedCaseDetail) && <span className="text-emerald-700 font-bold text-xs">(Protected)</span>}
                    </h5>
                    <p className="text-slate-700">Phone: <strong>{getClientDisplayPhone(selectedCaseDetail)}</strong></p>
                    <p className="text-slate-700">Location: {getClientDisplayAddress(selectedCaseDetail)}</p>
                    <p className="text-slate-700">Zone / District: {selectedCaseDetail.district || 'Mandya'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <h5 className="font-bold text-slate-800 mb-1">Assignment Information</h5>
                    <p className="text-slate-700">Paralegal: <strong>{selectedCaseDetail.assignedTo?.name || 'Unassigned'}</strong></p>
                    <p className="text-slate-700">Legal Mentor: <strong>{selectedCaseDetail.assignedExpert?.name || 'None Assigned'}</strong></p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Evidence Documents Vault */}
            {activeDossierTab === 'docs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">Attached Evidence & Legal Documents ({selectedCaseDetail.documents?.length || 0})</span>
                  <Button onClick={() => setIsDocModalOpen(true)} className="text-xs !py-1 !px-2.5 flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Upload Document
                  </Button>
                </div>

                {selectedCaseDetail.documents?.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-bold">No documents attached yet</p>
                    <p className="text-gray-400 text-[11px] mt-1">Upload ID proofs, land records, or court notices.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCaseDetail.documents.map((doc, idx) => (
                      <div key={idx} className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-all">
                        <div className="flex items-start gap-2.5 mb-3">
                          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="overflow-hidden">
                            <h6 className="font-bold text-gray-900 truncate text-xs" title={doc.title}>{doc.title}</h6>
                            <p className="text-[10px] text-gray-400 mt-0.5">{doc.docType} • {doc.fileSize || 'Standard'}</p>
                            <p className="text-[10px] text-gray-500 font-mono truncate">{doc.fileName}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Vault Verified
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingDoc(doc)}
                              className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewingDoc(doc)}
                              className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
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

            {/* TAB CONTENT: Field Visits */}
            {activeDossierTab === 'field_visits' && (
              <div className="space-y-3">
                {selectedCaseDetail.fieldVisits?.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">No ground field visits logged.</p>
                ) : (
                  selectedCaseDetail.fieldVisits.map((fv, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-emerald-700" />
                          {fv.location}
                        </span>
                        <span className="text-[10px] text-emerald-700">
                          {new Date(fv.visitDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-900">{fv.observations}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: AI Statutory Analysis */}
            {activeDossierTab === 'ai_analysis' && (
              <div className="space-y-3">
                {selectedCaseDetail.aiAnalysis ? (
                  <div className="p-4 bg-indigo-50/80 rounded-xl border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                        AI Statutory Citations & Legal Recommendations
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                        RAG Grounded
                      </span>
                    </div>

                    <p className="text-indigo-900 leading-relaxed">{selectedCaseDetail.aiAnalysis.summary}</p>

                    {selectedCaseDetail.aiAnalysis.applicableActs?.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-indigo-950 block mb-1">Applicable Acts & Statutes:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCaseDetail.aiAnalysis.applicableActs.map((act, i) => (
                            <span key={i} className="bg-white text-indigo-900 text-[11px] font-semibold px-2 py-0.5 rounded border border-indigo-200">
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-6">No AI legal synthesis generated yet.</p>
                )}
              </div>
            )}

            {/* TAB CONTENT: Expert Legal Guidance */}
            {activeDossierTab === 'expert_guidance' && (
              <div className="space-y-3">
                {selectedCaseDetail.expertGuidance?.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">No formal legal opinion issued yet.</p>
                ) : (
                  selectedCaseDetail.expertGuidance.map((g, i) => (
                    <div key={i} className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2 text-purple-950">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 flex items-center gap-1.5">
                          <Scale className="h-4 w-4 text-purple-700" />
                          Formal Opinion by {g.expertName}
                        </span>
                        <span className="text-[10px] text-purple-600">
                          {new Date(g.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-purple-900 leading-relaxed">{g.formalOpinion}</p>
                      {g.draftingSuggestions && (
                        <p className="text-[11px] text-purple-800 bg-white/70 p-2.5 rounded-lg border border-purple-200">
                          <strong>Drafting Advice:</strong> {g.draftingSuggestions}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: Case Timeline */}
            {activeDossierTab === 'updates' && (
              <div className="space-y-2">
                {selectedCaseDetail.updates?.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">No updates logged.</p>
                ) : (
                  selectedCaseDetail.updates.map((u, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                      <Clock className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{u.title}</span>
                          <span className="text-[10px] text-slate-400">{new Date(u.date || u.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{u.note}</p>
                        <span className="text-[10px] text-slate-400">By {u.authorName} ({u.authorRole})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: UPLOAD DOCUMENT DIRECTLY IN CASE MANAGER PORTAL */}
      {/* ======================================================== */}
      {selectedCaseDetail && (
        <Modal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          title={`Upload Legal Document: ${selectedCaseDetail.caseNumber || selectedCaseDetail.caseId}`}
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDocModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUploadDoc} isLoading={isSavingDoc} className="bg-primary-600 hover:bg-primary-700 text-white font-bold">
                Save & Upload
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUploadDoc} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Document Title *</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. DLSA Legal Aid Sanction Notice / Summons"
                className="w-full rounded-md border border-gray-300 p-2 text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Document Category</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-xs bg-white font-bold"
              >
                <option value="Court Order / Notice">Court Order / Notice</option>
                <option value="Aadhaar / ID Proof">Aadhaar / ID Proof</option>
                <option value="Land Title / Patta / Revenue Record">Land Title / Patta / Revenue Record</option>
                <option value="FIR / Police CSR Copy">FIR / Police CSR Copy</option>
                <option value="Medical / Injury Certificate">Medical / Injury Certificate</option>
                <option value="Other">Other Evidence Document</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Select File (PDF, Image, Scanned Document) *</label>
              <input
                type="file"
                onChange={(e) => setDocFile(e.target.files[0])}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="w-full border border-gray-300 p-2 rounded-md text-xs bg-slate-50"
                required
              />
            </div>
          </form>
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
