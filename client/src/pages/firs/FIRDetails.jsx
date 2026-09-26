import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { firService } from '../../api/firService';
import { AuthContext } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  ArrowLeft, Calendar, MapPin, User, Shield, 
  Clock, AlertCircle, Edit, Trash2, Check, Loader2 
} from 'lucide-react';

const FIRDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  // Delete State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchFIRDetails = async () => {
      try {
        setLoading(true);
        const res = await firService.getFIRById(id);
        setFir(res.data);
        setStatus(res.data.status);
        setPriority(res.data.priority);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load FIR details');
      } finally {
        setLoading(false);
      }
    };
    fetchFIRDetails();
  }, [id]);

  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const res = await firService.updateFIR(id, { status, priority });
      setFir(res.data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update FIR');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await firService.deleteFIR(id);
      navigate('/firs');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete FIR');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !fir) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800 text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Error</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          <Link to="/firs" className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-white rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition">Back to List</Link>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (statusValue) => {
    switch(statusValue) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'registered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'investigating': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'closed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priorityValue) => {
    switch(priorityValue) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = user?.role === 'police' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Link to="/firs" className="p-2 mr-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{fir.firNumber}</h1>
              <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full ${getStatusBadge(fir.status)}`}>
                {fir.status}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Submitted on {new Date(fir.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition border border-indigo-200 dark:border-indigo-800"
            >
              <Edit className="w-4 h-4 mr-2" /> Update Status
            </button>
          )}
          
          {canDelete && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition border border-red-200 dark:border-red-800"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Editing Toolbar */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Update Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="pending">Pending</option>
              <option value="registered">Registered</option>
              <option value="investigating">Investigating</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Update Priority</label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdate}
              disabled={updateLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center justify-center w-full sm:w-auto disabled:opacity-70"
            >
              {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Save</>}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800 shadow-sm mb-6 animate-in fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full mr-4 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-red-800 dark:text-red-300">Are you sure?</h4>
              <p className="text-sm text-red-600 dark:text-red-400">This will permanently delete FIR {fir.firNumber}. This action cannot be undone.</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-70"
            >
              {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{fir.title}</h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                <p className="whitespace-pre-wrap">{fir.description}</p>
              </div>
            </div>
          </div>

          {/* Location & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full mr-4 text-blue-600 dark:text-blue-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Incident Location</p>
                <p className="text-gray-900 dark:text-white font-medium">{fir.location?.address}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full mr-4 text-indigo-600 dark:text-indigo-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date of Incident</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(fir.incidentDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Meta Data</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Priority Level</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getPriorityBadge(fir.priority)}`}>
                  {fir.priority}
                </span>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(fir.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">People Involved</h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Complainant</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold mr-3">
                    {fir.isAnonymous ? 'A' : fir.complainant?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {fir.isAnonymous ? 'Anonymous Citizen' : fir.complainant?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {fir.isAnonymous ? 'Hidden for privacy' : fir.complainant?.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Assigned Officer</p>
                {fir.assignedOfficer ? (
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold mr-3">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{fir.assignedOfficer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Badge: {fir.assignedOfficer.badgeNumber || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 border-dashed text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No officer assigned yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FIRDetails;
