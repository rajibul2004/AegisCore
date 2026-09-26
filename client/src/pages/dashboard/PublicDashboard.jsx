import { FilePlus, FileText, Clock, ShieldAlert } from 'lucide-react';

const PublicDashboard = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to CaseIntel Portal</h1>
          <p className="text-indigo-100 max-w-2xl mb-6">File FIRs securely, track the status of your reported cases, and communicate with the investigating officers transparently.</p>
          <button className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm flex items-center">
            <FilePlus className="w-4 h-4 mr-2" />
            File a New FIR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'My Submitted FIRs', value: '2', icon: <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />, bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
          { title: 'In Progress', value: '1', icon: <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-50 dark:bg-amber-900/30' },
          { title: 'Emergency Contacts', value: '3', icon: <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />, bg: 'bg-red-50 dark:bg-red-900/30' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
            <div className={`p-4 rounded-full mr-4 ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent FIR Status</h3>
        </div>
        <div className="p-6">
          <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-8">
            
            <div className="relative pl-6">
              <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-gray-800"></span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">FIR #2023-1045 is under investigation</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Officer Assigned: Insp. Sharma. Preliminary evidence collection in progress.</p>
              <span className="text-xs text-gray-400 mt-2 block">Oct 12, 2023 - 10:30 AM</span>
            </div>

            <div className="relative pl-6">
              <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-white dark:ring-gray-800"></span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">FIR #2023-1045 officially registered</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your application was reviewed and officially registered by the department.</p>
              <span className="text-xs text-gray-400 mt-2 block">Oct 11, 2023 - 04:15 PM</span>
            </div>

            <div className="relative pl-6">
              <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600 ring-4 ring-white dark:ring-gray-800"></span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">FIR Application Submitted</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Application received successfully via online portal.</p>
              <span className="text-xs text-gray-400 mt-2 block">Oct 11, 2023 - 09:00 AM</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
