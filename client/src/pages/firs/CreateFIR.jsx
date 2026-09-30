import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ArrowLeft, AlertCircle, Save, Loader2, FileText, Calendar, MapPin, ShieldAlert } from 'lucide-react';
import { firService } from '../../api/firService';

const CreateFIR = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incidentDate: '',
    locationAddress: '',
    isAnonymous: false,
    attachments: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      attachments: Array.from(e.target.files)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let payload;
      
      if (formData.attachments && formData.attachments.length > 0) {
        payload = new FormData();
        payload.append('title', formData.title);
        payload.append('description', formData.description);
        payload.append('incidentDate', formData.incidentDate);
        payload.append('location', JSON.stringify({ address: formData.locationAddress }));
        payload.append('isAnonymous', formData.isAnonymous);
        
        formData.attachments.forEach(file => {
          payload.append('attachments', file);
        });
      } else {
        payload = {
          title: formData.title,
          description: formData.description,
          incidentDate: formData.incidentDate,
          location: { address: formData.locationAddress },
          isAnonymous: formData.isAnonymous
        };
      }

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
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Premium Header Area */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center">
            <Link 
              to="/firs" 
              className="p-2.5 mr-5 bg-white dark:bg-[#0A0A0B] rounded-xl shadow-sm border border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">File New FIR</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Submit an official First Information Report.</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#0A0A0B] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden relative">
          
          {/* Subtle gradient accent at top of card */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500"></div>

          <div className="p-8 sm:p-10">
            {error && (
              <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex items-start animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Title */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Incident Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Brief summary of the incident (e.g. Theft at Main Street)"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                    required
                    minLength={5}
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Grid for Date & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                    Incident Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={1.5} />
                    </div>
                    <input
                      type="datetime-local"
                      name="incidentDate"
                      value={formData.incidentDate}
                      onChange={handleChange}
                      max={new Date().toISOString().slice(0, 16)} 
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                    Location (Address) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={1.5} />
                    </div>
                    <input
                      type="text"
                      name="locationAddress"
                      value={formData.locationAddress}
                      onChange={handleChange}
                      placeholder="Street name, landmark, city"
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                      required
                      minLength={5}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="7"
                  placeholder="Provide as much detail as possible about the incident, suspects involved, items lost, or any witnesses."
                  className="w-full px-4 py-4 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 shadow-sm resize-none leading-relaxed"
                  required
                  minLength={20}
                ></textarea>
                <p className="text-xs font-semibold text-gray-500 mt-2 ml-1">Minimum 20 characters required.</p>
              </div>

              {/* Evidence / Attachments */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-wide">
                  Evidence / Attachments (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*,application/pdf,video/mp4"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-500/20 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/30 transition-all cursor-pointer"
                  />
                </div>
                <p className="text-xs font-semibold text-gray-500 mt-2 ml-1">You can upload up to 5 files (Images, PDFs, MP4s). Max size 10MB each.</p>
              </div>

              {/* Premium Anonymous Toggle Card */}
              <label 
                htmlFor="isAnonymous" 
                className={`flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  formData.isAnonymous 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' 
                    : 'border-gray-200 dark:border-gray-800 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900/50'
                }`}
              >
                <div className="flex items-center h-6">
                  <input
                    id="isAnonymous"
                    name="isAnonymous"
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                  />
                </div>
                <div className="ml-4">
                  <span className={`block text-sm font-bold ${formData.isAnonymous ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                    Submit Anonymously
                  </span>
                  <span className={`block text-xs font-medium mt-1 leading-relaxed ${formData.isAnonymous ? 'text-indigo-700/80 dark:text-indigo-400/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    Your identity will be completely hidden from the general public and standard registry views, remaining accessible solely to actively assigned investigating officers.
                  </span>
                </div>
                <ShieldAlert className={`w-10 h-10 ml-auto opacity-20 ${formData.isAnonymous ? 'text-indigo-600' : 'text-gray-400'}`} />
              </label>

              {/* Footer Actions */}
              <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end sm:space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/firs')}
                  className="mt-3 sm:mt-0 px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel Submission
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center items-center px-8 py-4 rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none dark:focus:ring-offset-[#0A0A0B]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Submit Official Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateFIR;
