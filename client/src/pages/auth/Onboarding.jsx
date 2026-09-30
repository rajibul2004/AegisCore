import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { UserCircle, Shield, Briefcase, MapPin, Phone, Loader2, ArrowRight, Save } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Local state for the fields
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    identificationType: 'NationalID',
    identificationNumber: '',
    phone: user?.phone || '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    rank: '',
    station: '',
    jurisdiction: '',
    specialization: '',
    department: '',
    badgeNumber: user?.badgeNumber || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, skip = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let payload = {};

      if (!skip) {
        if (user.role === 'public') {
          payload = {
            dateOfBirth: formData.dateOfBirth,
            identificationType: formData.identificationType,
            identificationNumber: formData.identificationNumber,
            phone: formData.phone,
            address: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: formData.country,
            },
            emergencyContact: {
              name: formData.emergencyContactName,
              phone: formData.emergencyContactPhone,
              relation: formData.emergencyContactRelation,
            }
          };
        } else if (user.role === 'police' || user.role === 'admin') {
          payload = {
            phone: formData.phone,
            rank: formData.rank,
            station: formData.station,
            jurisdiction: formData.jurisdiction,
            specialization: formData.specialization,
            department: formData.department,
            badgeNumber: formData.badgeNumber,
          };
        }
      }

      await completeOnboarding(payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  // If somehow they got here but are verified+onboarded, redirect
  if (user && user.onboardingCompleted) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0A0A0B] dark:to-[#111113] p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-2xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="mb-10 text-center">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Complete Your Profile</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Welcome to AegisCore, {user?.name}. Please provide a few more details to help us personalize your experience.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {user?.role === 'public' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Public Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-indigo-500" /> Personal Info
                    </h3>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                      <input 
                        type="date" 
                        name="dateOfBirth" 
                        value={formData.dateOfBirth} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:dark:invert cursor-pointer" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white" />
                    </div>
                    <div className="flex gap-4">
                      <div className="w-1/3">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">ID Type</label>
                        <select 
                          name="identificationType" 
                          value={formData.identificationType} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all [color-scheme:light] dark:[color-scheme:dark] cursor-pointer"
                        >
                          <option value="NationalID">National ID</option>
                          <option value="Passport">Passport</option>
                          <option value="DriverLicense">Driver's License</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="w-2/3">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">ID Number</label>
                        <input type="text" name="identificationNumber" value={formData.identificationNumber} onChange={handleChange} placeholder="ID Number" className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-indigo-500" /> Address
                    </h3>
                    <input type="text" name="street" value={formData.street} onChange={handleChange} placeholder="Street Address" className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white" />
                      <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white" />
                    </div>
                  </div>
                </div>
              )}

              {(user?.role === 'police' || user?.role === 'admin') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Police Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-500" /> Official Assignment
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Rank / Title</label>
                        <input type="text" name="rank" value={formData.rank} onChange={handleChange} placeholder="e.g. Detective" className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Badge Number</label>
                        <input type="text" name="badgeNumber" value={formData.badgeNumber} onChange={handleChange} placeholder="Badge #" className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Department</label>
                      <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Narcotics" className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-indigo-500" /> Station Details
                    </h3>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Station / Precinct</label>
                      <input type="text" name="station" value={formData.station} onChange={handleChange} placeholder="e.g. 14th Precinct" className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jurisdiction</label>
                      <input type="text" name="jurisdiction" value={formData.jurisdiction} onChange={handleChange} placeholder="Jurisdiction Area" className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-4 text-gray-500 dark:text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save & Continue</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
