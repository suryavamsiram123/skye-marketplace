import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, DollarSign, Clock, Tag, Search, Filter, Map, Grid2x2 as Grid, List, Loader2, Bell, Star } from 'lucide-react';
import { supabase, type SampleGig, type UserProfile } from '../lib/supabase';

type Props = {
  profile: UserProfile;
  onBack: () => void;
  theme?: 'dark' | 'light';
};

const CATEGORIES = [
  'All',
  'Tutoring & Academic Help',
  'Furniture Assembly & Moving',
  'Tech Support & Repairs',
  'Cleaning & Organization',
  'Pet Care',
  'Photography & Videography',
  'Graphic Design & Creative Work',
  'Food & Grocery Runs',
  'Laundry & Errands',
  'Event Help & Setup',
  'Garage & Vehicle Maintenance',
];

export function BrowseGigsPage({ profile, onBack, theme = 'dark' }: Props) {
  const [gigs, setGigs] = useState<SampleGig[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<SampleGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'distance' | 'pay' | 'recent'>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState(profile.max_walk_time_mins);
  const [minPay, setMinPay] = useState(profile.pay_min);

  useEffect(() => {
    loadGigs();
  }, []);

  useEffect(() => {
    filterAndSortGigs();
  }, [gigs, search, selectedCategory, sortBy, maxDistance, minPay]);

  const loadGigs = async () => {
    setLoading(true);
    try {
      const res = await supabase
        .from('sample_gigs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (res.data) {
        setGigs(res.data as SampleGig[]);
      }
    } catch (err) {
      console.error('Error loading gigs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGigs = () => {
    let filtered = [...gigs];

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((g) =>
        g.title.toLowerCase().includes(searchLower) ||
        g.description.toLowerCase().includes(searchLower) ||
        g.category.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((g) => g.category === selectedCategory);
    }

    // Filter by max distance
    filtered = filtered.filter((g) => g.distance_mins <= maxDistance);

    // Filter by min pay
    filtered = filtered.filter((g) => g.pay_min >= minPay);

    // Sort
    if (sortBy === 'distance') {
      filtered.sort((a, b) => a.distance_mins - b.distance_mins);
    } else if (sortBy === 'pay') {
      filtered.sort((a, b) => b.pay_max - a.pay_max);
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredGigs(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading nearby gigs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/60">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-semibold">Browse Gigs</span>
          </div>
          <div className="w-20" />
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gigs... (e.g. tutoring, moving, pet care)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showFilters ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>

          {/* View Toggle */}
          <div className="ml-auto flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-slate-900 rounded-xl border border-slate-800/60 p-4 animate-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Max Distance: {maxDistance} min walk</label>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={5}
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Pay Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Min Pay: ${minPay}/hr</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={minPay}
                  onChange={(e) => setMinPay(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <label className="block text-xs font-medium text-slate-400 mb-2">Sort By</label>
              <div className="flex gap-2">
                {[
                  { value: 'distance', label: 'Distance' },
                  { value: 'pay', label: 'Highest Pay' },
                  { value: 'recent', label: 'Most Recent' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value as typeof sortBy)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      sortBy === opt.value
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {filteredGigs.length} gig{filteredGigs.length !== 1 ? 's' : ''} found
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Gigs Grid/List */}
        {filteredGigs.length === 0 ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800/60 p-12 text-center">
            <Search className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-1">No gigs found</p>
            <p className="text-slate-600 text-xs">Try adjusting your filters or search</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredGigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGigs.map((gig) => (
              <GigListItem key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GigCard({ gig }: { gig: SampleGig }) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800/60 hover:border-cyan-500/30 transition-all overflow-hidden group">
      {/* Poster Info */}
      <div className="p-3 flex items-center gap-2 border-b border-slate-800/60">
        {gig.poster_avatar ? (
          <img src={gig.poster_avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {gig.poster_name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white font-medium truncate">{gig.poster_name}</p>
          <p className="text-xs text-slate-500">{gig.distance_mins} min away</p>
        </div>
        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded">
          ${gig.pay_min}–${gig.pay_max}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-semibold text-white line-clamp-2">{gig.title}</h3>
        <p className="text-xs text-slate-400 line-clamp-2">{gig.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
            <Tag className="w-3 h-3" />
            {gig.category}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
            <MapPin className="w-3 h-3" />
            {gig.is_remote ? 'Remote' : gig.campus_location}
          </span>
        </div>
      </div>

      {/* Apply Button */}
      <div className="p-3 pt-0">
        <button className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xs font-semibold rounded-lg transition-all">
          Apply Now
        </button>
      </div>
    </div>
  );
}

function GigListItem({ gig }: { gig: SampleGig }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800/60 hover:border-cyan-500/30 transition-all">
      {/* Poster Avatar */}
      <div className="flex-shrink-0">
        {gig.poster_avatar ? (
          <img src={gig.poster_avatar} alt="" className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {gig.poster_name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white mb-0.5">{gig.title}</h3>
            <p className="text-xs text-slate-400 line-clamp-1">{gig.description}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Tag className="w-3 h-3" />
                {gig.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3 h-3" />
                {gig.is_remote ? 'Remote' : gig.campus_location}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                {gig.distance_mins} min
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-emerald-400">${gig.pay_min}–${gig.pay_max}</p>
            <button className="mt-2 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xs font-semibold rounded-lg transition-all">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
