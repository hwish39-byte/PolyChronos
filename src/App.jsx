import { useState, useEffect } from 'react';
import axios from 'axios';
import Lobby from './components/Lobby';
import LoadingScreen from './components/LoadingScreen';
import TradingTerminal from './components/TradingTerminal';
import Result from './components/Result';
import { processTradeData } from './lib/utils';

function App() {
  const [appMode, setAppMode] = useState('lobby'); // lobby, loading, sim, result
  const [loadingState, setLoadingState] = useState('idle'); // idle, fetching, ready
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [simulationData, setSimulationData] = useState([]);
  const [blindMode, setBlindMode] = useState(false);
  const [resultData, setResultData] = useState(null);

  // --- Browser History Sync ---
  useEffect(() => {
    // 1. Initial State Replacement
    if (!window.history.state) {
      window.history.replaceState({ mode: 'lobby' }, '');
    }

    // 2. Listen for Popstate (Back/Forward)
    const handlePopState = (event) => {
      if (event.state && event.state.mode) {
        setAppMode(event.state.mode);
      } else {
        setAppMode('lobby');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 3. Push State on Change
  useEffect(() => {
    const currentHistoryMode = window.history.state?.mode;
    if (currentHistoryMode !== appMode) {
      window.history.pushState({ mode: appMode }, '');
    }
  }, [appMode]);

  const handleSelectScenario = async (scenario) => {
    setSelectedScenario(scenario);
    
    // 1. Check Cache
    const cacheKey = `poly_cache_${scenario.slug}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        console.log("⚡ Cache Hit! Instant Load.");
        try {
            const data = JSON.parse(cached);
            if (Array.isArray(data) && data.length > 0) {
                 setSimulationData(data);
                 setAppMode('sim');
                 return;
            } else {
                console.warn("Invalid cached data");
                localStorage.removeItem(cacheKey);
            }
        } catch (e) {
            console.error("Cache parse error", e);
            localStorage.removeItem(cacheKey);
        }
    }

    // 2. Fetch if miss
    setAppMode('loading');
    setLoadingState('fetching');
    
    try {
        // Artificial delay for "Cool Animation" (at least 1.5s)
        const startTime = Date.now();
        
        // Use relative URL or env var in production, but localhost for dev as per original
        const response = await axios.get(`http://localhost:3001/api/trades/${scenario.slug}`);
        const cleanData = processTradeData(response.data);
        
        // Calculate remaining time to satisfy min duration
        const elapsed = Date.now() - startTime;
        const minDuration = 1500;
        if (elapsed < minDuration) {
            await new Promise(r => setTimeout(r, minDuration - elapsed));
        }

        setSimulationData(cleanData);
        setLoadingState('ready');
        
        // Cache it
        try {
            localStorage.setItem(cacheKey, JSON.stringify(cleanData));
        } catch (e) {
            console.warn("Storage full or error", e);
        }

    } catch (error) {
        console.error("Load failed", error);
        setAppMode('lobby'); // Go back on error
        alert("Failed to load scenario data");
    }
  };
  
  const handleEnterSim = () => {
      setAppMode('sim');
      setLoadingState('idle');
  };

  const handleSimulationFinish = (data) => {
    setResultData(data);
    setTimeout(() => {
        setAppMode('result');
    }, 1000);
  };

  const handleRestart = () => {
    setAppMode('lobby');
    setResultData(null);
    setSelectedScenario(null);
  };

  return (
    <>
      {appMode === 'lobby' && (
        <Lobby 
            onSelect={handleSelectScenario} 
            blindMode={blindMode} 
            setBlindMode={setBlindMode} 
        />
      )}
      
      {appMode === 'loading' && (
          <LoadingScreen 
              status={loadingState} 
              onEnter={handleEnterSim} 
          />
      )}

      {appMode === 'sim' && selectedScenario && (
        <TradingTerminal 
            slug={selectedScenario.slug} 
            blindMode={blindMode}
            onFinish={handleSimulationFinish}
            preloadedData={simulationData}
        />
      )}
      
      {appMode === 'result' && resultData && (
        <Result 
            result={resultData} 
            onRestart={handleRestart} 
        />
      )}
    </>
  );
}

export default App;
