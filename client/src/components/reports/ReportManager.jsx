import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { reportService } from '../../api/reportService';
import { FileText, Plus, Loader2, AlertCircle, Trash2, Edit, Save, X, Sparkles, Wand2 } from 'lucide-react';

const ReportManager = ({ caseId }) => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    reportType: 'investigation',
    content: ''
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportService.getReportsByCase(caseId);
      setReports(res.data);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const handleGenerateSummary = async (reportId) => {
    try {
      setGeneratingAi(reportId);
      const res = await reportService.generateSummary(reportId);
      setReports(reports.map(r => r._id === reportId ? res.data : r));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate AI summary');
    } finally {
      setGeneratingAi(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await reportService.updateReport(editingId, formData);
      } else {
        await reportService.createReport({ ...formData, caseId });
      }
      
      setIsCreating(false);
      setEditingId(null);
      setFormData({ title: '', reportType: 'investigation', content: '' });
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (report) => {
    setFormData({
      title: report.title,
      reportType: report.reportType,
      content: report.content
    });
    setEditingId(report._id);
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportService.deleteReport(id);
      setReports(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report');
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'investigation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'interrogation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'forensic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'closing': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const canWrite = user?.role === 'police' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-wider flex items-center">
            <FileText className="w-5 h-5 mr-2 text-indigo-500" />
            Official Reports ({reports.length})
          </h3>
          {canWrite && !isCreating && (
            <button 
              onClick={() => {
                setEditingId(null);
                setFormData({ title: '', reportType: 'investigation', content: '' });
                setIsCreating(true);
              }}
              className="flex items-center text-sm font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
            >
              <Plus className="w-4 h-4 mr-1" /> New Report
            </button>
          )}
        </div>

        {/* Editor Form */}
        {isCreating && (
          <form onSubmit={handleSave} className="mb-8 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Report' : 'Draft New Report'}</h4>
              <button type="button" onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Report Title</label>
                <input 
                  type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Report Type</label>
                <select 
                  value={formData.reportType} onChange={e => setFormData({...formData, reportType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="investigation">Investigation</option>
                  <option value="interrogation">Interrogation</option>
                  <option value="forensic">Forensic</option>
                  <option value="summary">Summary</option>
                  <option value="closing">Closing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Report Content (Markdown/Text)</label>
              <textarea 
                required rows="10" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                placeholder="Write your detailed report here..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-y font-mono text-sm"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-70 flex items-center">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? 'Saving...' : 'Save Report'}
              </button>
            </div>
          </form>
        )}

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : reports.length === 0 && !isCreating ? (
          <div className="text-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No official reports filed yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report._id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">{report.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getTypeColor(report.reportType)}`}>
                        {report.reportType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Filed by {report.author?.name} on {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {!report.aiSummary && (user.role === 'admin' || user.role === 'police') && (
                      <button 
                        onClick={() => handleGenerateSummary(report._id)} 
                        disabled={generatingAi === report._id}
                        className="text-xs flex items-center font-semibold bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 px-2 py-1 rounded transition disabled:opacity-50"
                        title="Generate AI Summary"
                      >
                        {generatingAi === report._id ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
                        ) : (
                          <><Wand2 className="w-3 h-3 mr-1" /> AI Summary</>
                        )}
                      </button>
                    )}
                    {canWrite && (user._id === report.author?._id || user.role === 'admin') && (
                      <button onClick={() => startEdit(report)} className="text-gray-500 hover:text-indigo-600 transition" title="Edit Report">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(report._id)} className="text-gray-500 hover:text-red-600 transition" title="Delete Report">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800">
                  <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300">
                    <p className="whitespace-pre-wrap font-serif leading-relaxed">{report.content}</p>
                  </div>
                  {report.aiSummary && (
                    <div className="mt-5 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-l-4 border-purple-500 rounded-r-xl">
                      <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-2 flex items-center uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 mr-1.5" /> AI Generated Summary
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{report.aiSummary}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportManager;
