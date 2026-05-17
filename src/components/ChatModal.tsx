import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { COZE_WORKER_URL, COZE_BOT_ID } from '../firebase-config';
import { UserState } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface Message {
  id: number;
  role: 'user' | 'buddy';
  text: string;
}

const SUGGESTIONS = ['chat.suggestions.s1', 'chat.suggestions.s2', 'chat.suggestions.s3', 'chat.suggestions.s4'];

interface Props {
  onClose: () => void;
  userState: UserState | null;
  onNeedAuth: () => void;
  onIncrementUsed: () => Promise<void>;
}

export default function ChatModal({ onClose, userState, onNeedAuth, onIncrementUsed }: Props) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'buddy', text: t('chat.welcome') },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = async (text: string) => {
    if (!text.trim()) return;

    if (!userState) {
      onNeedAuth();
      return;
    }

    const now = Date.now();

    if (userState.planExpiresAt && now > userState.planExpiresAt) {
      const expiredMsg: Message = {
        id: Date.now(),
        role: 'buddy',
        text: t('chat.planExpired'),
      };
      setMessages((prev) => [...prev, expiredMsg]);
      return;
    }

    const oneDayMs = 24 * 60 * 60 * 1000;
    const dailyReset = !userState.dailyResetAt || now - userState.dailyResetAt > oneDayMs;
    const currentDailyUsed = dailyReset ? 0 : userState.dailyBuddyAiUsed;
    if (currentDailyUsed >= userState.dailyBuddyAiLimit) {
      const dailyLimitMsg: Message = {
        id: Date.now(),
        role: 'buddy',
        text: t('chat.dailyQuotaExceeded', { limit: userState.dailyBuddyAiLimit }),
      };
      setMessages((prev) => [...prev, dailyLimitMsg]);
      return;
    }

    if (userState.buddyAiQuotaUsed >= userState.buddyAiQuotaTotal) {
      const limitMsg: Message = {
        id: Date.now(),
        role: 'buddy',
        text: t('chat.quotaExceeded', { limit: userState.buddyAiQuotaTotal, plan: userState.plan }),
      };
      setMessages((prev) => [...prev, limitMsg]);
      return;
    }

    const userMsg: Message = { id: Date.now(), role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const response = await fetch(COZE_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          botId: COZE_BOT_ID,
          userId: userState.uid,
        }),
      });
      const data = await response.json();
      const replyText = data.reply || data.answer || t('chat.trouble');

      const reply: Message = { id: Date.now() + 1, role: 'buddy', text: replyText };
      setMessages((prev) => [...prev, reply]);
      await onIncrementUsed();
    } catch {
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
                  className="flex-shrink-0 text-xs bg-[#155e63]/8 text-[#155e63] px-3 py-1.5 rounded-full hover:bg-[#155e63]/15 transition-colors whitespace-nowrap"
                >
                  {t(s)}
                </button>
              ))}
            </div>
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
            disabled={!input.trim()}
            className="w-10 h-10 bg-[#155e63] rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-[#0e4a4e] active:scale-95 transition-all"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
