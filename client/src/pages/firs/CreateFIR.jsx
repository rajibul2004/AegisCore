import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { firService } from '../../api/firService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ArrowLeft, Loader2, AlertCircle, Save } from 'lucide-react';

const CreateFIR = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incidentDate: '',
    locationAddress: '',
    isAnonymous: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        incidentDate: formData.incidentDate,
        location: { address: formData.locationAddress },
        isAnonymous: formData.isAnonymous
      };

      const res = await firService.createFIR(payload);
      navigate(`/firs/${res.data._id}`);
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join('. '));
      } else {
        setError(err.response?.data?.message || 'Failed to submit FIR. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center">
        <Link to="/firs" className="p-2 mr-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">File New FIR</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Submit a First Information Report officially.</p>
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
                Incident Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary of the incident (e.g. Theft at Main Street)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                required
                minLength={5}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Incident Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleChange}
                  max={new Date().toISOString().slice(0, 16)} // Prevents future dates in native UI
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location (Address) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  placeholder="Street name, landmark, city"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  required
                  minLength={5}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Provide as much detail as possible about the incident, suspects involved, items lost, or any witnesses."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                required
                minLength={20}
              ></textarea>
              <p className="text-xs text-gray-500 mt-2">Minimum 20 characters required.</p>
            </div>

            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <input
                id="isAnonymous"
                name="isAnonymous"
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isAnonymous" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Submit Anonymously
                <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                  Your identity will be hidden from the general public, but still accessible to investigating officers.
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/firs')}
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
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateFIR;
