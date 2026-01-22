"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, FileText, Calendar, X } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { VoiceAgent } from '@/components/voice-agent';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'record' | 'appointment';
  title: string;
  subtitle: string;
  date: string;
  link: string;
}

const mockData: SearchResult[] = [
  {
    id: '1',
    type: 'record',
    title: 'Complete Blood Count (CBC)',
    subtitle: 'Apollo Diagnostics • Dr. Rajesh Sharma',
    date: '2024-12-15',
    link: '/records',
  },
  {
    id: '2',
    type: 'record',
    title: 'Chest X-Ray (PA View)',
    subtitle: 'Fortis Hospital • Dr. Priya Menon',
    date: '2024-12-10',
    link: '/records',
  },
  {
    id: '3',
    type: 'record',
    title: 'Lipid Profile Test',
    subtitle: 'Max Hospital • Dr. Vikram Singh',
    date: '2024-12-05',
    link: '/records',
  },
  {
    id: '4',
    type: 'record',
    title: 'ECG Report',
    subtitle: 'Medanta Hospital • Dr. Vikram Singh',
    date: '2024-11-28',
    link: '/records',
  },
  {
    id: '5',
    type: 'appointment',
    title: 'Dr. Vikram Singh - Cardiologist',
    subtitle: 'Medanta Hospital, Gurugram • In-Person',
    date: '2024-12-20',
    link: '/appointments',
  },
  {
    id: '6',
    type: 'appointment',
    title: 'Dr. Priya Menon - General Physician',
    subtitle: 'Virtual Consultation • Video Call',
    date: '2024-12-22',
    link: '/appointments',
  },
  {
    id: '7',
    type: 'appointment',
    title: 'Dr. Anil Kumar - Dermatologist',
    subtitle: 'Apollo Hospital • In-Person',
    date: '2024-12-25',
    link: '/appointments',
  },
];

const Navbar = () => {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: patientData } = useSWR(
      session?.user?.id ? `/api/fhir/Patient?id=${session.user.id}` : null,
      fetcher
  );

  const realName = patientData?.entry?.[0]?.resource?.name?.[0] 
     ? `${patientData.entry[0].resource.name[0].given?.join(' ') || ''} ${patientData.entry[0].resource.name[0].family || ''}`.trim()
     : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = mockData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleResultClick = () => {
    setIsSearchFocused(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <header className="h-16 border-b bg-white dark:bg-zinc-950 px-[19px] flex items-center justify-between sticky top-0 z-50">
      <div className="flex-1 max-w-xl relative" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          placeholder="Search records, appointments..."
          className="file:text-foreground placeholder:text-zinc-400 selection:bg-teal-600/30 selection:text-foreground border-none flex h-9 w-full min-w-0 rounded-md px-3 py-1 text-base shadow-none transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 pr-10 bg-zinc-50 dark:bg-zinc-900 focus-visible:ring-1 focus-visible:ring-teal-500"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {isSearchFocused && (searchResults.length > 0 || searchQuery.trim() !== '') && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-xl border border-[#e4e4e7] shadow-lg max-h-96 overflow-y-auto z-50">
            {searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={result.link}
                    onClick={handleResultClick}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${result.type === 'record' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                      {result.type === 'record' ? <FileText size={16} /> : <Calendar size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#09090b] dark:text-white truncate">{result.title}</p>
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${result.type === 'record' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          {result.type}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{result.subtitle}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">{result.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-zinc-500">No results found for &quot;{searchQuery}&quot;</p>
                <p className="text-xs text-zinc-400 mt-1">Try searching for records, appointments, or doctors</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* ... existing buttons ... */}
        
        {/* Voice Agent FAB will appear fixed on screen */}
        <VoiceAgent />
        
        <button 
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-teal-500 focus-visible:ring-teal-500/50 focus-visible:ring-[3px] hover:bg-zinc-100 dark:hover:bg-zinc-800 size-9 relative text-zinc-500"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
        </button>

        <button 
          className="justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-teal-500 focus-visible:ring-teal-500/50 focus-visible:ring-[3px] hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9 py-2 flex items-center gap-3 px-2"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[#09090b]">
              {realName || session?.user?.name || 'User'}
            </p>
            <p className="text-xs text-zinc-500 capitalize">{session?.user?.role || 'patient'}</p>
          </div>
          <span className="relative flex size-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-teal-600 items-center justify-center border-2 border-teal-200">
             {session?.user?.role === 'doctor' ? (
                <span className="font-bold text-white text-xs">DR</span>
            ) : (
                <User className="h-5 w-5 text-white" />
            )}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
