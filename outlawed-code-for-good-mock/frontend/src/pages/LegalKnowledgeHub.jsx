import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  Scale, 
  Send, 
  FileText, 
  CheckCircle2, 
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Award
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { aiService } from '../services/api';

export default function LegalKnowledgeHub() {
  const [articles, setArticles] = useState([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [aiStatus, setAiStatus] = useState(null);

  // AI Chat Assistant
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: 'Namaste! I am the NyaayaSetu RAG AI Legal Assistant. Powered by 384-dimensional Vector Semantic Search and Grounded Cloud LLMs (NALSA, PWDVA, BNS/BNSS, Labor Codes, Land Laws). How can I assist your case work today?'
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Selected Article Detail Modal
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fetchKnowledge = async () => {
    setIsLoadingArticles(true);
    try {
      const [res, statusRes] = await Promise.all([
        aiService.getKnowledge({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchFilter || undefined
        }),
        aiService.getStatus().catch(() => ({ data: null }))
      ]);
      setArticles(res.data.articles || []);
      if (statusRes.data) setAiStatus(statusRes.data);
    } catch (err) {
      console.error('Error loading knowledge base:', err);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchKnowledge();
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMsg = { role: 'user', text: chatQuery };
    setChatHistory(prev => [...prev, userMsg]);
    const currentQ = chatQuery;
    setChatQuery('');
    setIsChatLoading(true);

    try {
      const res = await aiService.chat(currentQ);
      const aiMsg = {
        role: 'assistant',
        text: res.data.answer,
        citations: res.data.citations,
        actionableSteps: res.data.actionableSteps,
        retrievedArticles: res.data.retrievedArticles,
        source: res.data.llmMetadata?.source || 'Vector RAG'
      };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', text: 'Error retrieving legal knowledge. Please try again.' }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const quickQuestions = [
    'What are the mandatory grounds for immediate Section 18 protection order under DV Act?',
    'How to recover unpaid wages for unorganised construction workers under Section 15?',
    'What is the statutory procedure under Section 6 Specific Relief Act for agricultural land dispossession?',
    'What are the criteria for 100% free legal aid under Section 12 of NALSA Act 1987?'
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-slate-900 p-6 rounded-2xl text-sand-50 border border-charcoal-800 shadow-corporate flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sand-200/20 text-sand-300 border border-sand-300/30">
              Vector RAG & Cloud LLM Engine
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {aiStatus ? `${aiStatus.provider} (${aiStatus.model})` : 'Active'}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-sand-50 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-taupe-400" />
            AI Legal Knowledge & Precedents Hub
          </h1>
          <p className="text-xs text-sand-300/80 mt-1 max-w-xl">
            Explore statutory provisions, procedural checklists, and landmark court judgements indexed via 384-dimensional vector embeddings, or consult the interactive Cloud LLM legal copilot.
          </p>
        </div>

        <div className="bg-sand-900/40 backdrop-blur-md p-3 rounded-xl border border-sand-700/30 text-xs text-sand-300 shrink-0 space-y-1">
          <p className="font-bold text-sand-50 flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-sand-300" />
            384-Dim Dense Vector Search
          </p>
          <p className="text-[10px] text-sand-300">Engine: Cosine Vector Similarity + Grounded RAG</p>
        </div>
      </div>

      {/* Main Grid: Interactive AI Chat on Left + Statutory Library on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive RAG Legal Chat Assistant */}
        <div className="lg:col-span-5 space-y-4">
          <Card title="Interactive AI Legal Copilot" subtitle="Ask specific statutory questions or drafting queries.">
            {/* Quick Prompts */}
            <div className="space-y-1.5 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block">
                Suggested Legal Queries:
              </span>
              <div className="flex flex-col gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setChatQuery(q);
                    }}
                    className="text-left text-[11px] p-2 rounded-lg bg-sand-50/70 hover:bg-sand-100 text-charcoal-800 hover:text-charcoal-950 border border-sand-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-charcoal-900 text-white ml-6 font-medium shadow-sm'
                      : 'bg-white text-gray-900 mr-4 border border-sand-200 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {msg.source && (
                    <div className="mt-2 text-[9px] text-charcoal-400 font-bold uppercase tracking-wider">
                      Source: {msg.source}
                    </div>
                  )}

                  {msg.retrievedArticles?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-sand-200 text-[10px] text-charcoal-700 space-y-1">
                      <span className="font-bold block text-taupe-900">Retrieved Statutory Chunks:</span>
                      <div className="flex flex-wrap gap-1">
                        {msg.retrievedArticles.map((art, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-sand-100 text-charcoal-800 border border-sand-200 font-medium text-[9px]">
                            {art.title} {art.matchPercentage ? `(${art.matchPercentage}% Match)` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {msg.citations?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-sand-200 text-[10px] text-indigo-700 space-y-1">
                      <span className="font-bold block">Legal Citations & Precedents:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {msg.citations.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.actionableSteps?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-sand-200 text-[10px] text-emerald-800 space-y-1">
                      <span className="font-bold block">Actionable Steps for Field Advocates:</span>
                      <ul className="list-decimal list-inside space-y-0.5">
                        {msg.actionableSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              {isChatLoading && (
                <div className="p-3 text-xs text-charcoal-700 bg-sand-100 rounded-xl border border-sand-300 italic flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin text-taupe-700" />
                  Vector RAG is retrieving dense statutory chunks & invoking LLM...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Ask legal query (e.g. RTI application timeline, maintenance rights)..."
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                className="flex-1 text-xs rounded-xl border border-sand-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-charcoal-900 bg-sand-50/50"
              />
              <Button type="submit" isLoading={isChatLoading} className="!py-2 !px-4 text-xs font-bold shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Statutory Knowledge Base Articles */}
        <div className="lg:col-span-7 space-y-4">
          <Card title="Indian Statutory & Legal Aid Knowledge Base" subtitle="Curated legal toolkits and landmark rulings indexed for paralegals.">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search acts, sections, keywords..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <Button type="submit" variant="outline" className="!py-1.5 !px-3 text-xs">Search</Button>
              </form>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs rounded-lg border border-gray-300 py-1.5 px-2 text-gray-700"
              >
                <option value="all">All Categories</option>
                <option value="Domestic Violence & Maintenance">Domestic Violence & Maintenance</option>
                <option value="Land & Tenancy Dispute">Land & Tenancy Dispute</option>
                <option value="Labor & Wage Exploitation">Labor & Wage Exploitation</option>
              </select>
            </div>

            {/* Articles List */}
            {isLoadingArticles ? (
              <div className="p-8 text-center"><Loading message="Loading statutory knowledge..." /></div>
            ) : articles.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No matching knowledge articles found.</p>
            ) : (
              <div className="space-y-3">
                {articles.map((art) => (
                  <div
                    key={art._id}
                    className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-primary-300 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900 text-sm">{art.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {art.category}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{art.summary}</p>

                    {/* Acts and Sections */}
                    {art.actsAndSections?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {art.actsAndSections.map((sec, i) => (
                          <span key={i} className="bg-slate-100 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {sec}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Precedents Preview */}
                    {art.precedents?.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-150 text-xs text-purple-950">
                        <span className="font-bold block text-[11px]">
                          Landmark Precedent: {art.precedents[0].caseTitle} ({art.precedents[0].year})
                        </span>
                        <p className="text-[11px] text-purple-900 mt-0.5">{art.precedents[0].rulingSummary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
