import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PassState } from '../hooks/usePass';

interface Device {
  deviceId: string;
  boundAt: number;
}

interface Props {
  passState: PassState;
  onClose: () => void;
  onAddDevice: () => void;
}

export default function PassDashboard({ passState, onClose, onAddDevice }: Props) {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    fetch('/api/devices', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setDevices(Array.isArray(data.devices) ? data.devices : []))
      .catch(() => setDevices([]))
      .finally(() => setLoadingDevices(false));
  }, []);

  const handleRemove = async (deviceId: string) => {
    setRemoving(deviceId);
    try {
      const res = await fetch('/api/devices/remove', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
      if (res.ok) {
        setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
      }
    } finally {
      setRemoving(null);
    }
  };

  const formatDate = (ts: number | null | undefined) => {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDeviceDate = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const tierName = passState.tier === 'group' ? 'Group Pass' : 'Trip Pass';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{t('pass.dashboard.title')}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-tertiary transition-colors hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Pass summary */}
        <div className="mb-5 rounded-xl border border-jade/20 bg-jade-wash p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-jade/10 px-2.5 py-0.5 text-xs font-semibold text-jade">
                <span className="h-1.5 w-1.5 rounded-full bg-jade" />
                {tierName}
              </span>
              {passState.expired ? (
                <p className="mt-1.5 text-sm font-medium text-red-600">{t('pass.dashboard.expired')}</p>
              ) : passState.expiresAt ? (
                <p className="mt-1.5 text-sm text-ink-secondary">
                  {t('pass.dashboard.expires', { date: formatDate(passState.expiresAt) })}
                </p>
              ) : null}
            </div>
            {typeof passState.messagesUsed === 'number' && typeof passState.messageAllowance === 'number' && (
              <div className="text-right">
                <p className="text-sm font-semibold text-ink">
                  {t('pass.dashboard.messagesUsed', {
                    used: passState.messagesUsed,
                    total: passState.messageAllowance,
                  })}
                </p>
                {typeof passState.remaining === 'number' && (
                  <p className="text-xs text-ink-secondary">
                    {t('pass.dashboard.messagesLeft', { remaining: passState.remaining })}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Usage bar */}
          {typeof passState.messagesUsed === 'number' && typeof passState.messageAllowance === 'number' && passState.messageAllowance > 0 && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-jade/20">
              <div
                className="h-full rounded-full bg-jade transition-all"
                style={{ width: `${Math.min(100, (passState.messagesUsed / passState.messageAllowance) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">{t('pass.dashboard.devicesTitle')}</h3>
            {passState.deviceCount != null && passState.maxDevices != null && (
              <span className="text-xs text-ink-tertiary">
                {t('pass.dashboard.devicesCount', { count: passState.deviceCount, max: passState.maxDevices })}
              </span>
            )}
          </div>

          {loadingDevices ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-stone-100" />
              ))}
            </div>
          ) : devices.length === 0 ? (
            <p className="text-sm text-ink-tertiary">{t('pass.dashboard.addDevice')}</p>
          ) : (
            <ul className="space-y-2">
              {devices.map((device) => (
                <li
                  key={device.deviceId}
                  className="flex items-center justify-between rounded-lg border border-hairline bg-stone-50 px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-ink-secondary">
                      {device.deviceId.slice(0, 8)}…
                    </p>
                    <p className="text-[11px] text-ink-tertiary">Added {formatDeviceDate(device.boundAt)}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(device.deviceId)}
                    disabled={removing === device.deviceId}
                    className="ml-3 shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    {removing === device.deviceId ? t('pass.dashboard.removing') : t('pass.dashboard.removeDevice')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add device / footer */}
        <div className="flex items-center gap-3">
          {passState.deviceCount != null && passState.maxDevices != null && passState.deviceCount < passState.maxDevices && (
            <button
              onClick={onAddDevice}
              className="flex-1 rounded-xl border border-jade/30 py-2.5 text-sm font-medium text-jade transition-colors hover:bg-jade-wash"
            >
              {t('pass.dashboard.addDevice')}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-jade py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4145]"
          >
            {t('pass.dashboard.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
