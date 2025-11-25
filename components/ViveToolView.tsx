import React, { useState, useEffect } from 'react';
import { generateViveToolFeatures } from '../services/geminiService';
import { ViveToolResult } from '../types';
import { TerminalIcon, SearchIcon, CopyIcon, SparklesIcon } from './Icons';

const CATEGORIES = ['Trending', 'Taskbar', 'Start Menu', 'Explorer', 'System'];

const ViveToolView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [results, setResults] = useState<ViveToolResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchFeatures = async (categoryOrQuery: string) => {
    setLoading(true);
    setError('');
    setResults([]);
    
    try {
      const data = await generateViveToolFeatures(categoryOrQuery);
      setResults(data);
    } catch (err) {
      setError('Impossibile recuperare gli ID. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFeatures('Trending');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setActiveCategory('Custom');
    fetchFeatures(query);
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setQuery('');
    fetchFeatures(cat);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          Browser Funzionalità ViveTool
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Esplora le funzionalità nascoste di Windows. Scegli una categoria o cerca qualcosa di specifico, poi copia il comando.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-emerald-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Oppure cerca qualcosa di specifico (es. 'Schede Notepad')..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 pl-12 pr-24 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          <SearchIcon className="w-5 h-5" />
        </div>
        <button
          type="submit"
          disabled={loading || !query}
          className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          Cerca
        </button>
      </form>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800 rounded-xl h-48 border border-slate-700"></div>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {results.map((item, index) => (
            <div 
              key={index} 
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg transition-all hover:border-emerald-500/50 hover:bg-slate-800/80 group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                     <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        {item.featureName}
                     </h3>
                     <div className="flex items-center gap-2 text-xs font-mono text-emerald-400/80">
                        <TerminalIcon className="w-3 h-3" />
                        <span>ID: {item.featureId}</span>
                     </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    item.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' :
                    item.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {item.riskLevel}
                  </span>
                </div>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {item.description}
                </p>

                <div className="bg-black/40 rounded-lg p-4 font-mono text-sm text-slate-300 flex justify-between items-center border border-slate-700/50 group-hover:border-emerald-500/30 transition-colors">
                  <span className="truncate mr-4 select-all">{item.command}</span>
                  <button 
                    onClick={() => copyToClipboard(item.command, item.featureId)}
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded hover:bg-white/5"
                    title="Copia comando"
                  >
                    {copiedId === item.featureId ? (
                      <>
                        <span className="text-emerald-400 font-bold text-xs">Copiato!</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">Copia</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="text-center py-12 text-slate-500">
          <SparklesIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Nessuna funzionalità trovata. Prova un'altra categoria.</p>
        </div>
      )}
    </div>
  );
};

export default ViveToolView;