import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { firService } from '../../api/firService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FileText, Filter, Search, ChevronLeft, ChevronRight, AlertCircle, Plus, Calendar, MapPin, Hash, ShieldCheck, X, Loader2 } from 'lucide-react';

const FIRList = () => {
  const routerLocation = useLocation();
  const isMySubmissions = routerLocation.pathname === '/my-firs';

  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    firNumber: '',
    status: '',
    location: '',
    startDate: '',
    endDate: ''
  });
  
  // Debounce global search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchFIRs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...filters,
        search: debouncedSearch
      };
      
      const res = await firService.getFIRs(params);
      setFirs(res.data);
      setTotalPages(res.pagination.pages);
      setTotalCount(res.pagination.total);
    } catch (err) {
      setError('Failed to fetch FIRs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFIRs();
  }, [page, debouncedSearch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFIRs();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      firNumber: '',
      status: '',
      location: '',
      startDate: '',
      endDate: ''
    });
    setDebouncedSearch('');
    setPage(1);
  };

  const getStatusBadge = (status) => {
    const styles = {
      registered: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      investigating: 'bg-purple-50 text-purple-700 ring-purple-600/20',
      closed: 'bg-green-50 text-green-700 ring-green-600/20',
      rejected: 'bg-red-50 text-red-700 ring-red-600/20'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ring-1 ${styles[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-[90rem] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Premium Header Area */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center">
            <div className="p-3 mr-5 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl shadow-[inset_0_0_0_1px_rgba(79,70,229,0.2)]">
              {isMySubmissions ? (
                <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
              ) : (
                <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                {isMySubmissions ? 'My Submissions' : 'FIR Registry'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                {isMySubmissions 
                  ? 'Track the status of First Information Reports you have filed.'
                  : 'Central repository of all First Information Reports in the jurisdiction.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-5 py-3 border rounded-xl text-sm font-bold shadow-sm transition-all duration-200 ${
                showFilters 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400' 
                  : 'bg-white dark:bg-[#0A0A0B] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-indigo-500 dark:hover:border-indigo-500'
              }`}
            >
              {showFilters ? <X className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
              {showFilters ? 'Close Filters' : 'Advanced Filters'}
            </button>
            <Link 
              to="/firs/new" 
              className="flex items-center px-5 py-3 rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 mr-1" /> File New FIR
            </Link>
          </div>
        </div>

        {/* Global Search Bar (Quick Search) */}
        <div className="mb-6 group">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={2} />
            </div>
            <input 
              type="text" 
              placeholder="Quick search by Title or Keywords..." 
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* Advanced Filters Drawer */}
        {showFilters && (
          <form onSubmit={handleFilterSubmit} className="mb-8 p-6 bg-white dark:bg-[#0A0A0B] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2">FIR Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" name="firNumber" value={filters.firNumber} onChange={handleFilterChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" name="location" value={filters.location} onChange={handleFilterChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2">Status</label>
                <select 
                  name="status" value={filters.status} onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="registered">Registered</option>
                  <option value="investigating">Investigating</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2">Start Date</label>
                  <input 
                    type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest mb-2">End Date</label>
                  <input 
                    type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4 border-t border-gray-100 dark:border-gray-800 pt-5">
              <button type="button" onClick={clearFilters} className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors">Reset</button>
              <button type="submit" className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition-colors">Apply Filters</button>
            </div>
          </form>
        )}

        {/* Data Container */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96 bg-white dark:bg-[#0A0A0B] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <Loader2 className="relative w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" strokeWidth={2} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase text-xs">Querying Intelligence Database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/10 p-10 rounded-[2rem] border border-red-100 dark:border-red-900/30 text-center flex flex-col items-center shadow-sm">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl font-black text-red-700 dark:text-red-400">Database Connection Failed</h3>
            <p className="text-red-600 dark:text-red-300 mt-2 font-medium max-w-md">{error}</p>
            <button onClick={fetchFIRs} className="mt-6 px-6 py-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors">Retry Connection</button>
          </div>
        ) : firs.length === 0 ? (
          <div className="bg-white dark:bg-[#0A0A0B] p-16 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-center flex flex-col items-center">
            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-6 rounded-[2rem] mb-6 shadow-[inset_0_0_0_1px_rgba(79,70,229,0.2)]">
              <FileText className="w-16 h-16 text-indigo-500 dark:text-indigo-400" strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">No Records Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 font-medium">
              We couldn't find any FIRs matching your current criteria. Try adjusting your search filters or file a new report.
            </p>
            <button onClick={clearFilters} className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Reset All Filters</button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0A0A0B] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500"></div>
            <div className="overflow-x-auto p-4 sm:p-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 tracking-widest border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-4 pl-4 font-black">FIR Details</th>
                    <th className="pb-4 font-black hidden sm:table-cell">Temporal & Spatial Data</th>
                    <th className="pb-4 font-black">Status</th>
                    <th className="pb-4 pr-4 font-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/[0.02]">
                  {firs.map((fir) => (
                    <tr key={fir._id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="py-5 pl-4 align-top">
                        <div className="flex items-start">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mr-4 mt-0.5 shadow-sm group-hover:scale-105 transition-transform">
                            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white font-mono text-sm tracking-tight mb-1">{fir.firNumber}</p>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 leading-snug line-clamp-2 max-w-sm">{fir.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 align-top hidden sm:table-cell">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-2 opacity-50" strokeWidth={2} />
                            {new Date(fir.incidentDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-start text-sm font-medium text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-2 opacity-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <span className="line-clamp-2 max-w-xs leading-tight">{fir.location?.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 align-top">
                        {getStatusBadge(fir.status)}
                      </td>
                      <td className="py-5 pr-4 align-top text-right">
                        <Link 
                          to={`/firs/${fir._id}`}
                          className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                        >
                          Open Dossier
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Premium Pagination */}
            {totalPages > 1 && (
              <div className="px-8 py-5 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Showing page <span className="font-bold text-gray-900 dark:text-white">{page}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-800 shadow-sm transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-800 shadow-sm transition-all"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
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

export default FIRList;
