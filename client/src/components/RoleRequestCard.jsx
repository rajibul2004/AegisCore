import React, { useState } from 'react';
import { ShieldAlert, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../api/userService';

const RoleRequestCard = () => {
  const [requestedRole, setRequestedRole] = useState('police');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      toast.error('Please provide a detailed reason (min 10 chars)');
      return;
    }
    try {
      setLoading(true);
      await userService.requestRole(requestedRole, reason);
      toast.success('Access request submitted successfully!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-3xl p-8 shadow-sm text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Request Submitted</h3>
        <p className="text-emerald-700 dark:text-emerald-400 font-medium">
          Your access request is currently pending admin approval. You will receive an email and notification once processed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-500/30 rounded-3xl p-8 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
      
      <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 mb-2">
        <ShieldAlert className="w-6 h-6 text-indigo-500" /> Request Elevated Access
      </h3>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
        Apply for Police or Administrator privileges to access secure features.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Requested Role</label>
          <select 
            value={requestedRole}
            onChange={(e) => setRequestedRole(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3"
          >
            <option value="police">Police Officer</option>
            <option value="admin">System Administrator</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Justification / Badge ID</label>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide your agency details, badge number, or reason for elevation..."
            rows="3"
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 resize-none"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Request</>}
        </button>
      </form>
    </div>
  );
};

export default RoleRequestCard;
