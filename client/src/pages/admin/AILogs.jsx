import { useState, useEffect } from 'react';
import { aiService } from '../../api/aiService';
import { Activity, Server, AlertTriangle, ShieldCheck, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AILogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await aiService.getLogs({ limit: 50 });
      setLogs(res.data);
    } catch (err) {
      setError('Failed to fetch AI logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'timeout': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'rate_limited': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Activity className="w-6 h-6 mr-2 text-indigo-500" /> AI Activity Logs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Audit log of all AI generations and requests across the system.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Tokens (P/R)</th>
                <th className="px-6 py-4">Time (ms)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center"><Zap className="w-6 h-6 animate-pulse text-indigo-500" /></div>
                    <p className="mt-2">Loading logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No AI activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs mr-2">
                          {log.user?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">{log.user?.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500 uppercase">{log.user?.role || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                        {log.action}
                      </span>
                      {log.caseId && (
                        <p className="text-xs text-indigo-500 mt-1">
                          <Link to={`/cases/${log.caseId._id}`} className="hover:underline">Case: {log.caseId.caseNumber}</Link>
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      <span title="Prompt Tokens" className="text-blue-600 dark:text-blue-400 font-medium">{log.promptTokens || 0}</span>
                      {' / '}
                      <span title="Response Tokens" className="text-purple-600 dark:text-purple-400 font-medium">{log.responseTokens || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-gray-400" />
                        {log.processingTimeMs}ms
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                        {log.status.replace('_', ' ')}
                      </span>
                      {log.errorMessage && (
                        <p className="text-xs text-red-500 mt-1 truncate max-w-[150px]" title={log.errorMessage}>
                          {log.errorMessage}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AILogs;
