import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { suspectService } from '../../api/suspectService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { UserX, Filter, Search, ChevronLeft, ChevronRight, AlertCircle, Plus, Fingerprint } from 'lucide-react';

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
  
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    // If public tries to access this page, boot them out
    if (user && user.role === 'public') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSuspects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await suspectService.getSuspects(page, 10, debouncedSearch, statusFilter);
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
  }, [page, statusFilter, debouncedSearch]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'wanted': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-bold border border-red-200 dark:border-red-800';
      case 'apprehended': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cleared': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'under_surveillance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center">
            <Fingerprint className="w-6 h-6 mr-2 text-indigo-500" />
            Suspect Database
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track persons of interest across multiple cases.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link 
            to="/suspects/new" 
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Suspect
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by suspect name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400 hidden sm:block" />
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="unknown">Unknown</option>
            <option value="under_surveillance">Under Surveillance</option>
            <option value="wanted">Wanted</option>
            <option value="apprehended">Apprehended</option>
            <option value="cleared">Cleared</option>
          </select>
        </div>
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
          <button onClick={fetchSuspects} className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-white rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition">Try Again</button>
        </div>
      ) : suspects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center flex flex-col items-center">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
            <UserX className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Suspects Found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {debouncedSearch || statusFilter ? "No suspects match your current search/filter criteria." : "The suspect database is currently empty."}
          </p>
          {(debouncedSearch || statusFilter) && (
            <button onClick={() => {setStatusFilter(''); setSearchQuery('');}} className="mt-4 text-indigo-600 font-medium hover:underline">Clear Filters</button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">Suspect Name & Aliases</th>
                  <th className="px-6 py-4">Demographics</th>
                  <th className="px-6 py-4">Linked Cases</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {suspects.map((suspect) => (
                  <tr key={suspect._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">{suspect.name}</p>
                      {suspect.aliases && suspect.aliases.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[200px]">
                          a.k.a {suspect.aliases.join(', ')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {suspect.gender}{suspect.age ? `, ${suspect.age} yo` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1">{suspect.caseCount}</span> 
                        <span className="text-gray-500 dark:text-gray-400">cases</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(suspect.status)}`}>
                        {suspect.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/suspects/${suspect._id}`}
                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg inline-block"
                      >
                        Open File
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

export default SuspectList;
