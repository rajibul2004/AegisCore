import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { firService } from '../../api/firService';
import { userService } from '../../api/userService';
import { aiService } from '../../api/aiService';
import { AuthContext } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  ArrowLeft, Calendar, MapPin, User, Shield, Zap,
  Clock, AlertCircle, Edit, Trash2, Check, Loader2, Save, FileText, Activity, BrainCircuit, Target, X
} from 'lucide-react';

const FIRDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [policeOfficers, setPoliceOfficers] = useState([]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  useEffect(() => {
    const fetchFIRDetails = async () => {
      try {
        setLoading(true);
        const [res, usersRes] = await Promise.all([
          firService.getFIRById(id),
          (user?.role === 'admin' || user?.role === 'police') ? userService.getUsers() : Promise.resolve({ data: [] })
        ]);
        setFir(res.data);
        setStatus(res.data.status);
        setPriority(res.data.priority);
        setAssignedOfficer(res.data.assignedOfficer?._id || '');
        if (usersRes.data) {
          setPoliceOfficers(usersRes.data.filter(u => u.role === 'police'));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load FIR details');
      } finally {
        setLoading(false);
      }
    };
    fetchFIRDetails();
  }, [id, user?.role]);

  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const res = await firService.updateFIR(id, { 
        status, 
        priority, 
        assignedOfficer: assignedOfficer || null 
      });
      setFir(res.data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update FIR');
    } finally {
      setUpdateLoading(false);
    }
  };

  const runAiAnalysis = async () => {
    try {
      setShowAiModal(true);
      setAiAnalysis(null);
      // We pass the FIR data formatted as caseData
      const res = await aiService.analyzeCase({
        caseNumber: fir.firNumber,
        title: fir.title,
        description: fir.description,
        priority: fir.priority,
        status: fir.status
      });
      setAiAnalysis(res.data.analysis);
    } catch (err) {
      setAiAnalysis('ERROR: ' + (err.response?.data?.message || 'AI Analysis Failed'));
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await firService.deleteFIR(id);
      navigate('/firs');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete FIR');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full h-16 w-16 animate-pulse"></div>
            <Loader2 className="animate-spin text-blue-500 h-10 w-10 relative z-10" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !fir) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl max-w-md w-full text-center shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <Link to="/firs" className="inline-flex items-center px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all duration-300">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Registry
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
      investigating: { color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/20' },
      closed: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/20' },
      rejected: { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/20' }
    };
    return configs[s] || configs.pending;
  };

  const getPriorityConfig = (p) => {
    const configs = {
      low: { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
      medium: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
      high: { color: 'text-orange-600 dark:text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
      critical: { color: 'text-red-600 dark:text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
    };
    return configs[p] || configs.low;
  };

  const canEdit = user?.role === 'police' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';
  const statusCfg = getStatusConfig(fir.status);
  const priorityCfg = getPriorityConfig(fir.priority);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link to="/firs" className="group flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-semibold tracking-wide">Back to Registry</span>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {user?.role === 'admin' && (
              <button 
                onClick={runAiAnalysis}
                className="flex items-center justify-center px-4 py-2.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl font-bold transition-all shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)] hover:scale-105"
              >
                <Zap className="w-4 h-4 mr-2" /> Groq AI
              </button>
            )}
            {canEdit && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl font-semibold transition-all"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit Status
              </button>
            )}
            {canDelete && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl font-semibold transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            )}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="bg-red-50 dark:bg-red-900/20 backdrop-blur-md p-6 rounded-3xl border border-red-200 dark:border-red-800 shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)] flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-2xl text-red-600 dark:text-red-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-red-800 dark:text-red-300">Confirm Deletion</h4>
                <p className="text-red-600 dark:text-red-400">Permanent removal of {fir.firNumber}. This action is irreversible.</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 sm:flex-none px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Abort
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 sm:flex-none px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-red-600/50 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Purge'}
              </button>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="bg-blue-50 dark:bg-blue-900/10 backdrop-blur-xl p-6 rounded-3xl border border-blue-200 dark:border-blue-800 shadow-lg mb-6 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Update Case Status</h3>
            </div>
            
            <div className={`grid grid-cols-1 gap-6 mb-6 ${user?.role === 'admin' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 ml-1">Lifecycle Stage</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="pending">Pending Review</option>
                  <option value="registered">Officially Registered</option>
                  <option value="investigating">Active Investigation</option>
                  <option value="closed">Case Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 ml-1">Threat Level</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Emergency</option>
                </select>
              </div>
              {user?.role === 'admin' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 ml-1">Assign Officer</label>
                  <select 
                    value={assignedOfficer} 
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Unassigned</option>
                    {policeOfficers.map(officer => (
                      <option key={officer._id} value={officer._id}>{officer.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-blue-200 dark:border-gray-800">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={updateLoading}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center"
              >
                {updateLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Commit Changes</>}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-full h-2 ${statusCfg.bg}`}></div>
              
              <div className="p-8 sm:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-mono font-bold tracking-wider">
                    {fir.firNumber}
                  </span>
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-bold tracking-wider uppercase border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} shadow-sm ${statusCfg.glow}`}>
                    {fir.status}
                  </span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                  {fir.title}
                </h1>
                
                <div className="prose dark:prose-invert max-w-none">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 text-gray-800 dark:text-gray-200 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                    {fir.description}
                  </div>
                </div>

                {/* Attachments Section */}
                {fir.attachments && fir.attachments.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" /> Evidence & Attachments
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {fir.attachments.map((attachment, idx) => (
                        <a 
                          key={idx}
                          href={attachment.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors group"
                        >
                          {attachment.resourceType === 'image' ? (
                            <img src={attachment.url} alt={attachment.originalName || 'Attachment'} className="w-16 h-16 object-cover rounded-lg mb-3 shadow-sm group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                              <FileText className="w-8 h-8" />
                            </div>
                          )}
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 text-center truncate w-full px-2" title={attachment.originalName}>
                            {attachment.originalName || `Attachment ${idx + 1}`}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg group hover:border-blue-500/30 transition-colors">
                <div className="bg-blue-50 dark:bg-blue-900/30 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <MapPin className="w-7 h-7" />
                </div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Incident Zone</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{fir.location?.address}</p>
              </div>

              <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg group hover:border-indigo-500/30 transition-colors">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                  <Calendar className="w-7 h-7" />
                </div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Temporal Data</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {new Date(fir.incidentDate).toLocaleString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric', 
                    hour: 'numeric', minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Metadata</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Threat Level</p>
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-bold uppercase border ${priorityCfg.bg} ${priorityCfg.color} ${priorityCfg.border}`}>
                    {fir.priority}
                  </span>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">System Timestamp</p>
                  <div className="flex items-center text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <Clock className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                    {new Date(fir.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Entities</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Reporting Citizen</p>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold text-xl mr-4 shadow-inner">
                      {fir.isAnonymous ? 'A' : fir.complainant?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {fir.isAnonymous ? 'Anonymous' : fir.complainant?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                        {fir.isAnonymous ? 'Identity Protected' : fir.complainant?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Lead Investigator</p>
                  {fir.assignedOfficer ? (
                    <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-4 shadow-lg shadow-blue-500/30">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{fir.assignedOfficer.name}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                          ID: {fir.assignedOfficer.badgeNumber || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed text-center">
                      <Shield className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2 opacity-50" />
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Awaiting Assignment</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
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
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FIRDetails;
