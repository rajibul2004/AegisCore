import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { evidenceService } from '../../api/evidenceService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  FileText, Search, ChevronLeft, ChevronRight, AlertCircle, 
  Loader2, Image as ImageIcon, File, Film, Music, ShieldAlert, Download, Trash2, Database
} from 'lucide-react';

const EvidenceLocker = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (user && user.role === 'public') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await evidenceService.getAllEvidence({ 
        page, 
        limit: 12,
        search: debouncedSearch 
      });
      setEvidenceList(data.data);
      setTotalPages(data.pagination.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load evidence locker.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: Destroying evidence is a restricted action. Are you sure?")) return;
    try {
      await evidenceService.deleteEvidence(id);
      setEvidenceList(evidenceList.filter(e => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete evidence.");
    }
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <File className="w-8 h-8" />;
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Film className="w-8 h-8 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-8 h-8 text-pink-500" />;
    return <FileText className="w-8 h-8 text-indigo-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-950 via-slate-900 to-black rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-cyan-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs">Secure Vault</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">Master Evidence Locker</h1>
            <p className="text-cyan-200/70 text-lg max-w-xl font-medium">Global repository of all physical and digital evidence securely attached to active cases.</p>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search evidence by title or description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full h-16 w-16 animate-pulse"></div>
              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin relative z-10" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl text-center flex flex-col items-center shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-2xl font-bold text-red-500 mb-2">Vault Access Denied</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <button onClick={fetchEvidence} className="px-6 py-2.5 bg-red-500/20 text-red-500 font-bold rounded-xl">Retry Connection</button>
          </div>
        ) : evidenceList.length === 0 ? (
          <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl p-16 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl text-center flex flex-col items-center">
            <div className="bg-cyan-500/10 p-6 rounded-full mb-6">
              <Database className="w-16 h-16 text-cyan-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Vault Empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
              {debouncedSearch ? "No evidence items match your query." : "No digital evidence has been uploaded to the system yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {evidenceList.map((item) => (
                <div 
                  key={item._id} 
                  className="group bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all overflow-hidden flex flex-col relative"
                >
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <a 
                      href={`http://localhost:5000${item.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                      title="Download Evidence"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="p-2 bg-red-500/80 backdrop-blur-md border border-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Destroy Evidence"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="h-48 bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-cyan-500/5 transition-colors">
                    {item.mimeType?.startsWith('image/') ? (
                      <img src={`http://localhost:5000${item.fileUrl}`} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <>
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transform group-hover:scale-110 transition-transform">
                          {getFileIcon(item.mimeType)}
                        </div>
                        <p className="mt-4 text-xs font-bold text-gray-500 tracking-widest uppercase">{item.originalName?.split('.').pop() || 'FILE'}</p>
                      </>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-auto">
                      <h3 className="font-black text-lg text-gray-900 dark:text-white truncate mb-1">{item.title}</h3>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Linked Case</p>
                        <Link to={`/cases/${item.caseId?._id}`} className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                          {item.caseId?.caseNumber || 'Unknown'}
                        </Link>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Size</p>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatFileSize(item.size)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Logged By</p>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.uploadedBy?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl rounded-[1.5rem] border border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EvidenceLocker;
