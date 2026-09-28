import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Search, Loader2, FileText, Briefcase, User, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState({ firs: [], cases: [], suspects: [] });
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const [firRes, caseRes, suspectRes] = await Promise.all([
        api.get(`/firs?search=${query}&limit=5`),
        api.get(`/cases?search=${query}&limit=5`),
        api.get(`/suspects?search=${query}&limit=5`)
      ]);
      
      setResults({
        firs: firRes.data?.data || firRes.data || [],
        cases: caseRes.data?.data || caseRes.data || [],
        suspects: suspectRes.data?.data || suspectRes.data || []
      });
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const firsArr = Array.isArray(results.firs) ? results.firs : [];
  const casesArr = Array.isArray(results.cases) ? results.cases : [];
  const suspectsArr = Array.isArray(results.suspects) ? results.suspects : [];

  const totalResults = firsArr.length + casesArr.length + suspectsArr.length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        <div className="text-center space-y-4 mb-10 mt-8">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 text-indigo-500 rounded-full mb-2 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]">
            <Search className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Global Intelligence Search</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium text-lg">
            Scan across all active FIRs, case files, and suspect dossiers simultaneously to connect the dots.
          </p>
        </div>

        <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl p-4 sm:p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-indigo-500" />
              </div>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter keywords, FIR numbers, names, aliases, or locations..."
                className="w-full pl-14 pr-6 py-5 text-lg font-medium border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950/50 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center min-w-[200px]"
            >
              {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Execute Scan'}
            </button>
          </form>
        </div>

        {hasSearched && !isSearching && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mt-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Scan Results <span className="text-indigo-500 ml-2 bg-indigo-500/10 px-3 py-1 rounded-full text-sm font-bold">{totalResults} Found</span>
              </h2>
            </div>

            {totalResults === 0 ? (
              <div className="text-center py-20 bg-white/30 dark:bg-gray-900/20 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No matching intelligence found</h3>
                <p className="text-gray-500">Try adjusting your search parameters or check for typos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 bg-white/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-sm">FIR Records</h3>
                    <span className="ml-auto bg-blue-500/10 text-blue-500 font-bold px-2 py-0.5 rounded-lg text-xs">{firsArr.length}</span>
                  </div>
                  {firsArr.map(fir => (
                    <Link to={`/firs/${fir._id}`} key={fir._id} className="block bg-white dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md border border-blue-500/20">{fir.firNumber || 'N/A'}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">{fir.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{fir.description}</p>
                    </Link>
                  ))}
                  {firsArr.length === 0 && (
                    <div className="p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-gray-500 text-sm">No FIRs matched</div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 bg-white/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <Briefcase className="w-6 h-6 text-emerald-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-sm">Case Files</h3>
                    <span className="ml-auto bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-lg text-xs">{casesArr.length}</span>
                  </div>
                  {casesArr.map(c => (
                    <Link to={`/cases/${c._id}`} key={c._id} className="block bg-white dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20">{c.caseNumber || 'N/A'}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">{c.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{c.description}</p>
                    </Link>
                  ))}
                  {casesArr.length === 0 && (
                    <div className="p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-gray-500 text-sm">No Cases matched</div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 bg-white/50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <User className="w-6 h-6 text-rose-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-sm">Suspects</h3>
                    <span className="ml-auto bg-rose-500/10 text-rose-500 font-bold px-2 py-0.5 rounded-lg text-xs">{suspectsArr.length}</span>
                  </div>
                  {suspectsArr.map(s => (
                    <Link to={`/suspects/${s._id}`} key={s._id} className="block bg-white dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/10 transition-all group">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{s.name}</h4>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-md font-bold border ${s.status === 'wanted' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'}`}>{s.status || 'Unknown'}</span>
                        {s.aliases?.length > 0 && <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">AKA: {s.aliases[0]}</span>}
                      </div>
                    </Link>
                  ))}
                  {suspectsArr.length === 0 && (
                    <div className="p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-gray-500 text-sm">No Suspects matched</div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GlobalSearch;
