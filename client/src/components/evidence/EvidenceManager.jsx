import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { evidenceService } from '../../api/evidenceService';
import { FileText, Image as ImageIcon, Video, Trash2, Upload, Loader2, AlertCircle, File, CheckCircle } from 'lucide-react';

const EvidenceManager = ({ caseId }) => {
  const { user } = useContext(AuthContext);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null
  });

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      const res = await evidenceService.getEvidenceByCase(caseId);
      setEvidence(res.data);
    } catch (err) {
      setError('Failed to load evidence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Basic size validation on client (50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setUploadError('File is too large. Maximum size is 50MB.');
        return;
      }
      setFormData({ ...formData, file: selectedFile });
      setUploadError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.title) {
      setUploadError('Please provide a title and select a file.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const data = new FormData();
      data.append('caseId', caseId);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('file', formData.file);

      await evidenceService.uploadEvidence(data);
      
      // Reset form
      setFormData({ title: '', description: '', file: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Refresh list
      fetchEvidence();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload evidence');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this evidence?')) return;
    try {
      await evidenceService.deleteEvidence(id);
      setEvidence(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert('Failed to delete evidence');
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
    if (mimeType === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getFileUrl = (url) => {
    // Vite proxy proxies /api, but static files are under /uploads directly on backend.
    // If we're strictly using local storage, we can construct the backend URL.
    return `http://localhost:5000${url}`;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const canUpload = user?.role === 'police' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';

  return (
    <div className="space-y-6">
      
      {/* Upload Form */}
      {canUpload && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center">
            <Upload className="w-4 h-4 mr-2 text-indigo-500" />
            Upload New Evidence
          </h3>
          
          {uploadError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              {uploadError}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Evidence Title *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Select File (Image, Video, PDF) *</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm"
                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                rows="2"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isUploading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-70 flex items-center"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {isUploading ? 'Uploading...' : 'Save Evidence'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Evidence List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
          Evidence Files ({evidence.length})
        </h3>
        
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : evidence.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No evidence has been attached to this case yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidence.map(item => (
              <div key={item._id} className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center border-r border-gray-200 dark:border-gray-700">
                  {getFileIcon(item.mimeType)}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate pr-2">{item.title}</h4>
                      {canDelete && (
                        <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600 transition" title="Delete permanently">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      <p>{formatSize(item.size)} • {new Date(item.createdAt).toLocaleDateString()}</p>
                      <p>By {item.uploadedBy?.name}</p>
                    </div>
                    <a 
                      href={getFileUrl(item.fileUrl)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded"
                    >
                      View File
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default EvidenceManager;
