import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { caseService } from '../../api/caseService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ArrowLeft, Loader2, AlertCircle, Save, Briefcase } from 'lucide-react';

const CreateCase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // If we navigated here from an FIR details page, pre-fill the FIR ID
  const searchParams = new URLSearchParams(location.search);
  const prefilledFirId = searchParams.get('firId') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    firId: prefilledFirId,
    title: '',
    description: '',
    priority: 'medium',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await caseService.createCase(formData);
      navigate(`/cases/${res.data._id}`);
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join('. '));
      } else {
        setError(err.response?.data?.message || 'Failed to create case. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center">
        <Link to="/cases" className="p-2 mr-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Open New Case</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Escalate a registered FIR into an active investigation case.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden max-w-3xl">
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Link to FIR (FIR ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firId"
                value={formData.firId}
                onChange={handleChange}
                placeholder="e.g. 64abc123def456..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-2">You must provide the exact database ID of the registered FIR to link this case.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Case Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Internal case name (e.g. Operation Shadow)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                required
                minLength={5}
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Investigation Scope & Details <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Summarize the angle of investigation, initial suspects, or specific details to focus on."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                required
                minLength={20}
              ></textarea>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/cases')}
                className="px-6 py-3 mr-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <Briefcase className="w-5 h-5 mr-2" />
                )}
                Open Case File
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateCase;
