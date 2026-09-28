import { useState, useEffect } from 'react';
import { auditService } from '../../api/auditService';
import { Activity, ShieldCheck, AlertTriangle, User, FileText, Briefcase, Server, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

const SystemAudit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filterAction) params.action = filterAction;
      const res = await auditService.getAuditLogs(params);
      setLogs(res.data);
    } catch (err) {
      setError('Failed to fetch system audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('login') || action.includes('logout')) return <User className="w-4 h-4 text-blue-500" />;
    if (action.includes('fir')) return <FileText className="w-4 h-4 text-orange-500" />;
    if (action.includes('case')) return <Briefcase className="w-4 h-4 text-purple-500" />;
    if (action.includes('ai')) return <Server className="w-4 h-4 text-indigo-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  return (
    <DashboardLayout>
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <ShieldCheck className="w-6 h-6 mr-2 text-indigo-500" /> Master System Audit
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Immutable log of all critical actions performed in the system.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="fir_created">FIR Created</option>
              <option value="fir_status_updated">FIR Status Updated</option>
              <option value="case_created">Case Created</option>
              <option value="case_updated">Case Updated</option>
              <option value="evidence_uploaded">Evidence Uploaded</option>
              <option value="suspect_created">Suspect Created</option>
              <option value="suspect_updated">Suspect Updated</option>
              <option value="report_created">Report Created</option>
              <option value="ai_feature_used">AI Feature Used</option>
            </select>
          </div>
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
                <th className="px-6 py-4">Target Entity</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center"><Activity className="w-6 h-6 animate-pulse text-indigo-500" /></div>
                    <p className="mt-2">Loading audit trail...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No activity records found matching the criteria.
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
                          <p className="text-[10px] text-gray-500 uppercase">{log.user?.role || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="mr-2 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          {getActionIcon(log.action)}
                        </span>
                        <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
                        {log.entityType}
                      </span>
                      {log.entityId ? (
                        <span className="font-mono text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                          {log.entityId}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono text-xs">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default SystemAudit;
