import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { UserState } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { trackAppError, trackEvent, trackEventOnce } from '../lib/analytics';
import { renderChatMarkdown } from '../lib/chatMarkdown';

interface Message {
  id: number;
  role: 'user' | 'buddy';
  text: string;
  kind?: 'error';
}

const SUGGESTIONS = ['chat.suggestions.s1', 'chat.suggestions.s2', 'chat.suggestions.s3', 'chat.suggestions.s4'];

interface Props {
  onClose: () => void;
  user: User | null;
  userState: UserState | null;
  onNeedAuth: () => void;
  onResendVerification: () => Promise<void>;
  onRefreshUserState: () => Promise<UserState | null>;
  initialPrompt?: string;
}

export default function ChatModal({ onClose, user, userState, onNeedAuth, onResendVerification, onRefreshUserState, initialPrompt }: Props) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'buddy', text: t('chat.welcome') },
  ]);
  const [input, setInput] = useState(initialPrompt ?? '');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isGoogleUser = user?.providerData.some((provider) => provider.providerId === 'google.com') ?? false;
  const needsEmailVerification = Boolean(user && !user.emailVerified && !isGoogleUser);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    // rAF so layout (autosizing input, new bubbles) settles before we measure.
    requestAnimationFrame(scrollToBottom);
  }, [messages, typing, scrollToBottom]);

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

  const pushBuddy = (text: string, kind?: 'error') => {
    setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'buddy', text, kind }]);
  };

  const send = async (text: string) => {
    if (!text.trim()) return;
    if (typing) return;

    if (!userState) {
      onNeedAuth();
      return;
    }

    if (needsEmailVerification) {
      pushBuddy(`${t('chat.verifyEmail')} ${t('chat.verifyEmailHint')}`, 'error');
      return;
    }

    const userMsg: Message = { id: Date.now(), role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    requestAnimationFrame(resizeInput);
    setTyping(true);

    try {
      const token = await user?.getIdToken();
      if (!token) {
        onNeedAuth();
        return;
      }

      const requestId = crypto.randomUUID();
      const response = await fetch('/api/buddy/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId,
          message: text.trim(),
          context: [],
        }),
      });
      let data: { error?: string; message?: string; reply?: string; quotaType?: string; limit?: number; plan?: string } = {};
      const responseText = await response.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {
            error: response.status >= 500 ? 'service_unavailable' : 'buddy_request_failed',
            message: responseText.slice(0, 120),
          };
        }
      }

      if (!response.ok) {
        console.error('[buddy] /api/buddy/chat failed', { status: response.status, body: responseText.slice(0, 500) });
        if (data?.error === 'auth_required') {
          pushBuddy(t('chat.notLoggedIn'), 'error');
          onNeedAuth();
          return;
        }

        if (data?.error === 'quota_exhausted') {
          void trackEvent('quota_exhausted', {
            tool: 'buddy',
            quotaType: data.quotaType || 'total',
            plan: data.plan || userState.plan,
          }, userState.uid);
          pushBuddy(
            data.quotaType === 'daily'
              ? t('chat.dailyQuotaExceeded', { limit: data.limit || userState.dailyBuddyAiLimit })
              : t('chat.quotaExceeded', { limit: data.limit || userState.buddyAiQuotaTotal, plan: data.plan || userState.plan }),
            'error',
          );
          return;
        }

        if (data?.error === 'email_verification_required') {
          pushBuddy(`${t('chat.verifyEmail')} ${t('chat.verifyEmailHint')}`, 'error');
          return;
        }

        if (data?.error === 'rate_limited') {
          pushBuddy(t('chat.rateLimited'), 'error');
          return;
        }

        if (data?.error === 'service_unavailable' || data?.error === 'upstream_error' || data?.error === 'upstream_timeout') {
          pushBuddy(t('chat.serviceUnavailable'), 'error');
          return;
        }

        throw new Error(data?.error || `buddy_request_failed:${response.status}`);
      }

      const replyText = data.reply || data.message || t('chat.trouble');
      pushBuddy(replyText);
      await onRefreshUserState();
      trackEventOnce(`buddy:first-success:${userState.uid}`, 'buddy_first_success', {
        tool: 'buddy',
        plan: userState.plan,
      }, userState.uid);
    } catch (error) {
      console.error('[buddy] chat request error', error);
      trackAppError('ai_connection_error', {
        tool: 'buddy',
        context: 'chat_send',
        errorCode: error instanceof Error ? error.message.slice(0, 80) : 'buddy_request_failed',
      }, userState.uid);
      pushBuddy(t('chat.connectionIssue'), 'error');
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="animate-modal-in relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[20px] bg-surface shadow-card sm:max-w-md sm:rounded-[20px]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-hairline bg-surface px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-jade">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-ink">{t('chat.title')}</h3>
            <p className="text-xs text-ink-tertiary">{t('chat.subtitle')}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-tertiary transition-colors duration-hover ease-out hover:bg-canvas hover:text-ink">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-canvas p-4">
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
                <div className="max-w-[78%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-jade px-3.5 py-2.5 text-sm leading-relaxed text-white">
                  {m.text}
                </div>
              ) : m.kind === 'error' ? (
                <div className="max-w-[78%] rounded-2xl rounded-bl-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm leading-relaxed text-red-800">
                  {m.text}
                </div>
              ) : (
                <div
                  className="chat-md max-w-[78%] rounded-2xl rounded-bl-md border border-hairline bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink"
                  dangerouslySetInnerHTML={{ __html: renderChatMarkdown(m.text) }}
                />
              )}
            </div>
          ))}
          {typing && (
            <div className="flex items-start gap-2" aria-label={t('chat.title')} role="status">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-jade">
                <Sparkles className="h-3 w-3 text-white" strokeWidth={1.5} />
              </div>
              <div className="w-[68%] space-y-2 rounded-2xl rounded-bl-md border border-hairline bg-surface px-3.5 py-3">
                <div className="h-2.5 w-full animate-pulse rounded bg-jade-wash" />
                <div className="h-2.5 w-4/5 animate-pulse rounded bg-jade-wash [animation-delay:120ms]" />
                <div className="h-2.5 w-3/5 animate-pulse rounded bg-jade-wash [animation-delay:240ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="border-t border-hairline bg-surface px-4 pb-1 pt-3">
            <p className="mb-2 text-xs text-ink-tertiary">{t('chat.suggested')}</p>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(t(s))}
                  disabled={typing}
                  className="flex-shrink-0 whitespace-nowrap rounded-lg bg-jade-wash px-3 py-1.5 text-xs font-medium text-jade transition-colors duration-hover ease-out hover:bg-jade hover:text-white"
                >
                  {t(s)}
                </button>
              ))}
            </div>
          </div>
        )}

        {needsEmailVerification && (
          <div className="border-t border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold text-amber-800">{t('chat.verifyEmail')}</p>
            <p className="mt-0.5 text-xs text-amber-700">{t('chat.verifyEmailHint')}</p>
            <button
              onClick={onResendVerification}
              className="mt-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-jade shadow-sm transition-colors duration-hover ease-out hover:bg-amber-100"
            >
              {t('auth.resendVerification')}
            </button>
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2 border-t border-hairline bg-surface px-4 py-3">
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            disabled={typing}
            onChange={(e) => {
              setInput(e.target.value);
              resizeInput();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={t('chat.placeholder')}
            className="max-h-32 flex-1 resize-none rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 text-sm leading-relaxed text-ink outline-none transition-colors duration-hover ease-out placeholder:text-ink-tertiary focus:border-jade disabled:opacity-60"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || typing}
            aria-label={t('chat.askBuddy')}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-jade transition-colors duration-hover ease-out hover:bg-[#0B4145] disabled:opacity-30"
          >
            <Send className="h-4 w-4 text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
