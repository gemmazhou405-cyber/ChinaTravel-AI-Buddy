import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Tab = 'claim' | 'recover';
type ClaimScreen = 'form' | 'success';

interface Props {
  initialTab?: Tab;
  onClose: () => void;
  onPassActivated: () => Promise<void>;
}

export default function ClaimModal({ initialTab = 'claim', onClose, onPassActivated }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [claimScreen, setClaimScreen] = useState<ClaimScreen>('form');

  // Claim form state
  const [saleId, setSaleId] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Recover form state
  const [recoverCode, setRecoverCode] = useState('');
  const [recoverError, setRecoverError] = useState('');
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoverSuccess, setRecoverSuccess] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Format recovery code display
  const formatCode = (raw: string) => {
    const clean = raw.replace(/-/g, '').toUpperCase();
    return [clean.slice(0, 4), clean.slice(4, 8), clean.slice(8, 12)].filter(Boolean).join('-');
  };

  // Auto-format recover input
  const handleRecoverCodeChange = (val: string) => {
    const clean = val.replace(/[^A-Z2-9]/gi, '').toUpperCase().slice(0, 12);
    setRecoverCode(formatCode(clean));
  };

  const claimErrorKey = (code: string) => {
    if (code === 'not_found') return t('pass.claim.errorNotFound');
    if (code === 'already_claimed') return t('pass.claim.errorAlreadyClaimed');
    if (code === 'max_devices') return t('pass.claim.errorMaxDevices');
    return t('pass.claim.errorGeneric');
  };

  const recoverErrorKey = (code: string) => {
    if (code === 'not_found') return t('pass.recover.errorNotFound');
    if (code === 'max_devices') return t('pass.recover.errorMaxDevices');
    if (code === 'rate_limited') return t('pass.recover.errorRateLimited');
    return t('pass.recover.errorGeneric');
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = saleId.trim();
    if (!id) return;
    setClaimLoading(true);
    setClaimError('');
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setClaimError(claimErrorKey(data?.error ?? ''));
        return;
      }
      setRecoveryCode(data.recoveryCode ?? '');
      setClaimScreen('success');
      await onPassActivated();
    } catch {
      setClaimError(t('pass.claim.errorGeneric'));
    } finally {
      setClaimLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = recoverCode.replace(/-/g, '').trim();
    if (code.length < 12) return;
    setRecoverLoading(true);
    setRecoverError('');
    try {
      const res = await fetch('/api/recover', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryCode: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRecoverError(recoverErrorKey(data?.error ?? ''));
        return;
      }
      setRecoverSuccess(true);
      await onPassActivated();
    } catch {
      setRecoverError(t('pass.recover.errorGeneric'));
    } finally {
      setRecoverLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {tab === 'claim' && claimScreen === 'success'
                ? t('pass.claim.successTitle')
                : tab === 'claim'
                ? t('pass.claim.title')
                : recoverSuccess
                ? t('pass.recover.successTitle')
                : t('pass.recover.title')}
            </h2>
            {!(claimScreen === 'success' || recoverSuccess) && (
              <p className="mt-0.5 text-sm text-ink-secondary">
                {tab === 'claim' ? t('pass.claim.subtitle') : t('pass.recover.subtitle')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-4 shrink-0 text-ink-tertiary transition-colors hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Tab switcher — only when on form screens */}
        {claimScreen === 'form' && !recoverSuccess && (
          <div className="mb-5 flex gap-1 rounded-xl bg-stone-100 p-1">
            {(['claim', 'recover'] as Tab[]).map((t_) => (
              <button
                key={t_}
                onClick={() => setTab(t_)}
                className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
                  tab === t_ ? 'bg-white text-ink shadow-sm' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {t_ === 'claim' ? t('pass.claim.title') : t('pass.recover.title')}
              </button>
            ))}
          </div>
        )}

        {/* ── CLAIM TAB ── */}
        {tab === 'claim' && claimScreen === 'form' && (
          <form onSubmit={handleClaim} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                {t('pass.claim.saleIdLabel')}
              </label>
              <input
                type="text"
                value={saleId}
                onChange={(e) => setSaleId(e.target.value)}
                placeholder={t('pass.claim.saleIdPlaceholder')}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-lg border border-hairline bg-stone-50 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-tertiary focus:border-jade focus:outline-none focus:ring-2 focus:ring-jade/20"
              />
            </div>
            {claimError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{claimError}</p>
            )}
            <button
              type="submit"
              disabled={claimLoading || !saleId.trim()}
              className="w-full rounded-xl bg-jade py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4145] disabled:opacity-50"
            >
              {claimLoading ? t('pass.claim.submitting') : t('pass.claim.submit')}
            </button>
          </form>
        )}

        {/* ── CLAIM SUCCESS ── */}
        {tab === 'claim' && claimScreen === 'success' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                {t('pass.claim.recoveryCodeLabel')}
              </p>
              <div className="flex items-center gap-2">
                <span className="flex-1 font-mono text-xl font-bold tracking-widest text-ink">
                  {formatCode(recoveryCode)}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100"
                >
                  {copied ? t('pass.claim.copied') : t('pass.claim.copyCode')}
                </button>
              </div>
              <p className="mt-2 text-xs text-amber-700">{t('pass.claim.recoveryCodeNote')}</p>
            </div>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-jade"
              />
              <span className="text-sm text-ink-secondary">{t('pass.claim.confirmSaved')}</span>
            </label>
            <button
              onClick={onClose}
              disabled={!confirmed}
              className="w-full rounded-xl bg-jade py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4145] disabled:opacity-50"
            >
              {t('pass.claim.done')}
            </button>
          </div>
        )}

        {/* ── RECOVER TAB ── */}
        {tab === 'recover' && !recoverSuccess && (
          <form onSubmit={handleRecover} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                {t('pass.recover.codeLabel')}
              </label>
              <input
                type="text"
                value={recoverCode}
                onChange={(e) => handleRecoverCodeChange(e.target.value)}
                placeholder={t('pass.recover.codePlaceholder')}
                autoComplete="off"
                spellCheck={false}
                maxLength={14}
                className="w-full rounded-lg border border-hairline bg-stone-50 px-3.5 py-2.5 font-mono text-sm tracking-widest text-ink placeholder:font-sans placeholder:tracking-normal placeholder:text-ink-tertiary focus:border-jade focus:outline-none focus:ring-2 focus:ring-jade/20"
              />
            </div>
            {recoverError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{recoverError}</p>
            )}
            <button
              type="submit"
              disabled={recoverLoading || recoverCode.replace(/-/g, '').length < 12}
              className="w-full rounded-xl bg-jade py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4145] disabled:opacity-50"
            >
              {recoverLoading ? t('pass.recover.submitting') : t('pass.recover.submit')}
            </button>
          </form>
        )}

        {/* ── RECOVER SUCCESS ── */}
        {tab === 'recover' && recoverSuccess && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-jade-wash px-4 py-3">
              <span className="text-2xl">✓</span>
              <p className="text-sm text-jade">{t('pass.recover.successTitle')}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-jade py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4145]"
            >
              {t('pass.recover.done')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
