import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { caseService } from '../../api/caseService';
import { userService } from '../../api/userService';
import { aiService } from '../../api/aiService';
import { AuthContext } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EvidenceManager from '../../components/evidence/EvidenceManager';
import ReportManager from '../../components/reports/ReportManager';
import { 
  ArrowLeft, FileText, User, Shield, 
  Clock, AlertCircle, Edit, Trash2, Check, Loader2, Zap, BrainCircuit, Users, Target, Search, FileSignature, Link2
} from 'lucide-react';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [investigationCase, setInvestigationCase] = useState(null);
  const [policeOfficers, setPoliceOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [closureReason, setClosureReason] = useState('');

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchDetailsAndOfficers = async () => {
      try {
        setLoading(true);
        const [caseRes, usersRes] = await Promise.all([
          caseService.getCaseById(id),
          (user.role === 'admin' || user.role === 'police') ? userService.getUsers() : Promise.resolve({ data: [] })
        ]);
        
        setInvestigationCase(caseRes.data);
        setStatus(caseRes.data.status);
        setPriority(caseRes.data.priority);
        setAssignedOfficer(caseRes.data.assignedOfficer?._id || '');
        setClosureReason(caseRes.data.closureReason || '');
        
        const officers = (usersRes.data || []).filter(u => u.role === 'police' || u.role === 'admin');
        setPoliceOfficers(officers);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load Case details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetailsAndOfficers();
  }, [id, user.role]);

  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const updateData = { status, priority };
      if (assignedOfficer) updateData.assignedOfficer = assignedOfficer;
      if (closureReason) updateData.closureReason = closureReason;
      
      const res = await caseService.updateCase(id, updateData);
      setInvestigationCase(res.data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update case');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await caseService.deleteCase(id);
      navigate('/cases');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete case');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAIAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const res = await aiService.analyzeCase(investigationCase);
      setAiAnalysis(res.data.analysis);
    } catch (err) {
      alert(err.response?.data?.message || 'AI Analysis Failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full h-16 w-16 animate-pulse"></div>
            <Loader2 className="animate-spin text-emerald-500 h-10 w-10 relative z-10" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !investigationCase) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl max-w-md w-full text-center shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <Link to="/cases" className="inline-flex items-center px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all duration-300">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Cases
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusConfig = (s) => {
    const configs = {
      pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/20' },
      registered: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-blue-500/20' },
      under_investigation: { color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/20' },
      solved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/20' },
      closed: { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', glow: 'shadow-gray-500/20' }
    };
    return configs[s] || configs.pending;
  };

  const getPriorityConfig = (p) => {
    const configs = {
      low: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
      medium: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
      high: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
      critical: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
    };
    return configs[p] || configs.low;
  };

  const canEdit = user?.role === 'police' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';
  const statusCfg = getStatusConfig(investigationCase.status);
  const priorityCfg = getPriorityConfig(investigationCase.priority);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link to="/cases" className="group flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-semibold tracking-wide">Back to Case Directory</span>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {canEdit && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl font-semibold transition-all"
              >
                <Edit className="w-4 h-4 mr-2" /> Modify Case
              </button>
            )}
            {canDelete && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl font-semibold transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            )}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="bg-red-500/10 backdrop-blur-md p-6 rounded-3xl border border-red-500/20 shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)] flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="bg-red-500/20 p-4 rounded-2xl text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-red-600 dark:text-red-400">Confirm Deletion</h4>
                <p className="text-red-500/80">Permanent removal of case {investigationCase.caseNumber}. This action is irreversible.</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                Abort
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 sm:flex-none px-6 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Purge'}
              </button>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="bg-emerald-500/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-lg mb-6 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-500">
                <FileSignature className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Case Administration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 ml-1">Investigation Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
                >
                  <option value="pending">Pending Assignment</option>
                  <option value="registered">Registered</option>
                  <option value="under_investigation">Active Investigation</option>
                  <option value="solved">Solved</option>
                  <option value="closed">Closed / Cold</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 ml-1">Threat / Priority Level</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 ml-1">Assigned Lead Officer</label>
                <select 
                  value={assignedOfficer} 
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
                >
                  <option value="">Unassigned</option>
                  {policeOfficers.map(officer => (
                    <option key={officer._id} value={officer._id}>{officer.name} ({officer.role})</option>
                  ))}
                </select>
              </div>
            </div>

            {(status === 'closed' || status === 'solved') && (
              <div className="mb-6 space-y-2 animate-in fade-in zoom-in-95">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 ml-1">Closure Summary / Resolution</label>
                <textarea 
                  value={closureReason} 
                  onChange={(e) => setClosureReason(e.target.value)}
                  placeholder="Provide official rationale for closing or solving this case..."
                  rows="3"
                  className="w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                ></textarea>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-6 border-t border-emerald-500/20">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={updateLoading}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center"
              >
                {updateLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><Check className="w-5 h-5 mr-2" /> Commit Changes</>}
              </button>
            </div>
          </div>
        )}

        {/* AI Analysis Modal / Card */}
        {canEdit && (
          <div className="bg-indigo-500/5 backdrop-blur-xl rounded-[2.5rem] border border-indigo-500/20 shadow-xl p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-500 border border-indigo-500/30">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Groq AI Case Analyzer</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium">Generate tactical breakdowns, locate logical gaps, and recommend next steps.</p>
                </div>
              </div>
              
              <button 
                onClick={handleAIAnalysis}
                disabled={isAnalyzing}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/30 hover:-translate-y-1 transition-all flex items-center justify-center min-w-[220px]"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing Neural Net...</>
                ) : (
                  <><Zap className="w-5 h-5 mr-2" /> Run AI Analysis</>
                )}
              </button>
            </div>

            {aiAnalysis && (
              <div className="mt-8 pt-8 border-t border-indigo-500/20 animate-in slide-in-from-bottom-4">
                <h4 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Target className="w-4 h-4" /> Tactical Intelligence Output</h4>
                <div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-950/50 p-6 rounded-2xl border border-indigo-500/10 text-gray-800 dark:text-gray-200 font-medium leading-relaxed whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-full h-2 ${statusCfg.bg}`}></div>
              
              <div className="p-8 sm:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-mono font-bold tracking-wider">
                    {investigationCase.caseNumber}
                  </span>
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-bold tracking-wider uppercase border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} shadow-sm ${statusCfg.glow}`}>
                    {investigationCase.status.replace('_', ' ')}
                  </span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                  {investigationCase.title}
                </h1>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 text-gray-800 dark:text-gray-200 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                  {investigationCase.description}
                </div>

                {investigationCase.closureReason && (
                  <div className="mt-6 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-2">Closure Rationale</h4>
                    <p className="text-gray-700 dark:text-gray-300 font-medium italic">{investigationCase.closureReason}</p>
                  </div>
                )}
              </div>
            </div>

            {canEdit && (
              <EvidenceManager 
                caseId={investigationCase._id} 
                assignedOfficerId={investigationCase.assignedOfficer?._id}
              />
            )}
            
            {canEdit && (
              <ReportManager 
                caseId={investigationCase._id} 
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Case Metadata</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Threat Priority</p>
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-bold uppercase border ${priorityCfg.bg} ${priorityCfg.color} ${priorityCfg.border}`}>
                    {investigationCase.priority}
                  </span>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Origin FIR Link</p>
                  <Link 
                    to={`/firs/${investigationCase.fir?._id}`}
                    className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 p-3 rounded-xl hover:bg-indigo-500/20 transition-colors"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    {investigationCase.fir?.firNumber || 'Unknown FIR'}
                  </Link>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Last Modified</p>
                  <div className="flex items-center text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <Clock className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                    {new Date(investigationCase.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Personnel</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Lead Investigator</p>
                  {investigationCase.assignedOfficer ? (
                    <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-4 shadow-lg shadow-blue-500/30 shrink-0">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{investigationCase.assignedOfficer.name}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                          ID: {investigationCase.assignedOfficer.badgeNumber || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed text-center">
                      <Shield className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2 opacity-50" />
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Awaiting Officer Assignment</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Linked Suspects</p>
                  {investigationCase.suspects && investigationCase.suspects.length > 0 ? (
                    <div className="space-y-3">
                      {investigationCase.suspects.map(suspect => (
                        <Link 
                          key={suspect._id} 
                          to={`/suspects/${suspect._id}`}
                          className="flex items-center bg-red-500/5 hover:bg-red-500/10 p-3 rounded-xl border border-red-500/10 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center font-bold mr-3">
                            <User className="w-4 h-4" />
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{suspect.name}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed text-center">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No suspects linked yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CaseDetails;
