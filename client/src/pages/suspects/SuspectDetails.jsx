import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { suspectService } from '../../api/suspectService';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ArrowLeft, User, MapPin, Loader2, AlertCircle, Briefcase, Plus, Check, Edit } from 'lucide-react';

const SuspectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [suspect, setSuspect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Link Case State
  const [showLinkCase, setShowLinkCase] = useState(false);
  const [caseIdToLink, setCaseIdToLink] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    if (user && user.role === 'public') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await suspectService.getSuspectById(id);
      setSuspect(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suspect details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLinkCase = async (e) => {
    e.preventDefault();
    setLinkError('');
    setLinkLoading(true);
    
    try {
      await suspectService.linkToCase(id, caseIdToLink);
      setCaseIdToLink('');
      setShowLinkCase(false);
      fetchDetails(); // refresh to show new case
    } catch (err) {
      setLinkError(err.response?.data?.message || 'Failed to link case');
    } finally {
      setLinkLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
      </div>
    </DashboardLayout>
  );

  if (error || !suspect) return (
    <DashboardLayout>
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800 text-center flex flex-col items-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Error</h3>
        <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
        <Link to="/suspects" className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-white rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition">Back to Database</Link>
      </div>
    </DashboardLayout>
  );

  const getStatusBadge = (statusValue) => {
    switch(statusValue) {
      case 'wanted': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-bold border border-red-200 dark:border-red-800';
      case 'apprehended': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cleared': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'under_surveillance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Link to="/suspects" className="p-2 mr-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{suspect.name}</h1>
              <span className={`px-2.5 py-1 text-xs uppercase rounded-full ${getStatusBadge(suspect.status)}`}>
                {suspect.status.replace('_', ' ')}
              </span>
            </div>
            {suspect.aliases && suspect.aliases.length > 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">a.k.a {suspect.aliases.join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Demographics & Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Physical Demographics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Age</p>
                <p className="font-semibold text-gray-900 dark:text-white">{suspect.age || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Gender</p>
                <p className="font-semibold text-gray-900 dark:text-white">{suspect.gender || 'Unknown'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Physical Description</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  {suspect.physicalDescription || 'No description available.'}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Last Known Address</p>
                <div className="flex items-start text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  {suspect.lastKnownAddress || 'Address unknown.'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Investigator Notes</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {suspect.notes || 'No internal notes have been added to this profile yet.'}
            </p>
          </div>
        </div>

        {/* Right Column: Linked Cases */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-indigo-500" />
                Linked Cases
              </h3>
              <button 
                onClick={() => setShowLinkCase(!showLinkCase)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 p-1"
                title="Link new case"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Link Case Form */}
            {showLinkCase && (
              <form onSubmit={handleLinkCase} className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800 animate-in fade-in">
                {linkError && <p className="text-xs text-red-600 mb-2">{linkError}</p>}
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Enter Case ID:</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={caseIdToLink}
                    onChange={(e) => setCaseIdToLink(e.target.value)}
                    placeholder="Case ObjectId..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none font-mono"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={linkLoading}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-indigo-700 disabled:opacity-70 flex items-center"
                  >
                    {linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {suspect.cases && suspect.cases.length > 0 ? (
                suspect.cases.map(c => (
                  <Link 
                    key={c._id} 
                    to={`/cases/${c._id}`}
                    className="block p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{c.caseNumber}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">{c.status}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{c.title}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">No cases linked to this suspect.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SuspectDetails;
