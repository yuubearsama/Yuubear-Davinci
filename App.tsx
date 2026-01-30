
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameDisplay from './components/GameDisplay';
import GameControls from './components/GameControls';
import { GameState, GameCommand, PeerMessage } from './types';
import { INITIAL_STATE } from './constants';
import { playSound } from './services/soundService';

declare const Peer: any;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [peerId, setPeerId] = useState<string>('');
  const [remoteId, setRemoteId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [mode, setMode] = useState<'HOST' | 'REMOTE' | 'NONE'>('NONE');
  const [isHostUIHidden, setIsHostUIHidden] = useState<boolean>(false);
  
  const peerRef = useRef<any>(null);
  const connRef = useRef<any>(null);

  // Function to generate a random 3-digit numeric ID
  const generateShortId = () => {
    return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  };

  // --- Game Logic ---
  const handleCommand = useCallback((command: GameCommand, payload?: any) => {
    setGameState((prev) => {
      let next = { ...prev };
      switch (command) {
        case GameCommand.ADD_1000:
          if (prev.player1 + prev.p1Change >= 1000 && prev.player2 + prev.p2Change >= 1000) {
            next.p1Change -= 1000;
            next.p2Change -= 1000;
            next.displayValue += 2000;
          }
          break;
        case GameCommand.SUB_1000:
          next.p1Change += 1000;
          next.p2Change += 1000;
          next.displayValue -= 2000;
          break;
        case GameCommand.EQUALS:
          // Play "Pissanaup.wav" (mapped to 'up')
          playSound('up');
          if (prev.pool + prev.displayValue >= 0 && prev.player1 + prev.p1Change >= 0 && prev.player2 + prev.p2Change >= 0) {
            next.player1 += prev.p1Change;
            next.player2 += prev.p2Change;
            next.pool += prev.displayValue;
            next.p1Change = 0;
            next.p2Change = 0;
            next.displayValue = 0;
          } else {
            next.p1Change = 0;
            next.p2Change = 0;
            next.displayValue = 0;
          }
          break;
        case GameCommand.SEND_TO_P1:
          // Play "Pissanaup.wav" (mapped to 'up')
          playSound('up');
          if (prev.pool > 0) {
            next.player1 += prev.pool;
            next.pool = 0;
          }
          next.p1Change = 0;
          next.p2Change = 0;
          next.displayValue = 0;
          break;
        case GameCommand.SEND_TO_P2:
          // Play "Pissanaup.wav" (mapped to 'up')
          playSound('up');
          if (prev.pool > 0) {
            next.player2 += prev.pool;
            next.pool = 0;
          }
          next.p1Change = 0;
          next.p2Change = 0;
          next.displayValue = 0;
          break;
        case GameCommand.CLEAR_POOL:
          // Play "Pissanadown.wav" (mapped to 'down')
          playSound('down');
          if (prev.pool > 0) {
            next.pool = 0;
          }
          next.p1Change = 0;
          next.p2Change = 0;
          next.displayValue = 0;
          break;
        case GameCommand.RESET:
          playSound('confirm');
          return INITIAL_STATE;
        case GameCommand.UPDATE_NAME:
          if (payload.id === 'name1') next.name1 = payload.value;
          if (payload.id === 'name2') next.name2 = payload.value;
          break;
      }
      return next;
    });
  }, []);

  // --- Networking ---
  const cleanupConnection = () => {
    if (connRef.current) {
      connRef.current.close();
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    connRef.current = null;
    peerRef.current = null;
    setIsConnected(false);
    setPeerId('');
    setRemoteId('');
    setMode('NONE');
    setIsHostUIHidden(false);
  };

  const disconnect = () => {
    cleanupConnection();
  };

  const startHost = () => {
    setMode('HOST');
    const shortId = generateShortId();
    const peer = new Peer(shortId);
    
    peer.on('open', (id: string) => {
      setPeerId(id);
    });

    peer.on('error', (err: any) => {
      if (err.type === 'unavailable-id') {
        peer.destroy();
        startHost();
      } else {
        console.error('Peer error:', err);
      }
    });

    peer.on('connection', (conn: any) => {
      connRef.current = conn;
      setIsConnected(true);
      playSound('connect');
      conn.on('data', (data: PeerMessage) => {
        if (data.type === 'COMMAND') {
          handleCommand(data.payload.command, data.payload.payload);
        }
      });
      conn.on('close', () => setIsConnected(false));
    });
    peerRef.current = peer;
  };

  const startJoin = () => {
    setMode('REMOTE');
    const peer = new Peer();
    peer.on('open', (id: string) => setPeerId(id));
    peerRef.current = peer;
  };

  const connectToHost = () => {
    if (!remoteId || remoteId.length !== 3) return;
    const cleanId = remoteId.trim();
    const conn = peerRef.current.connect(cleanId);
    connRef.current = conn;
    conn.on('open', () => {
      setIsConnected(true);
      playSound('connect');
    });
    conn.on('data', (data: PeerMessage) => {
      if (data.type === 'SYNC_STATE') {
        setGameState(data.payload);
      }
    });
    conn.on('close', () => setIsConnected(false));
  };

  useEffect(() => {
    if (mode === 'HOST' && isConnected && connRef.current) {
      connRef.current.send({ type: 'SYNC_STATE', payload: gameState });
    }
  }, [gameState, mode, isConnected]);

  const remoteCommand = (command: GameCommand, payload?: any) => {
    if (mode === 'REMOTE' && isConnected && connRef.current) {
      connRef.current.send({ type: 'COMMAND', payload: { command, payload } });
    } else {
      handleCommand(command, payload);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 transition-all duration-500 ${isHostUIHidden ? 'bg-black' : 'bg-[#282828]'}`}>
      
      {/* Session Controls */}
      {isConnected && (
        <div className={`fixed top-4 right-4 flex flex-col items-end gap-2 z-50 transition-opacity ${isHostUIHidden ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
          <div className="bg-green-900/80 backdrop-blur-sm border border-green-500 text-green-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            CONNECTED AS {mode}
          </div>
          
          <div className="flex gap-2">
            {mode === 'HOST' && (
              <button 
                onClick={() => setIsHostUIHidden(!isHostUIHidden)}
                className="bg-gray-700 hover:bg-gray-600 text-white text-[10px] px-3 py-1 rounded-md font-bold uppercase transition-colors"
              >
                {isHostUIHidden ? 'Show UI' : 'Hide UI'}
              </button>
            )}
            <button 
              onClick={disconnect}
              className="bg-red-900/80 hover:bg-red-700 text-white text-[10px] px-3 py-1 rounded-md font-bold uppercase transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Setup Menu */}
      {mode === 'NONE' && (
        <div className="mt-20 flex flex-col items-center gap-6 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
          <h1 className="text-3xl font-bold text-purple-400">Pool Calculator</h1>
          <div className="flex flex-col gap-4 w-64">
            <button
              onClick={startHost}
              className="bg-purple-600 hover:bg-purple-700 py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95"
            >
              Start as Host (Dashboard)
            </button>
            <button
              onClick={startJoin}
              className="bg-gray-700 hover:bg-gray-600 py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95"
            >
              Start as Remote
            </button>
          </div>
        </div>
      )}

      {/* Connection Interface */}
      {mode !== 'NONE' && !isConnected && (
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl border border-gray-700 mb-8 mt-4 shadow-2xl animate-in zoom-in duration-300">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-200">{mode === 'HOST' ? 'รหัสห้อง (Host)' : 'เข้าร่วมห้อง (Remote)'}</h2>
              <button onClick={disconnect} className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium">ย้อนกลับ</button>
            </div>
            
            {mode === 'HOST' && (
              <>
                <div className="bg-black/40 p-6 rounded-xl font-mono text-center text-5xl text-purple-400 border border-purple-900/30 tracking-[0.2em] font-bold shadow-inner">
                  {peerId || '...'}
                </div>
                <div className="text-gray-400 animate-pulse text-center text-sm">
                  บอกรหัส 3 หลักนี้กับผู้ที่จะมารับรีโมท
                </div>
              </>
            )}
            
            {mode === 'REMOTE' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 uppercase tracking-widest ml-1 font-bold">ใส่รหัส 3 หลักที่นี่</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000"
                    autoFocus
                    className="w-full bg-gray-900 border-2 border-gray-700 p-5 rounded-2xl text-white focus:outline-none focus:border-purple-500 text-center text-5xl tracking-[0.2em] font-bold shadow-inner transition-all"
                    value={remoteId}
                    maxLength={3}
                    onChange={(e) => setRemoteId(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <button
                  onClick={connectToHost}
                  disabled={remoteId.length !== 3}
                  className={`w-full py-5 rounded-2xl font-bold transition-all uppercase tracking-widest text-lg shadow-lg ${
                    remoteId.length === 3 
                      ? 'bg-purple-600 hover:bg-purple-500 active:scale-[0.98] shadow-purple-900/20' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Join Room
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Game Interface */}
      <div className={`flex-1 flex flex-col items-center w-full transition-all duration-700 ${isHostUIHidden ? 'justify-center' : ''}`}>
        
        {/* Scoreboard */}
        <GameDisplay state={gameState} />

        {/* Controls logic */}
        {((mode === 'HOST' && !isConnected) || 
           (mode === 'REMOTE' && isConnected) || 
           (mode === 'NONE')) && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             <GameControls state={gameState} onCommand={remoteCommand} isRemote={mode === 'REMOTE'} />
          </div>
        )}

        {/* Host Dashboard Feedback */}
        {mode === 'HOST' && isConnected && !isHostUIHidden && (
          <div className="mt-10 bg-purple-900/30 p-8 rounded-3xl border border-purple-500/30 text-center max-w-lg animate-in zoom-in duration-300 shadow-2xl backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-purple-300 mb-2">Remote Connected!</h2>
            <div className="flex justify-center items-center gap-2 mb-4">
              <span className="text-gray-400 text-sm">Room Code:</span>
              <span className="font-mono text-white font-bold text-xl tracking-widest bg-black/40 px-3 py-1 rounded-lg border border-purple-500/20">{peerId}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              การเชื่อมต่อเสร็จสมบูรณ์ รีโมทกำลังควบคุมเครื่องนี้อยู่
            </p>
            <button 
              onClick={() => setIsHostUIHidden(true)}
              className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full text-white font-bold transition-all active:scale-95 border border-white/5"
            >
              Enter Fullscreen
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {!isHostUIHidden && (
        <footer className="w-full text-center py-8 text-gray-600 text-xs tracking-widest uppercase font-medium">
          Pool Calculator &bull; PeerSync Real-time
        </footer>
      )}
    </div>
  );
};

export default App;
