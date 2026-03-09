import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Plane, 
  Train, 
  Bus,
  Car, 
  Ticket, 
  Hotel, 
  MapPin, 
  CloudSun, 
  Info, 
  ExternalLink,
  Loader2,
  ChevronRight,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateTennisTripReport, TennisTripReport, getTournamentDates } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [tournament, setTournament] = useState('');
  const [departure, setDeparture] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transport, setTransport] = useState('plane');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<TennisTripReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestedDates, setSuggestedDates] = useState<{ startDate: string; endDate: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament || !departure) return;

    if (!startDate || !endDate) {
      setLoading(true);
      setError(null);
      try {
        const dates = await getTournamentDates(tournament);
        if (dates) {
          setSuggestedDates(dates);
        } else {
          setError('Could not find dates for this tournament. Please enter them manually.');
        }
      } catch (err) {
        setError('Error fetching tournament dates.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setSuggestedDates(null);

    try {
      const data = await generateTennisTripReport(tournament, departure, startDate, endDate, transport);
      setReport(data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useSuggestedDates = () => {
    if (suggestedDates) {
      setStartDate(suggestedDates.startDate);
      setEndDate(suggestedDates.endDate);
      setSuggestedDates(null);
    }
  };

  const getBgColor = () => {
    if (!report) return 'bg-[#F5F5F0]';
    switch (report.courtSurface) {
      case 'clay': return 'bg-[#E2725B]'; // Clay orange-red
      case 'grass': return 'bg-[#4A7C59]'; // Grass green
      case 'hard': return 'bg-[#4A90E2]'; // Hard court blue
      default: return 'bg-[#F5F5F0]';
    }
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-1000 text-[#1A1A1A] font-sans selection:bg-[#5A5A40] selection:text-white relative overflow-x-hidden", getBgColor())}>
      {/* Tennis Court Lines Background Overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-15">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          {/* Main Court Boundary (Doubles: 78ft x 36ft) */}
          <div className="w-full max-w-5xl aspect-[78/36] border-2 border-white relative">
            {/* Singles Sidelines (Horizontal lines 4.5ft from top/bottom: 4.5/36 = 12.5%) */}
            <div className="absolute inset-x-0 top-[12.5%] bottom-[12.5%] border-y-2 border-white"></div>
            
            {/* Service Lines (Vertical lines 18ft from baselines: 18/78 = 23.1%) */}
            <div className="absolute inset-y-[12.5%] left-[23.1%] right-[23.1%] border-x-2 border-white"></div>
            
            {/* Center Service Line (Horizontal line between service lines) */}
            <div className="absolute top-1/2 left-[23.1%] right-[23.1%] h-0.5 bg-white -translate-y-1/2"></div>
            
            {/* Net Line (Vertical line in center) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white -translate-x-1/2"></div>
            
            {/* Center Marks (Small horizontal ticks at baselines) */}
            <div className="absolute top-1/2 left-0 w-3 h-0.5 bg-white -translate-y-1/2"></div>
            <div className="absolute top-1/2 right-0 w-3 h-0.5 bg-white -translate-y-1/2"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-black/10 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 bg-[#C5D92D] rounded-full flex items-center justify-center shadow-lg border border-black/5">
              {/* New Tennis Ball Design: More detailed seams */}
              <svg viewBox="0 0 100 100" className="w-full h-full p-1">
                <circle cx="50" cy="50" r="48" fill="#C5D92D" />
                <path 
                  d="M 20 20 Q 50 50 20 80" 
                  stroke="white" 
                  strokeWidth="4" 
                  fill="none" 
                  strokeLinecap="round"
                  className="opacity-80"
                />
                <path 
                  d="M 80 20 Q 50 50 80 80" 
                  stroke="white" 
                  strokeWidth="4" 
                  fill="none" 
                  strokeLinecap="round"
                  className="opacity-80"
                />
              </svg>
            </div>
            <span className="font-serif italic text-xl font-bold tracking-tight">TennisTravel</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest opacity-60">
            <a href="#" className="hover:opacity-100 transition-opacity">Tournaments</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Guides</a>
            <a href="#" className="hover:opacity-100 transition-opacity">About</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Hero Section */}
        <section className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-serif font-light leading-[0.9] tracking-tighter mb-8"
          >
            Your next <span className="italic">match</span> awaits.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-black/60 max-w-2xl font-light leading-relaxed"
          >
            Plan your perfect tennis pilgrimage. Get live tournament info, travel costs, and local guides in seconds.
          </motion.p>
        </section>

        {/* Input Form */}
        <section className="mb-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-8 md:p-12 shadow-xl shadow-black/5 border border-black/5">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 px-1">Tournament</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                  <input 
                    type="text" 
                    placeholder="Wimbledon, US Open..." 
                    className="w-full bg-black/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A5A40] transition-all outline-none"
                    value={tournament}
                    onChange={(e) => setTournament(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 px-1">Departing From</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                  <input 
                    type="text" 
                    placeholder="London, NYC..." 
                    className="w-full bg-black/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A5A40] transition-all outline-none"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 px-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 pointer-events-none" />
                  <input 
                    type="date" 
                    className="w-full bg-black/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A5A40] transition-all outline-none"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 px-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 pointer-events-none" />
                  <input 
                    type="date" 
                    className="w-full bg-black/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5A5A40] transition-all outline-none"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 px-1">Transport</label>
                <div className="flex bg-black/5 rounded-2xl p-1">
                  {[
                    { id: 'plane', icon: Plane, label: 'Plane' },
                    { id: 'ground', icon: Train, label: 'Train/Bus' },
                    { id: 'drive', icon: Car, label: 'Drive' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTransport(item.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
                        transport === item.id ? "bg-white shadow-sm text-[#5A5A40]" : "text-black/30 hover:text-black/60"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-1 flex items-end">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold hover:bg-[#4A4A30] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Plan Trip
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggested Dates */}
        <AnimatePresence>
          {suggestedDates && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-8 bg-white/90 backdrop-blur-md rounded-[32px] border-2 border-[#5A5A40] shadow-xl text-center"
            >
              <h3 className="text-xl font-bold mb-2">Found 2026 Dates!</h3>
              <p className="text-black/60 mb-6">
                We found the official dates for <span className="font-bold text-black">{tournament}</span>:
                <br />
                <span className="font-mono text-lg">{suggestedDates.startDate} to {suggestedDates.endDate}</span>
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={useSuggestedDates}
                  className="bg-[#5A5A40] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#4A4A30] transition-all"
                >
                  Use These Dates
                </button>
                <button 
                  onClick={() => setSuggestedDates(null)}
                  className="bg-black/5 text-black/60 px-8 py-3 rounded-xl font-bold hover:bg-black/10 transition-all"
                >
                  Enter Manually
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Display */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Report Header */}
              <div className="border-b border-black/10 pb-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-[#5A5A40] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Report</span>
                  <span className="text-black/40 text-sm font-mono">{new Date().toLocaleDateString()}</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                    report.courtSurface === 'clay' ? "bg-[#E2725B]/20 border-[#E2725B]/40 text-[#8B4513]" :
                    report.courtSurface === 'grass' ? "bg-[#4A7C59]/20 border-[#4A7C59]/40 text-[#1E3A2A]" :
                    report.courtSurface === 'hard' ? "bg-[#4A90E2]/20 border-[#4A90E2]/40 text-[#1C3A5E]" :
                    "bg-black/5 border-black/10 text-black/40"
                  )}>
                    {report.courtSurface} Court
                  </span>
                </div>
                <h2 className="text-5xl font-serif font-bold mb-2">{report.tournament}</h2>
                <p className="text-xl text-black/60 italic mb-1">{report.location}</p>
                <p className="text-lg text-black/40 italic">{report.dates}</p>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Tickets */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Tickets & Entry</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm space-y-4">
                    <p className="text-black/70 leading-relaxed">{report.ticketInfo.buyingGuide}</p>
                    <a 
                      href={report.ticketInfo.officialWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#5A5A40] font-bold hover:underline"
                    >
                      Official Tournament Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Transportation */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      {transport === 'plane' ? <Plane className="w-5 h-5" /> : 
                       transport === 'ground' ? <Train className="w-5 h-5" /> : 
                       <Car className="w-5 h-5" />}
                    </div>
                    <h3 className="text-xl font-bold">Travel Costs</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-serif font-bold">{report.travelCosts.median}</span>
                      <span className="text-black/40 text-sm uppercase font-bold tracking-widest">Median</span>
                    </div>
                    <div className="p-4 bg-[#F5F5F0] rounded-2xl mb-4">
                      <p className="text-sm font-bold text-black/40 uppercase tracking-widest mb-1">Range</p>
                      <p className="font-mono text-lg">{report.travelCosts.range}</p>
                    </div>
                    <p className="text-black/60 text-sm leading-relaxed mb-6">{report.travelCosts.details}</p>
                    
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-black/40">Book Travel</p>
                      <div className="flex flex-wrap gap-2">
                        {report.travelCosts.bookingLinks.map((link, i) => (
                          <a 
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#F5F5F0] px-4 py-2 rounded-full text-xs font-bold hover:bg-[#5A5A40] hover:text-white transition-all flex items-center gap-2"
                          >
                            {link.name}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accommodation */}
                <div className="md:col-span-2 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                      <Hotel className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Accommodation (Nightly)</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: '2 Stars', data: report.accommodationCosts.twoStar, stars: 2 },
                      { label: '3 Stars', data: report.accommodationCosts.threeStar, stars: 3 },
                      { label: '4 Stars', data: report.accommodationCosts.fourStar, stars: 4 },
                      { label: '5 Stars', data: report.accommodationCosts.fiveStar, stars: 5 },
                      { label: 'Others', data: report.accommodationCosts.others, stars: 0 }
                    ].map((item) => (
                      <div key={item.label} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm text-center">
                        <div className="flex justify-center gap-0.5 mb-2">
                          {item.stars > 0 ? Array.from({ length: item.stars }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          )) : <Info className="w-3 h-3 text-black/20" />}
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-black/40 mb-3">{item.label}</p>
                        <p className="text-2xl font-serif font-bold mb-1">{item.data.median}</p>
                        <p className="text-[10px] font-mono text-black/40">{item.data.range}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-black/40 mb-4">Book Accommodation</p>
                    <div className="flex flex-wrap gap-3">
                      {report.accommodationCosts.bookingLinks.map((link, i) => (
                        <a 
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#F5F5F0] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#5A5A40] hover:text-white transition-all flex items-center gap-2"
                        >
                          {link.name}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Destination */}
                <div className="md:col-span-2 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Destination Guide</h3>
                  </div>
                  <div className="bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                      <div className="p-8 border-b md:border-b-0 md:border-r border-black/5">
                        <div className="flex items-center gap-2 mb-4 text-black/40">
                          <CloudSun className="w-5 h-5" />
                          <span className="text-[10px] uppercase font-bold tracking-widest">Weather</span>
                        </div>
                        <p className="text-lg leading-relaxed mb-4">{report.destinationOverview.weather}</p>
                        <a 
                          href={report.destinationOverview.weatherSourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-[#5A5A40] font-bold hover:underline flex items-center gap-1"
                        >
                          View Weather Source
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="p-8 border-b md:border-b-0 md:border-r border-black/5 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4 text-black/40">
                          <Info className="w-5 h-5" />
                          <span className="text-[10px] uppercase font-bold tracking-widest">About the Place</span>
                        </div>
                        <p className="text-lg leading-relaxed mb-6">{report.destinationOverview.generalInfo}</p>
                        <div className="space-y-6">
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-black/40 mb-3">Must See</p>
                            <div className="flex flex-wrap gap-2">
                              {report.destinationOverview.sightseeing.map((spot) => (
                                <span key={spot} className="bg-[#F5F5F0] px-4 py-2 rounded-full text-sm font-medium">
                                  {spot}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-black/40 mb-3">Guides & Info</p>
                            <div className="flex flex-wrap gap-3">
                              {report.destinationOverview.guideLinks.map((link, i) => (
                                <a 
                                  key={i}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#5A5A40] font-bold hover:underline flex items-center gap-2 text-sm"
                                >
                                  {link.name}
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sources */}
              {report.sources && report.sources.length > 0 && (
                <div className="pt-12 border-t border-black/10">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-black/40 mb-4">Data Sources</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {report.sources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-black/40 hover:text-[#5A5A40] transition-colors flex items-center gap-1 truncate max-w-[200px]"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        {new URL(source).hostname}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 py-12 bg-white/50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-black/40 text-sm">
            © {new Date().getFullYear()} TennisTravel Planner. Powered by Gemini AI & Google Search.
          </p>
        </div>
      </footer>
    </div>
  );
}
