import { useState, useContext } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import api from '../../api/axios';
import { Settings as SettingsIcon, User, Lock, Bell, Moon, Sun, Shield, Save, Check, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';

const Settings = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [twoFaStep, setTwoFaStep] = useState('idle');
  const [twoFaOtp, setTwoFaOtp] = useState('');
  const [twoFaAction, setTwoFaAction] = useState(null);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState('');
  const [twoFaSuccess, setTwoFaSuccess] = useState('');

  // Mock form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailAlerts: true,
    smsAlerts: false,
    twoFactorAuth: false
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'preferences', label: 'System Preferences', icon: SettingsIcon }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-gray-700">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 font-bold tracking-widest uppercase text-xs">Configuration</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">System Settings</h1>
              <p className="text-gray-400 text-lg max-w-xl font-medium">Manage your account credentials, security parameters, and notification preferences.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl p-4 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl flex flex-col gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-left ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl relative overflow-hidden">
              
              <form onSubmit={handleSave} className="relative z-10 space-y-8">
                
                {/* Profile Settings */}
                {activeTab === 'profile' && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Personal Information</h2>
                      <p className="text-gray-500 dark:text-gray-400">Update your basic profile details.</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-4xl shadow-lg shadow-indigo-500/20">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Access Level</p>
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 font-bold rounded-lg border border-indigo-500/20 capitalize">
                          {user?.role}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-5 py-4 bg-white dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                        <input 
                          type="email" 
                          value={formData.email}
                          disabled
                          className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-500 cursor-not-allowed outline-none"
                        />
                        <p className="text-xs text-gray-500 ml-1">Contact administration to change email.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Security & Password</h2>
                      <p className="text-gray-500 dark:text-gray-400">Keep your account secure by updating your credentials regularly.</p>
                    </div>

                    <div className="space-y-6 max-w-xl">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Current Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                          className="w-full px-5 py-4 bg-white dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">New Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                          className="w-full px-5 py-4 bg-white dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Confirm New Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className="w-full px-5 py-4 bg-white dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className={`p-6 ${user?.twoFactorEnabled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20'} border rounded-2xl mt-8`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {user?.twoFactorEnabled ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> : <ShieldOff className="w-6 h-6 text-blue-500" />}
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user?.twoFactorEnabled ? 'Your account is protected with OTP verification.' : 'Add an extra layer of security to your account.'}
                            </p>
                          </div>
                        </div>
                        {twoFaStep === 'idle' && (
                          <button
                            onClick={async () => {
                              try {
                                setTwoFaLoading(true);
                                setTwoFaError('');
                                setTwoFaSuccess('');
                                const endpoint = user?.twoFactorEnabled ? '/auth/2fa/disable' : '/auth/2fa/enable';
                                await api.post(endpoint);
                                setTwoFaAction(user?.twoFactorEnabled ? 'disable' : 'enable');
                                setTwoFaStep('verify');
                              } catch (err) {
                                setTwoFaError(err.response?.data?.message || 'Failed to initiate 2FA change.');
                              } finally {
                                setTwoFaLoading(false);
                              }
                            }}
                            disabled={twoFaLoading}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                              user?.twoFactorEnabled
                                ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/30'
                            }`}
                          >
                            {twoFaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                          </button>
                        )}
                      </div>

                      {twoFaError && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">{twoFaError}</div>
                      )}
                      {twoFaSuccess && (
                        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-medium">{twoFaSuccess}</div>
                      )}

                      {twoFaStep === 'verify' && (
                        <div className="mt-4 p-6 bg-white dark:bg-gray-950/50 rounded-2xl border border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">An OTP has been sent to your registered contact. Enter it below to confirm.</p>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={twoFaOtp}
                              onChange={(e) => setTwoFaOtp(e.target.value.replace(/\D/g, ''))}
                              placeholder="Enter 6-digit OTP"
                              className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-mono text-lg tracking-[0.3em] text-center outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <button
                              onClick={async () => {
                                try {
                                  setTwoFaLoading(true);
                                  setTwoFaError('');
                                  const endpoint = twoFaAction === 'enable' ? '/auth/2fa/enable/confirm' : '/auth/2fa/disable/confirm';
                                  await api.post(endpoint, { otp: twoFaOtp });
                                  setTwoFaSuccess(twoFaAction === 'enable' ? '2FA has been enabled!' : '2FA has been disabled.');
                                  setTwoFaStep('idle');
                                  setTwoFaOtp('');
                                  await refreshUser();
                                } catch (err) {
                                  setTwoFaError(err.response?.data?.message || 'Verification failed.');
                                } finally {
                                  setTwoFaLoading(false);
                                }
                              }}
                              disabled={twoFaOtp.length !== 6 || twoFaLoading}
                              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all"
                            >
                              {twoFaLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
                            </button>
                            <button
                              onClick={() => { setTwoFaStep('idle'); setTwoFaOtp(''); setTwoFaError(''); }}
                              className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preferences */}
                {activeTab === 'preferences' && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white">System Preferences</h2>
                      <p className="text-gray-500 dark:text-gray-400">Customize your visual and notification experience.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                            {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Interface Theme</h4>
                            <p className="text-sm text-gray-500">Toggle between Light and Dark mode.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={toggleTheme}
                          className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          {theme === 'dark' ? 'Enable Light Mode' : 'Enable Dark Mode'}
                        </button>
                      </div>

                      <div className="p-6 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                            <Bell className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Email Notifications</h4>
                            <p className="text-sm text-gray-500">Receive case updates via email.</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={formData.emailAlerts} onChange={() => setFormData({...formData, emailAlerts: !formData.emailAlerts})} />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-8 py-4 rounded-2xl font-bold text-white flex items-center transition-all ${
                      saved ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30'
                    }`}
                  >
                    {isSaving ? (
                      <span className="flex items-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Saving...</span>
                    ) : saved ? (
                      <span className="flex items-center"><Check className="w-5 h-5 mr-2" /> Saved Successfully</span>
                    ) : (
                      <span className="flex items-center"><Save className="w-5 h-5 mr-2" /> Save Changes</span>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
