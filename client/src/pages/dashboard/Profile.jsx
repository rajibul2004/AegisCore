import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserCircle, Mail, MapPin, Shield, Briefcase, Phone, Calendar, CreditCard, Edit3 } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'from-rose-500 to-orange-500';
      case 'police': return 'from-indigo-500 to-cyan-500';
      default: return 'from-emerald-500 to-teal-500';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Profile</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and account settings</p>
        </div>
        <button className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center gap-2 shadow-sm">
          <Edit3 className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50"></div>
            
            <div className="relative flex flex-col items-center">
              <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r ${getRoleColor(user?.role)} rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500`}></div>
                <div className={`relative h-32 w-32 rounded-full bg-gradient-to-br ${getRoleColor(user?.role)} flex items-center justify-center text-white text-5xl font-black shadow-xl ring-4 ring-white dark:ring-gray-900`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <h2 className="mt-6 text-2xl font-black text-gray-900 dark:text-white tracking-tight text-center">{user?.name}</h2>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-1.5" />
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{user?.role}</span>
              </div>
              
              <div className="w-full mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Mail className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                {user?.isVerified && (
                  <div className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="text-sm font-bold">Email Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Official Assignment (Police / Admin) */}
          {(user?.role === 'police' || user?.role === 'admin') && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <Briefcase className="w-5 h-5 text-indigo-500" /> Official Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/50">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Rank / Title</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{user?.rank || 'Not specified'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/50">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Badge Number</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{user?.badgeNumber || 'Not specified'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/50">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Department</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{user?.department || 'Not specified'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/50">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Station</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{user?.station || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information (Public) */}
          {user?.role === 'public' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <UserCircle className="w-5 h-5 text-indigo-500" /> Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/50 flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Date of Birth</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/50 flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/50 flex items-center gap-4 md:col-span-2">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">{user?.identificationType ? `${user.identificationType} Number` : 'ID Number'}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.identificationNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address Information */}
          {(user?.address?.street || user?.address?.city) && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-indigo-500" /> Location Details
              </h3>
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/50">
                <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed">
                  {user.address.street}<br/>
                  {user.address.city}, {user.address.state} {user.address.zipCode}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
