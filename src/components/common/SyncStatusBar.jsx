import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { syncService } from '../../services/syncService';
import { Button } from './Button';

export const SyncStatusBar = () => {
  const [syncState, setSyncState] = useState(syncService.getState());
  const [pendingCount, setPendingCount] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const updatePendingCount = async () => {
      const ops = await syncService.getPendingOperations();
      setPendingCount(ops.length);
    };

    updatePendingCount();

    const unsubscribe = syncService.subscribe((state) => {
      setSyncState(state);
      updatePendingCount();
    });

    return () => unsubscribe();
  }, []);

  const handleToggleOffline = () => {
    syncService.setSimulatedOffline(!syncState.simulatedOffline);
  };

  const handleManualSync = async () => {
    await syncService.syncAll();
    const ops = await syncService.getPendingOperations();
    setPendingCount(ops.length);
  };

  const handleSimulateFailure = async () => {
    await syncService.syncAll({ forceFail: true });
    const ops = await syncService.getPendingOperations();
    setPendingCount(ops.length);
  };

  // Color & Badge config based on status
  const getStatusBadge = () => {
    if (!syncState.isOnline || syncState.syncStatus === 'offline') {
      return {
        bg: 'bg-amber-500/15 border-amber-400/40 text-amber-900',
        dot: 'bg-amber-500',
        icon: <WifiOff className="w-3.5 h-3.5 text-amber-600" />,
        label: 'Offline (Field Mode)',
        sublabel: 'Saving to device only'
      };
    }
    if (syncState.syncStatus === 'failed') {
      return {
        bg: 'bg-rose-500/15 border-rose-400/40 text-rose-900',
        dot: 'bg-rose-500 animate-pulse',
        icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
        label: 'Sync Failed',
        sublabel: syncState.lastSyncError || 'Network timeout'
      };
    }
    if (pendingCount > 0 || syncState.syncStatus === 'pending') {
      return {
        bg: 'bg-sky-500/15 border-sky-400/40 text-sky-900',
        dot: 'bg-sky-500 animate-ping',
        icon: <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${syncState.isSyncing ? 'animate-spin' : ''}`} />,
        label: `Pending Sync (${pendingCount})`,
        sublabel: 'Queued on device'
      };
    }
    return {
      bg: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-900',
      dot: 'bg-emerald-500',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      label: 'Online',
      sublabel: syncState.lastSyncTimestamp ? `Synced ${syncState.lastSyncTimestamp}` : 'Ready'
    };
  };

  const badge = getStatusBadge();

  return (
    <>
      {/* Compact Top-Level Sync Status Indicator Pill */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowDetailsModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${badge.bg} hover:shadow-xs`}
          title="Click to view offline storage & sync control"
        >
          <span className="relative flex h-2 w-2">
            <span className={`rounded-full h-2 w-2 ${badge.dot}`} />
          </span>
          {badge.icon}
          <span className="text-[11px] leading-tight font-bold">{badge.label}</span>
        </button>

        {/* Quick action: Sync retry button if failed or pending */}
        {(syncState.syncStatus === 'failed' || pendingCount > 0) && syncState.isOnline && (
          <button
            onClick={handleManualSync}
            disabled={syncState.isSyncing}
            className="text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs"
          >
            <RefreshCw className={`w-3 h-3 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
            <span>Retry</span>
          </button>
        )}
      </div>

      {/* Connectivity & Offline Diagnostics Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                  {syncState.isOnline ? (
                    <Wifi className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm">Connectivity & Offline Sync</h3>
                  <p className="text-[11px] text-slate-300">IndexedDB Local Persistence Engine</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-3.5 text-xs text-slate-700 overflow-y-auto">
              {/* Status Banner */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between ${badge.bg}`}>
                <div className="flex items-center gap-2">
                  {badge.icon}
                  <div>
                    <span className="font-bold text-xs block">{badge.label}</span>
                    <span className="text-[11px]">{badge.sublabel}</span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/70 border border-current">
                  {syncState.syncStatus}
                </span>
              </div>

              {/* SIH Hackathon Demo Transparency Disclosure */}
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>SIH 2026 Prototype Architecture Disclosure</span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  This demo runs in <strong>Simulated Cloud Sync Mode</strong>. All worker drafts, evidence records, and assessor rubric evaluations are securely saved in your browser's local <strong>IndexedDB (Dexie)</strong>. No data is transmitted to an external unverified server.
                </p>
              </div>

              {/* Interactive Demo Simulation Controls */}
              <div className="border border-slate-200 rounded-2xl p-3 space-y-2.5 bg-slate-50">
                <span className="font-bold text-slate-900 block text-xs">Field Test Controls (Hackathon Jury Evaluation):</span>
                
                {/* Simulated Offline Toggle */}
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">Simulate Offline Network</span>
                    <span className="text-[10px] text-slate-500">Test form drafting and evaluation when cell connection drops</span>
                  </div>
                  <button
                    onClick={handleToggleOffline}
                    className="text-teal-600 hover:text-teal-700"
                    title="Toggle simulated offline state"
                  >
                    {syncState.simulatedOffline ? (
                      <ToggleRight className="w-8 h-8 text-amber-600 fill-amber-100" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Queue Status and Action Buttons */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-600">
                    Pending sync operations: <strong>{pendingCount}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={!syncState.isOnline || syncState.isSyncing}
                      onClick={handleManualSync}
                      className="text-xs py-1"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                      Sync Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSimulateFailure}
                      className="text-[10px] py-1 text-rose-700 border-rose-300 hover:bg-rose-50"
                      title="Simulate network failure to test retry behavior"
                    >
                      Test Failure
                    </Button>
                  </div>
                </div>
              </div>

              {/* Data Loss Safety Notice */}
              <div className="text-[11px] text-slate-500 space-y-1 bg-slate-100/70 p-2.5 rounded-xl">
                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <Info className="w-3.5 h-3.5" />
                  <span>Device Storage Persistence</span>
                </div>
                <p>
                  Offline records persist across browser reloads. However, clearing your browser website cache or using ephemeral incognito mode will erase local device data.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
