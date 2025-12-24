/**
 * Path Sync Debug Panel - Dev tool for testing path sync
 * Add this to your homepage or anywhere during alpha testing
 * 
 * @usage
 * import { PathSyncDebugPanel } from '@/components/debug/PathSyncDebugPanel';
 * <PathSyncDebugPanel />
 */

import { useState } from 'react';
import { syncPathsToDatabase, forceSyncPaths, getSyncStatus } from '@/services/pathSyncService';

export const PathSyncDebugPanel = () => {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState(getSyncStatus());
  const [lastSync, setLastSync] = useState<string>('');

  const handleSync = async () => {
    setSyncing(true);
    setLastSync('Syncing...');
    
    const success = await syncPathsToDatabase();
    
    setStatus(getSyncStatus());
    setLastSync(success ? 'Sync completed ✅' : 'Sync failed ⚠️');
    setSyncing(false);
  };

  const handleForceSync = async () => {
    setSyncing(true);
    setLastSync('Force syncing...');
    
    const success = await forceSyncPaths();
    
    setStatus(getSyncStatus());
    setLastSync(success ? 'Force sync completed ✅' : 'Force sync failed ⚠️');
    setSyncing(false);
  };

  const handleRefreshStatus = () => {
    setStatus(getSyncStatus());
  };

  return (
    <div className="fixed bottom-20 right-4 bg-slate-800/95 backdrop-blur-sm p-4 rounded-lg border border-slate-700 shadow-xl z-50 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Path Sync</h3>
        <button
          onClick={handleRefreshStatus}
          className="text-xs text-cyan-400 hover:text-cyan-300"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-2 mb-3 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Status:</span>
          <span className={status.isSynced ? 'text-green-400' : 'text-yellow-400'}>
            {status.isSynced ? 'Synced ✓' : 'Needs Sync'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Version:</span>
          <span className="text-white">{status.currentVersion}</span>
        </div>
        {status.lastVersion && (
          <div className="flex justify-between">
            <span className="text-slate-400">Last:</span>
            <span className="text-slate-300">{status.lastVersion}</span>
          </div>
        )}
      </div>

      {lastSync && (
        <div className="text-xs text-cyan-400 mb-2 bg-slate-900/50 p-2 rounded">
          {lastSync}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 text-white text-xs py-2 px-3 rounded transition-colors"
        >
          {syncing ? 'Syncing...' : 'Sync'}
        </button>
        <button
          onClick={handleForceSync}
          disabled={syncing}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white text-xs py-2 px-3 rounded transition-colors"
        >
          Force
        </button>
      </div>

      <div className="mt-2 text-[10px] text-slate-500">
        Sync updates DB from constants
      </div>
    </div>
  );
};
