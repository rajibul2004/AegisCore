import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { caseService } from '../../api/caseService';
import { userService } from '../../api/userService';
import { aiService } from '../../api/aiService';
import { AuthContext } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Briefcase, Filter, Search, ChevronLeft, ChevronRight, AlertCircle, 
  Calendar, Hash, Zap, Loader2, X, BrainCircuit, Target, Shield, User, FileText
} from 'lucide-react';

const CaseList = () => {
  const { user } = useContext(AuthContext);
  
  const [cases, setCases] = useState([]);
  const [policeOfficers, setPoliceOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '', caseNumber: '', firNumber: '', status: '', priority: '', startDate: '', endDate: ''
  });
  
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // AI Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingCaseId, setAnalyzingCaseId] = useState(null);

  // Quick Action State
  const [updatingCaseId, setUpdatingCaseId] = useState(null);

  const canEdit = user?.role === 'admin' || user?.role === 'police';

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchCasesAndOfficers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [caseData, usersRes] = await Promise.all([
        caseService.getCases(page, 10, { ...filters, search: debouncedSearch }),
        canEdit ? userService.getUsers() : Promise.resolve({ data: [] })
      ]);
      setCases(caseData.data);
      setTotalPages(caseData.pagination.pages || 1);
      setTotalCount(caseData.pagination.total || 0);
      
      const officers = (usersRes.data || []).filter(u => u.role === 'police' || u.role === 'admin');
      setPoliceOfficers(officers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasesAndOfficers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, filters.status, filters.priority, filters.startDate, filters.endDate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCasesAndOfficers();
  };

  const clearFilters = () => {
    setFilters({
      search: '', caseNumber: '', firNumber: '', status: '', priority: '', startDate: '', endDate: ''
    });
    setPage(1);
  };

  const quickUpdateCase = async (caseId, updateData) => {
    try {
      setUpdatingCaseId(caseId);
      await caseService.updateCase(caseId, updateData);
      setCases(cases.map(c => c._id === caseId ? { ...c, ...updateData } : c));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update case');
    } finally {
      setUpdatingCaseId(null);
    }
  };

  const runInlineAiAnalysis = async (caseData) => {
    try {
      setAnalyzingCaseId(caseData._id);
      setShowAiModal(true);
      setAiAnalysis(null);
      const res = await aiService.analyzeCase(caseData);
      setAiAnalysis(res.data.analysis);
    } catch (err) {
      setAiAnalysis('ERROR: ' + (err.response?.data?.message || 'AI Analysis Failed'));
    } finally {
      setAnalyzingCaseId(null);
    }
  };

  const getStatusConfig = (s) => {
    const configs = {
      pending: { color: 'text-amber-500', bg: 'bg-amber-500/10' },
      registered: { color: 'text-blue-500', bg: 'bg-blue-500/10' },
      under_investigation: { color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
      solved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      closed: { color: 'text-gray-500', bg: 'bg-gray-500/10' }
    };
    return configs[s] || configs.pending;
  };

  const getPriorityConfig = (p) => {
    const configs = {
      low: { color: 'text-slate-400', border: 'border-slate-500/20' },
      medium: { color: 'text-blue-400', border: 'border-blue-500/20' },
      high: { color: 'text-orange-500', border: 'border-orange-500/20' },
      critical: { color: 'text-red-500', border: 'border-red-500/20' }
    };
    return configs[p] || configs.low;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-indigo-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs">Active Registry</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">Case Directory</h1>
              <p className="text-indigo-200 text-lg max-w-xl font-medium">Browse, manage, and analyze active investigations across the network.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setShowFilters(!showFilters)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold backdrop-blur-md transition-all flex items-center border border-white/10">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl animate-in slide-in-from-top-4">
            <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-full lg:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  name="search"
                  placeholder="Global search cases..." 
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none">
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="registered">Registered</option>
                  <option value="under_investigation">Active Investigation</option>
                  <option value="solved">Solved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <select name="priority" value={filters.priority} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none">
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex justify-end col-span-full gap-2">
                <button type="button" onClick={clearFilters} className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">Clear</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh] animate-in fade-in duration-500">
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full h-24 w-24 animate-pulse"></div>
              <img src="/favicon.png" alt="Loading" className="h-16 w-16 animate-bounce relative z-10 drop-shadow-2xl opacity-90" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl text-center flex flex-col items-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-2xl font-bold text-red-500 mb-2">Sync Error</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <button onClick={fetchCasesAndOfficers} className="px-6 py-2.5 bg-red-500/20 text-red-500 font-bold rounded-xl">Try Again</button>
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl p-16 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl text-center flex flex-col items-center">
            <div className="bg-indigo-500/10 p-6 rounded-full mb-6">
              <Briefcase className="w-16 h-16 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Records Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">No cases match your filters or the system is empty.</p>
            <button onClick={clearFilters} className="text-indigo-600 font-bold hover:underline">Reset Filters</button>
          </div>
        ) : (
          <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
            <div className="flex flex-col divide-y divide-gray-50 dark:divide-white/[0.02]">
              {/* Header (Hidden on Mobile) */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 dark:bg-gray-950/50 text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 tracking-widest border-b border-gray-100 dark:border-gray-800">
                <div className="col-span-4 pl-2">Case Identifier</div>
                <div className="col-span-3">Lead Officer</div>
                <div className="col-span-3">Status & Priority</div>
                <div className="col-span-2 text-right pr-2">Actions & AI</div>
              </div>

              {/* Rows */}
              {cases.map((c) => {
                const statusCfg = getStatusConfig(c.status);
                const priorityCfg = getPriorityConfig(c.priority);
                const isUpdating = updatingCaseId === c._id;
                const isAnalyzing = analyzingCaseId === c._id;
                
                return (
                  <div key={c._id} className={`flex flex-col sm:grid sm:grid-cols-12 gap-4 px-4 sm:px-6 py-5 group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                    
                    {/* Case Identifier Block */}
                    <div className="col-span-4 flex flex-col justify-center">
                      <div className="flex justify-between sm:block mb-1">
                        <Link to={`/cases/${c._id}`} className="block hover:underline decoration-indigo-500/30 underline-offset-4">
                          <p className="font-black text-gray-900 dark:text-white text-lg">{c.caseNumber}</p>
                        </Link>
                        
                        {/* Mobile-only Status Badges */}
                        <div className="sm:hidden flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${priorityCfg.color} ${priorityCfg.border}`}>
                            {c.priority}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase ${statusCfg.bg} ${statusCfg.color}`}>
                            {c.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-[10px] font-bold font-mono uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                          {c.fir?.firNumber || 'NO FIR'}
                        </span>
                      </div>
                      
                      <Link to={`/cases/${c._id}`} className="block hover:underline decoration-indigo-500/30 underline-offset-4 mb-2 sm:mb-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-2 max-w-sm">{c.title}</p>
                      </Link>

                      {/* Mobile-only Lead Officer */}
                      <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Lead Officer</p>
                        {canEdit ? (
                          <div className="relative">
                            <select 
                              value={c.assignedOfficer?._id || ''} 
                              onChange={(e) => quickUpdateCase(c._id, { assignedOfficer: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Unassigned</option>
                              {policeOfficers.map(officer => (
                                <option key={officer._id} value={officer._id}>{officer.name}</option>
                              ))}
                            </select>
                            <Shield className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]">
                              {c.assignedOfficer ? c.assignedOfficer.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                            </div>
                            <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                              {c.assignedOfficer ? c.assignedOfficer.name : 'Unassigned'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop Lead Officer */}
                    <div className="hidden sm:flex col-span-3 items-center">
                      {canEdit ? (
                        <div className="relative w-full pr-4">
                          <select 
                            value={c.assignedOfficer?._id || ''} 
                            onChange={(e) => quickUpdateCase(c._id, { assignedOfficer: e.target.value })}
                            className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Unassigned</option>
                            {policeOfficers.map(officer => (
                              <option key={officer._id} value={officer._id}>{officer.name}</option>
                            ))}
                          </select>
                          <Shield className="w-4 h-4 text-gray-400 absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                            {c.assignedOfficer ? c.assignedOfficer.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                          </div>
                          <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                            {c.assignedOfficer ? c.assignedOfficer.name : 'Unassigned'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Desktop Status & Priority */}
                    <div className="hidden sm:flex col-span-3 flex-col justify-center items-start gap-2">
                      {canEdit ? (
                        <select 
                          value={c.status}
                          onChange={(e) => quickUpdateCase(c._id, { status: e.target.value })}
                          className={`text-xs font-bold uppercase rounded-lg px-2 py-1 outline-none border cursor-pointer ${statusCfg.color} ${statusCfg.bg} border-transparent hover:border-current transition-colors appearance-none text-center`}
                        >
                          <option value="pending">Pending</option>
                          <option value="registered">Registered</option>
                          <option value="under_investigation">Active Investigation</option>
                          <option value="solved">Solved</option>
                          <option value="closed">Closed</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center w-max px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${statusCfg.bg} ${statusCfg.color}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      )}
                      <span className={`inline-flex items-center w-max px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityCfg.color} ${priorityCfg.border}`}>
                        {c.priority} Priority
                      </span>
                    </div>

                    {/* Actions & AI */}
                    <div className="col-span-2 flex sm:justify-end items-center mt-2 sm:mt-0 gap-2 border-t sm:border-0 border-gray-100 dark:border-gray-800/50 pt-3 sm:pt-0">
                      {canEdit && (
                        <button 
                          onClick={() => runInlineAiAnalysis(c)}
                          disabled={isAnalyzing}
                          title="Run Groq AI Analysis"
                          className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-xl transition-all hover:scale-110 hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)] flex-shrink-0"
                        >
                          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                        </button>
                      )}
                      <Link 
                        to={`/cases/${c._id}`}
                        className="px-4 py-2.5 w-full sm:w-auto text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-xl transition-colors inline-block"
                      >
                        Open Dossier
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
            
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/30 dark:bg-gray-950/30">
                <span className="text-sm font-bold text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Modal Overlay */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-[2.5rem] border border-indigo-500/30 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="p-6 border-b border-indigo-500/20 flex justify-between items-center bg-slate-900/80 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white">Groq AI Analysis</h3>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto relative z-10">
              {!aiAnalysis ? (
                <div className="flex flex-col items-center justify-center py-12 text-indigo-400">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="font-bold animate-pulse">Running Neural Inference...</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <h4 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Tactical Intelligence Output
                  </h4>
                  <div className="bg-black/20 p-6 rounded-2xl border border-indigo-500/10 text-gray-200 font-medium leading-relaxed whitespace-pre-wrap">
                    {aiAnalysis}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-indigo-500/20 bg-slate-900/80 backdrop-blur-md relative z-10 flex justify-end">
              <button 
                onClick={() => setShowAiModal(false)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
              >
                Close Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CaseList;
