import { useState, useRef, useCallback } from 'react';

export const useSearch = () => {
  const [searchTime, setSearchTime] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const searchTimerRef = useRef(null);
  const searchStartTimeRef = useRef(null);

  const startSearch = useCallback(() => {
    setIsSearching(true);
    setSearchTime(0);
    searchStartTimeRef.current = Date.now();
    
    searchTimerRef.current = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);
    
    return searchStartTimeRef.current;
  }, []);

  const stopSearch = useCallback((result = { status: 'cancelled' }) => {
    setIsSearching(false);
    
    if (searchTimerRef.current) {
      clearInterval(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    
    if (searchStartTimeRef.current) {
      const searchDuration = Math.floor((Date.now() - searchStartTimeRef.current) / 1000);
      const searchRecord = {
        id: Date.now(),
        startTime: searchStartTimeRef.current,
        duration: searchDuration,
        result,
        timestamp: Date.now()
      };
      
      setSearchHistory(prev => [searchRecord, ...prev.slice(0, 9)]); // Keep last 10 searches
      searchStartTimeRef.current = null;
    }
    
    setSearchTime(0);
  }, []);

  const formatSearchTime = useCallback((seconds = searchTime) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [searchTime]);

  const getSearchStats = useCallback(() => {
    if (searchHistory.length === 0) return null;
    
    const totalSearches = searchHistory.length;
    const totalDuration = searchHistory.reduce((sum, search) => sum + search.duration, 0);
    const avgDuration = totalDuration / totalSearches;
    
    const successfulSearches = searchHistory.filter(s => s.result.status === 'matched').length;
    const successRate = totalSearches > 0 ? (successfulSearches / totalSearches) * 100 : 0;
    
    return {
      totalSearches,
      totalDuration,
      avgDuration: Math.round(avgDuration),
      successfulSearches,
      successRate: Math.round(successRate),
      lastSearch: searchHistory[0]
    };
  }, [searchHistory]);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
    };
  }, []);

  return {
    searchTime,
    isSearching,
    searchHistory,
    startSearch,
    stopSearch,
    formatSearchTime,
    getSearchStats,
    clearSearchHistory
  };
};