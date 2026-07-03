import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { User } from 'firebase/auth';
import { UserState } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { trackAppError, trackEvent, trackEventOnce } from '../lib/analytics';

interface Message {
  id: number;
  role: 'user' | 'buddy';
  text: string;
}

const SUGGESTIONS = ['chat.suggestions.s1', 'chat.suggestions.s2', 'chat.suggestions.s3', 'chat.suggestions.s4'];

interface Props {
  onClose: () => void;
  user: User | null;
  userState: UserState | null;
  onNeedAuth: () => void;
  onResendVerification: () => Promise<void>;
  onRefreshUserState: () => Promise<UserState | null>;
}

export default function ChatModal({ onClose, user, userState, onNeedAuth, onResendVerification, onRefreshUserState }: Props) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'buddy', text: t('chat.welcome') },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isGoogleUser = user?.providerData.some((provider) => provider.providerId === 'google.com') ?? false;
  const needsEmailVerification = Boolean(user && !user.emailVerified && !isGoogleUser);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = async (text: string) => {
    if (!text.trim()) return;
    if (typing) return;

    if (!userState) {
      onNeedAuth();
      return;
    }

    if (needsEmailVerification) {
      const verifyMsg: Message = {
        id: Date.now(),
        role: 'buddy',
        text: `${t('chat.verifyEmail')} ${t('chat.verifyEmailHint')}`,
      };
      setMessages((prev) => [...prev, verifyMsg]);
      return;
    }

    const userMsg: Message = { id: Date.now(), role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
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
          const authMsg: Message = {
            id: Date.now() + 1,
            role: 'buddy',
            text: t('chat.notLoggedIn'),
          };
          setMessages((prev) => [...prev, authMsg]);
          onNeedAuth();
          return;
        }

        if (data?.error === 'quota_exhausted') {
          void trackEvent('quota_exhausted', {
            tool: 'buddy',
            quotaType: data.quotaType || 'total',
            plan: data.plan || userState.plan,
          }, userState.uid);
          const limitMsg: Message = {
            id: Date.now() + 1,
            role: 'buddy',
            text: data.quotaType === 'daily'
              ? t('chat.dailyQuotaExceeded', { limit: data.limit || userState.dailyBuddyAiLimit })
              : t('chat.quotaExceeded', { limit: data.limit || userState.buddyAiQuotaTotal, plan: data.plan || userState.plan }),
          };
          setMessages((prev) => [...prev, limitMsg]);
          return;
        }

        if (data?.error === 'email_verification_required') {
          const verifyMsg: Message = {
            id: Date.now() + 1,
            role: 'buddy',
            text: `${t('chat.verifyEmail')} ${t('chat.verifyEmailHint')}`,
          };
          setMessages((prev) => [...prev, verifyMsg]);
          return;
        }

        if (data?.error === 'rate_limited') {
          const rateMsg: Message = {
            id: Date.now() + 1,
            role: 'buddy',
            text: t('chat.rateLimited'),
          };
          setMessages((prev) => [...prev, rateMsg]);
          return;
        }

        if (data?.error === 'service_unavailable' || data?.error === 'upstream_error' || data?.error === 'upstream_timeout') {
          const serviceMsg: Message = {
            id: Date.now() + 1,
            role: 'buddy',
            text: t('chat.serviceUnavailable'),
          };
          setMessages((prev) => [...prev, serviceMsg]);
          return;
        }

        throw new Error(data?.error || `buddy_request_failed:${response.status}`);
      }

      const replyText = data.reply || data.message || t('chat.trouble');

      const reply: Message = { id: Date.now() + 1, role: 'buddy', text: replyText };
      setMessages((prev) => [...prev, reply]);
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
      const errMsg: Message = {
        id: Date.now() + 1,
        role: 'buddy',
        text: t('chat.connectionIssue'),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-[#155e63]">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">{t('chat.title')}</h3>
            <p className="text-white/60 text-xs">{t('chat.subtitle')}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'buddy' && (
                <div className="w-6 h-6 bg-[#155e63] rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#155e63] text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#155e63] rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pt-3 pb-1 bg-white border-t border-gray-50">
            <p className="text-gray-400 text-xs mb-2">{t('chat.suggested')}</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(t(s))}
                  disabled={typing}
                  className="flex-shrink-0 text-xs bg-[#155e63]/8 text-[#155e63] px-3 py-1.5 rounded-full hover:bg-[#155e63]/15 transition-colors whitespace-nowrap"
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
              className="mt-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#155e63] shadow-sm hover:bg-amber-100"
            >
              {t('auth.resendVerification')}
            </button>
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder={t('chat.placeholder')}
            className="flex-1 text-sm px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[#155e63]/40 focus:bg-white transition-all placeholder:text-gray-300"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || typing}
            className="w-10 h-10 bg-[#155e63] rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-[#0e4a4e] active:scale-95 transition-all"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
