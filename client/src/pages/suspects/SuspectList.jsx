import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { suspectService } from '../../api/suspectService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  UserX, Filter, Search, ChevronLeft, ChevronRight, AlertCircle, 
  Plus, Fingerprint, Loader2, Link as LinkIcon
} from 'lucide-react';

const SuspectList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
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

  const fetchSuspects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await suspectService.getSuspects(page, 12, { 
        status: statusFilter, 
        search: debouncedSearch 
      });
      setSuspects(data.data);
      setTotalPages(data.pagination.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suspects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuspects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, statusFilter]);

  const getStatusConfig = (status) => {
    const configs = {
      unknown: { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
      under_surveillance: { color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
      wanted: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
      apprehended: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
      cleared: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
    };
    return configs[status] || configs.unknown;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        
        <div className="relative overflow-hidden bg-gradient-to-br from-red-950 via-gray-900 to-black rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-red-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-400 font-bold tracking-widest uppercase text-xs">Criminal Database</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">Suspect Matrix</h1>
              <p className="text-red-200/70 text-lg max-w-xl font-medium">Track criminal profiles, aliases, demographic data, and active case links.</p>
            </div>
            
            <Link 
              to="/suspects/new"
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-500/30 hover:-translate-y-1 transition-all flex items-center border border-red-500/50"
            >
              <Plus className="w-5 h-5 mr-2" />
              Register Profile
            </Link>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by suspect name, alias, or demographics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hidden sm:block">
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-auto px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer appearance-none transition-all"
            >
              <option value="">All Statuses</option>
              <option value="unknown">Unknown Location</option>
              <option value="under_surveillance">Under Surveillance</option>
              <option value="wanted">Active Warrant (Wanted)</option>
              <option value="apprehended">In Custody</option>
              <option value="cleared">Cleared of Charges</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full h-16 w-16 animate-pulse"></div>
              <Loader2 className="w-12 h-12 text-red-500 animate-spin relative z-10" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl text-center flex flex-col items-center shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-2xl font-bold text-red-500 mb-2">Sync Error</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <button onClick={fetchSuspects} className="px-6 py-2.5 bg-red-500/20 text-red-500 font-bold rounded-xl">Try Again</button>
          </div>
        ) : suspects.length === 0 ? (
          <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl p-16 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl text-center flex flex-col items-center">
            <div className="bg-red-500/10 p-6 rounded-full mb-6">
              <UserX className="w-16 h-16 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Profiles Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
              {debouncedSearch || statusFilter ? "No suspects match your current search criteria." : "The suspect database is currently empty."}
            </p>
            {(debouncedSearch || statusFilter) && (
              <button onClick={() => {setStatusFilter(''); setSearchQuery('');}} className="text-red-600 font-bold hover:underline">Clear Search Filters</button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suspects.map((suspect) => {
                const sCfg = getStatusConfig(suspect.status);
                
                return (
                  <Link 
                    key={suspect._id} 
                    to={`/suspects/${suspect._id}`}
                    className="group bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-lg hover:shadow-red-500/10 hover:border-red-500/30 transition-all overflow-hidden flex flex-col"
                  >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700 shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                        <Fingerprint className="w-8 h-8 text-gray-400 dark:text-gray-600 absolute opacity-50" />
                        <span className="font-black text-2xl text-gray-500 dark:text-gray-400 relative z-10">{suspect.name.charAt(0).toUpperCase()}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-xl text-gray-900 dark:text-white truncate">{suspect.name}</h3>
                        {suspect.aliases && suspect.aliases.length > 0 ? (
                          <p className="text-xs font-bold text-gray-500 mt-1 truncate">a.k.a "{suspect.aliases[0]}"</p>
                        ) : (
                          <p className="text-xs font-medium text-gray-500 mt-1">No aliases known</p>
                        )}
                        <span className={`inline-block mt-3 px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${sCfg.bg} ${sCfg.color} ${sCfg.border}`}>
                          {suspect.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50/50 dark:bg-gray-950/30 flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Gender</p>
                        <p className="font-bold text-gray-900 dark:text-gray-200 capitalize">{suspect.gender || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Age / DOB</p>
                        <p className="font-bold text-gray-900 dark:text-gray-200">{suspect.age ? `${suspect.age} yrs` : 'Unknown'}</p>
                      </div>
                      
                      <div className="col-span-2 mt-2 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <LinkIcon className="w-4 h-4 mr-2" />
                          <span className="text-sm font-bold">{suspect.caseCount || 0} Linked Cases</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
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

export default SuspectList;
