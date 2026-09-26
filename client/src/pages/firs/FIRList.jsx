import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firService } from '../../api/firService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FileText, Filter, Search, ChevronLeft, ChevronRight, AlertCircle, Plus, Calendar, MapPin, Hash } from 'lucide-react';

const FIRList = () => {
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
      setError(null);
      const data = await firService.getFIRs(page, 10, {
        ...filters,
        search: debouncedSearch
      });
      setFirs(data.data);
      setTotalPages(data.pagination.pages || 1);
      setTotalCount(data.pagination.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load FIRs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFIRs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, filters.status, filters.startDate, filters.endDate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Trigger search explicitly for text fields other than main search
  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFIRs();
  };

  const clearFilters = () => {
    setFilters({
      search: '', firNumber: '', status: '', location: '', startDate: '', endDate: ''
    });
    setPage(1);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'registered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'investigating': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center">
            <FileText className="w-6 h-6 mr-2 text-indigo-500" />
            First Information Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {totalCount > 0 ? `Showing ${totalCount} records` : 'Manage and track public complaints.'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link 
            to="/firs/new" 
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            File New FIR
          </Link>
        </div>
      </div>

      {/* Advanced Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              name="search"
              placeholder="Search title or description..." 
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border font-medium transition ${
              showFilters || Object.values(filters).some(v => v !== '' && v !== filters.search) 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400' 
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filter Accordion */}
        {showFilters && (
          <form onSubmit={applyFilters} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center"><Hash className="w-3 h-3 mr-1"/> FIR Number</label>
              <input 
                type="text" name="firNumber" value={filters.firNumber} onChange={handleFilterChange} placeholder="e.g. FIR-2026..."
                className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1"/> Location</label>
              <input 
                type="text" name="location" value={filters.location} onChange={handleFilterChange} placeholder="City, Street..."
                className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Status</label>
              <select 
                name="status" value={filters.status} onChange={handleFilterChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="registered">Registered</option>
                <option value="investigating">Investigating</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Start Date</label>
                <input 
                  type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                <input 
                  type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                />
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2 mt-2">
              <button type="button" onClick={clearFilters} className="px-4 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">Clear</button>
              <button type="submit" className="px-4 py-1.5 text-sm font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">Apply Search</button>
            </div>
          </form>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading Database...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800 text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Database Error</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          <button onClick={fetchFIRs} className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-white rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition">Try Again</button>
        </div>
      ) : firs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center flex flex-col items-center">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
            <FileText className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No FIRs Found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
            No records match your search criteria, or the database is currently empty.
          </p>
          <button onClick={clearFilters} className="text-indigo-600 font-medium hover:underline">Clear All Filters</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">FIR Number & Details</th>
                  <th className="px-6 py-4">Date & Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {firs.map((fir) => (
                  <tr key={fir._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">{fir.firNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[200px]">{fir.title}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <div className="text-sm">{new Date(fir.incidentDate).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{fir.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(fir.status)}`}>
                        {fir.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/firs/${fir._id}`}
                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg inline-block transition"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default FIRList;
