import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { caseService } from '../../api/caseService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Briefcase, Filter, Search, ChevronLeft, ChevronRight, AlertCircle, Plus } from 'lucide-react';

const CaseList = () => {
  const { user } = useContext(AuthContext);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await caseService.getCases(page, 10, statusFilter, priorityFilter);
      setCases(data.data);
      setTotalPages(data.pagination.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [page, statusFilter, priorityFilter]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'registered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'under_investigation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'solved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'text-red-600 dark:text-red-400 font-bold';
      case 'high': return 'text-orange-600 dark:text-orange-400 font-bold';
      case 'medium': return 'text-blue-600 dark:text-blue-400 font-semibold';
      case 'low': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Case Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage active investigations.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          {(user?.role === 'police' || user?.role === 'admin') && (
            <Link 
              to="/cases/new" 
              className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Open New Case
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Cases (Coming soon)..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            disabled
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center w-full sm:w-auto">
            <Filter className="w-5 h-5 text-gray-400 mr-2 hidden sm:block" />
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="pending">Pending Court</option>
              <option value="solved">Solved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Area */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading Cases...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800 text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Error Loading Data</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          <button onClick={fetchCases} className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-white rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition">Try Again</button>
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center flex flex-col items-center">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
            <Briefcase className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Cases Found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {statusFilter ? "No cases match your current filter criteria." : "There are no active cases in the system yet."}
          </p>
          {statusFilter && (
            <button onClick={() => setStatusFilter('')} className="mt-4 text-indigo-600 font-medium hover:underline">Clear Filters</button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">Case / FIR</th>
                  <th className="px-6 py-4">Title / Priority</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {cases.map((invCase) => (
                  <tr key={invCase._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">{invCase.caseNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{invCase.fir?.firNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{invCase.title}</p>
                      <p className={`text-xs mt-0.5 uppercase tracking-wide ${getPriorityColor(invCase.priority)}`}>
                        {invCase.priority} Priority
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {invCase.assignedOfficer ? invCase.assignedOfficer.name : <span className="italic text-gray-400">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(invCase.status)}`}>
                        {invCase.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/cases/${invCase._id}`}
                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg inline-block"
                      >
                        Open Case
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
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

export default CaseList;
