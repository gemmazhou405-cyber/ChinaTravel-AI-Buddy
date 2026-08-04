import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Sparkles, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trackAppError, trackEvent, trackEventOnce } from '../lib/analytics';
import { renderChatMarkdown } from '../lib/chatMarkdown';
import { submitTripLead } from '../lib/tripLead';
import type { PassState } from '../hooks/usePass';

interface Message {
  id: number;
  role: 'user' | 'buddy';
  text: string;
  kind?: 'error';
  retryText?: string;
  retryRequestId?: string;
}

const SS_ATTEMPT_KEY = 'chinaease_buddy_lead_question_count';

const SUGGESTIONS = [
  'chat.suggestions.s1',
  'chat.suggestions.s2',
  'chat.suggestions.s3',
  'chat.suggestions.s4',
];

interface Props {
  onClose: () => void;
  passState: PassState | null;
  refreshPassState: () => Promise<void>;
  onOpenToolkit?: () => void;
  onViewPricing?: () => void;
  initialPrompt?: string;
}

export default function ChatModal({ onClose, passState, refreshPassState, onOpenToolkit, onViewPricing, initialPrompt }: Props) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'buddy', text: t('chat.welcome') },
  ]);
  const [input, setInput] = useState(initialPrompt ?? '');
  const [typing, setTyping] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasUserMessages = messages.some((m) => m.role === 'user');

  type LeadCtaState = 'hidden' | 'cta' | 'form' | 'submitting' | 'success' | 'error';
  const [leadCtaState, setLeadCtaState] = useState<LeadCtaState>('hidden');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadDate, setLeadDate] = useState('');
  const [leadTravelers, setLeadTravelers] = useState('');
  const [leadHelp, setLeadHelp] = useState('');
  const [leadApiError, setLeadApiError] = useState<'generic' | 'too_many' | null>(null);
  const [sendAttemptCount, setSendAttemptCount] = useState<number>(() => {
    const stored = sessionStorage.getItem(SS_ATTEMPT_KEY);
    return stored ? (parseInt(stored, 10) || 0) : 0;
  });

  // Lock body scroll; save + restore scroll position on unmount
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    return () => {
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  // Track the real visible viewport height so the panel shrinks when the iOS
  // keyboard opens instead of leaving a blank gap above the input bar.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      document.documentElement.style.setProperty('--buddy-vvp-height', `${vv.height}px`);
      document.documentElement.style.setProperty('--buddy-vvp-top', `${vv.offsetTop}px`);
      requestAnimationFrame(scrollToBottom);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      document.documentElement.style.removeProperty('--buddy-vvp-height');
      document.documentElement.style.removeProperty('--buddy-vvp-top');
    };
  }, [scrollToBottom]);

  useEffect(() => {
    requestAnimationFrame(scrollToBottom);
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (leadCtaState !== 'hidden') return;
    if (sessionStorage.getItem('chinaease:leadCtaDismissed') === '1') return;
    if (sessionStorage.getItem('chinaease:leadSubmitted') === '1') return;
    if (sendAttemptCount >= 3) {
      setLeadCtaState('cta');
      void trackEvent('lead_cta_shown', { trigger: 'buddy_cta' });
    }
  }, [sendAttemptCount, leadCtaState]);

  useEffect(() => {
    sessionStorage.setItem(SS_ATTEMPT_KEY, String(sendAttemptCount));
  }, [sendAttemptCount]);

  const resizeInput = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    resizeInput();
  }, [resizeInput]);

  const pushBuddy = (text: string, kind?: 'error', retry?: { text: string; requestId: string }) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, role: 'buddy', text, kind, retryText: retry?.text, retryRequestId: retry?.requestId },
    ]);
  };

  const buildContext = (items: Message[]) => {
    const eligible = items
      .filter((item) => item.id !== 0 && item.kind !== 'error')
      .filter((item) => item.role === 'user' || item.role === 'buddy')
      .map((item) => ({ role: item.role, text: item.text.trim().slice(0, 600) }))
      .filter((item) => item.text);
    const selected: Array<{ role: 'user' | 'buddy'; text: string }> = [];
    let total = 0;
    for (const item of eligible.slice().reverse()) {
      if (selected.length >= 6) break;
      if (total + item.text.length > 3000) continue;
      selected.push(item);
      total += item.text.length;
    }
    return selected.reverse();
  };

  const handleRestart = () => {
    setMessages([{ id: 0, role: 'buddy', text: t('chat.welcome') }]);
    setSendAttemptCount(0);
    sessionStorage.removeItem(SS_ATTEMPT_KEY);
    setLeadCtaState('hidden');
    setLeadEmail('');
    setLeadDate('');
    setLeadTravelers('');
    setLeadHelp('');
    setLeadApiError(null);
  };

  const handleLeadSubmit = async () => {
    const emailTrimmed = leadEmail.trim().toLowerCase();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setLeadApiError('generic');
      return;
    }
    setLeadCtaState('submitting');
    setLeadApiError(null);
    void trackEvent('lead_submit', { trigger: 'buddy_cta' });
    const travelers = leadTravelers ? parseInt(leadTravelers, 10) : undefined;
    const result = await submitTripLead({
      email: emailTrimmed,
      travelDate: leadDate.trim() || undefined,
      travelers: travelers && travelers >= 1 && travelers <= 20 ? travelers : undefined,
      helpWith: leadHelp.trim() || undefined,
    });
    if (result === 'success') {
      setLeadCtaState('success');
      sessionStorage.setItem('chinaease:leadSubmitted', '1');
      void trackEvent('lead_success', { trigger: 'buddy_cta' });
    } else {
      setLeadCtaState('error');
      setLeadApiError(result === 'too_many' ? 'too_many' : 'generic');
      void trackEvent('lead_error', { trigger: 'buddy_cta', errorCode: result });
    }
  };

  const send = async (text: string, options?: { requestId?: string; retry?: boolean }) => {
    if (!text.trim() || typing || streaming) return;

    const trimmedText = text.trim();
    const requestId = options?.requestId || crypto.randomUUID();
    const context = buildContext(messages);
    if (options?.retry) {
      const last = context[context.length - 1];
      if (last?.role === 'user' && last.text === trimmedText) context.pop();
    }
    if (!options?.retry) {
      setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: trimmedText }]);
      setSendAttemptCount((prev) => prev + 1);
    }
    setInput('');
    requestAnimationFrame(resizeInput);
    setTyping(true);

    try {
      const response = await fetch('/api/buddy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId, message: trimmedText, context, stream: true }),
      });

      if (!response.ok) {
        let data: { error?: string; message?: string; tier?: string } = {};
        const responseText = await response.text();
        if (responseText) { try { data = JSON.parse(responseText); } catch {} }
        console.error('[buddy] /api/buddy/chat failed', { status: response.status });
        if (data?.error === 'quota_exhausted' || data?.error === 'pass_expired') {
          void trackEvent('quota_exhausted', { tool: 'buddy', code: data.error, tier: data.tier || passState?.tier });
          pushBuddy(t('chat.quotaExhausted'), 'error');
          return;
        }
        if (data?.error === 'free_quota_exhausted') { pushBuddy(t('chat.freeQuotaExhausted'), 'error'); return; }
        if (data?.error === 'rate_limited') { pushBuddy(t('chat.rateLimited'), 'error'); return; }
        if (data?.error === 'service_unavailable' || data?.error === 'upstream_error' || data?.error === 'upstream_timeout') {
          pushBuddy(t('chat.serviceUnavailable'), 'error', { text: trimmedText, requestId });
          return;
        }
        throw new Error(data?.error || `buddy_request_failed:${response.status}`);
      }

      const contentType = response.headers.get('content-type') ?? '';

      if (contentType.includes('text/event-stream') && response.body) {
        // ── Streaming path ──────────────────────────────────────────────────
        const streamId = Date.now() + 1;
        setMessages((prev) => [...prev, { id: streamId, role: 'buddy', text: '' }]);
        setTyping(false);   // hide dots — live bubble is now visible
        setStreaming(true); // disable input while streaming

        const reader = response.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        let accumulated = '';

        try {
          outer: while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const events = buf.split('\n\n');
            buf = events.pop() ?? '';
            for (const event of events) {
              const trimmedEvt = event.trim();
              if (!trimmedEvt.startsWith('data:')) continue;
              const raw = trimmedEvt.slice('data:'.length).trim();
              let parsed: { delta?: string; done?: boolean; usage?: object; error?: string };
              try { parsed = JSON.parse(raw); } catch { continue; }

              if (parsed.delta) {
                accumulated += parsed.delta;
                setMessages((prev) =>
                  prev.map((m) => (m.id === streamId ? { ...m, text: accumulated } : m)),
                );
              }
              if (parsed.done) {
                void refreshPassState();
                trackEventOnce('buddy:first-success', 'buddy_first_success', { tool: 'buddy', tier: passState?.tier });
                break outer;
              }
              if (parsed.error) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamId && !m.text
                      ? { ...m, text: t('chat.serviceUnavailable'), kind: 'error' }
                      : m,
                  ),
                );
                break outer;
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Trim to max; replace empty placeholder with error
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== streamId) return m;
            if (!accumulated) return { ...m, text: t('chat.trouble'), kind: 'error' as const };
            return { ...m, text: accumulated.slice(0, 5000) };
          }),
        );
      } else {
        // ── Non-streaming fallback (should not normally occur) ───────────────
        const responseText = await response.text();
        let data: { reply?: string; message?: string } = {};
        if (responseText) { try { data = JSON.parse(responseText); } catch {} }
        pushBuddy(data.reply || data.message || t('chat.trouble'));
        await refreshPassState();
        trackEventOnce('buddy:first-success', 'buddy_first_success', { tool: 'buddy', tier: passState?.tier });
      }
    } catch (error) {
      console.error('[buddy] chat request error', error);
      trackAppError('ai_connection_error', { tool: 'buddy', context: 'chat_send', errorCode: error instanceof Error ? error.message.slice(0, 80) : 'buddy_request_failed' });
      pushBuddy(t('chat.connectionIssue'), 'error', { text: trimmedText, requestId });
    } finally {
      setTyping(false);
      setStreaming(false);
    }
  };

  const content = (
    <>
      <div className="fixed inset-0 z-[9998] hidden bg-black/30 md:block" onClick={onClose} />

      <div className="buddy-panel-vvp animate-modal-in fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-surface md:inset-y-0 md:left-auto md:right-0 md:w-[480px] md:shadow-2xl">
        <div
          className="flex flex-shrink-0 items-center gap-2 border-b border-hairline bg-surface px-3"
          style={{ paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: '14px' }}
        >
          <button onClick={onClose} aria-label="Back" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-ink-tertiary transition-colors active:bg-canvas md:hidden">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-jade md:flex">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1 text-center md:text-left">
            <h2 className="text-sm font-semibold text-ink">{t('chat.title')}</h2>
            <p className="text-[11px] text-ink-tertiary">{t('chat.subtitle')}</p>
          </div>
          {hasUserMessages ? (
            <button onClick={handleRestart} aria-label="New chat" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-ink-tertiary transition-colors active:bg-canvas md:hidden">
              <RotateCcw className="h-5 w-5" strokeWidth={1.5} />
            </button>
          ) : (
            <div className="h-10 w-10 flex-shrink-0 md:hidden" aria-hidden />
          )}
          {hasUserMessages && (
            <button onClick={handleRestart} aria-label="New chat" className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-ink-tertiary transition-colors hover:bg-canvas hover:text-ink md:flex">
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
          <button onClick={onClose} aria-label="Close" className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-ink-tertiary transition-colors hover:bg-canvas hover:text-ink md:flex">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-canvas">
          {!hasUserMessages ? (
            <div className="space-y-4 p-4">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-jade">
                  <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-hairline bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink">
                  {messages[0]?.text}
                </div>
              </div>
              <p className="pl-9 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">{t('chat.suggested')}</p>
              <div className="space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(t(s))}
                    disabled={typing || streaming}
                    className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-left text-sm font-medium text-ink transition-colors hover:border-jade/30 hover:bg-jade-wash active:bg-jade-wash disabled:opacity-50"
                  >
                    {t(s)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'buddy' && (
                    <div className={`mr-2 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${m.kind === 'error' ? 'bg-red-600' : 'bg-jade'}`}>
                      {m.kind === 'error'
                        ? <AlertCircle className="h-3 w-3 text-white" strokeWidth={1.5} />
                        : <Sparkles className="h-3 w-3 text-white" strokeWidth={1.5} />}
                    </div>
                  )}
                  {m.role === 'user' ? (
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-jade px-3.5 py-2.5 text-sm leading-relaxed text-white">
                      {m.text}
                    </div>
                  ) : m.kind === 'error' ? (
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm leading-relaxed text-red-800">
                      {m.text}
                      {m.retryText && m.retryRequestId && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => send(m.retryText || '', { requestId: m.retryRequestId, retry: true })}
                            disabled={typing || streaming}
                            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100 disabled:opacity-50"
                          >
                            {t('chat.retry')}
                          </button>
                          {onViewPricing && (
                            <button
                              onClick={onViewPricing}
                              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-jade shadow-sm transition-colors hover:bg-jade-wash"
                            >
                              {t('chat.getPass')}
                            </button>
                          )}
                          {onOpenToolkit && (
                            <button
                              onClick={() => { onClose(); onOpenToolkit(); }}
                              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-jade shadow-sm transition-colors hover:bg-red-100"
                            >
                              {t('chat.openToolkit')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="chat-md max-w-[85%] rounded-2xl rounded-bl-sm border border-hairline bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink"
                      dangerouslySetInnerHTML={{ __html: renderChatMarkdown(m.text) }}
                    />
                  )}
                </div>
              ))}
              {typing && !streaming && (
                <div className="flex items-start gap-2" role="status" aria-label={t('chat.title')}>
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-jade">
                    <Sparkles className="h-3 w-3 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="w-[68%] space-y-2 rounded-2xl rounded-bl-sm border border-hairline bg-surface px-3.5 py-3">
                    <div className="h-2.5 w-full animate-pulse rounded bg-jade-wash" />
                    <div className="h-2.5 w-4/5 animate-pulse rounded bg-jade-wash [animation-delay:120ms]" />
                    <div className="h-2.5 w-3/5 animate-pulse rounded bg-jade-wash [animation-delay:240ms]" />
                  </div>
                </div>
              )}

              {leadCtaState === 'cta' && (
                <div role="region" aria-label={t('lead.ctaTitle')} className="rounded-2xl border border-jade/20 bg-jade-wash p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{t('lead.ctaTitle')}</p>
                    <button
                      onClick={() => {
                        sessionStorage.setItem('chinaease:leadCtaDismissed', '1');
                        setLeadCtaState('hidden');
                        void trackEvent('lead_form_dismiss', { trigger: 'buddy_cta' });
                      }}
                      aria-label={t('lead.ctaDismiss')}
                      className="flex-shrink-0 text-ink-tertiary hover:text-ink"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{t('lead.ctaDesc')}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setLeadCtaState('form');
                        void trackEvent('lead_cta_clicked', { trigger: 'buddy_cta' });
                      }}
                      className="rounded-full bg-jade px-4 py-2 text-xs font-semibold text-white"
                    >
                      {t('lead.ctaButton')}
                    </button>
                    <button
                      onClick={() => {
                        sessionStorage.setItem('chinaease:leadCtaDismissed', '1');
                        setLeadCtaState('hidden');
                        void trackEvent('lead_form_dismiss', { trigger: 'buddy_cta' });
                      }}
                      className="rounded-full border border-hairline px-4 py-2 text-xs font-semibold text-ink-secondary"
                    >
                      {t('lead.ctaDismiss')}
                    </button>
                  </div>
                </div>
              )}

              {(leadCtaState === 'form' || leadCtaState === 'submitting' || leadCtaState === 'error') && (
                <div className="rounded-2xl border border-jade/20 bg-jade-wash p-4">
                  <p className="text-sm font-semibold text-ink">{t('lead.formTitle')}</p>

                  {leadApiError && (
                    <p role="alert" aria-live="assertive" className="mt-2 text-xs font-semibold text-red-600">
                      {t(leadApiError === 'too_many' ? 'lead.errorTooMany' : 'lead.errorGeneric')}
                    </p>
                  )}

                  <div className="mt-3 space-y-3">
                    <div>
                      <label htmlFor="lead-email" className="text-xs font-semibold text-ink">
                        {t('lead.fieldEmail')} *
                      </label>
                      <input
                        id="lead-email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        disabled={leadCtaState === 'submitting'}
                        maxLength={160}
                        style={{ fontSize: '16px' }}
                        className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-jade/40 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label htmlFor="lead-date" className="text-xs font-semibold text-ink">
                        {t('lead.fieldDate')}
                      </label>
                      <input
                        id="lead-date"
                        type="text"
                        autoComplete="off"
                        value={leadDate}
                        onChange={(e) => setLeadDate(e.target.value)}
                        disabled={leadCtaState === 'submitting'}
                        maxLength={80}
                        placeholder={t('lead.fieldDatePlaceholder')}
                        style={{ fontSize: '16px' }}
                        className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-jade/40 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label htmlFor="lead-travelers" className="text-xs font-semibold text-ink">
                        {t('lead.fieldTravelers')}
                      </label>
                      <input
                        id="lead-travelers"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={20}
                        step={1}
                        value={leadTravelers}
                        onChange={(e) => setLeadTravelers(e.target.value)}
                        disabled={leadCtaState === 'submitting'}
                        style={{ fontSize: '16px' }}
                        className="mt-1 w-24 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-jade/40 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label htmlFor="lead-help" className="text-xs font-semibold text-ink">
                        {t('lead.fieldHelp')}
                      </label>
                      <textarea
                        id="lead-help"
                        rows={3}
                        maxLength={500}
                        value={leadHelp}
                        onChange={(e) => setLeadHelp(e.target.value)}
                        disabled={leadCtaState === 'submitting'}
                        placeholder={t('lead.fieldHelpPlaceholder')}
                        style={{ fontSize: '16px' }}
                        className="mt-1 w-full resize-none rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-jade/40 disabled:opacity-60"
                      />
                      <p className="mt-0.5 text-right text-xs text-ink-tertiary">
                        {t('lead.fieldHelpCount', { count: leadHelp.length })}
                      </p>
                    </div>
                  </div>

                  {/* Honeypot — hidden from real users */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="hidden"
                    defaultValue=""
                  />

                  <button
                    onClick={() => void handleLeadSubmit()}
                    disabled={leadCtaState === 'submitting'}
                    aria-busy={leadCtaState === 'submitting'}
                    className="mt-4 w-full rounded-full bg-jade py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {leadCtaState === 'submitting' ? t('lead.submitting') : t('lead.submit')}
                  </button>

                  <p className="mt-2 text-xs leading-relaxed text-ink-tertiary">
                    {t('lead.consent')}{' '}
                    <a href="/privacy" className="underline hover:text-ink-secondary">
                      {t('lead.consentLink')}
                    </a>
                  </p>
                </div>
              )}

              {leadCtaState === 'success' && (
                <div role="status" aria-live="polite" className="rounded-2xl border border-jade/20 bg-jade-wash px-4 py-3">
                  <p className="text-sm font-semibold text-jade">{t('lead.success')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="flex flex-shrink-0 items-end gap-2 border-t border-hairline bg-surface px-4 pt-3"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            disabled={typing || streaming}
            onChange={(e) => { setInput(e.target.value); resizeInput(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input); } }}
            placeholder={t('chat.placeholder')}
            className="max-h-32 min-w-0 flex-1 resize-none rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-tertiary focus:border-jade disabled:opacity-60"
          />
          <button
            onClick={() => void send(input)}
            disabled={!input.trim() || typing}
            aria-label={t('chat.askBuddy')}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-jade transition-colors hover:bg-[#0B4145] disabled:opacity-30"
          >
            <Send className="h-4 w-4 text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
