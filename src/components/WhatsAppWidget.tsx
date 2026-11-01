import React, { useState } from 'react';
import { X, Send, Bot, PhoneCall, ExternalLink } from 'lucide-react';
import { Language } from '../utils/translations';

interface WhatsAppWidgetProps {
  lang: Language;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'support'; text: string; time: string }>>([
    {
      sender: 'support',
      text:
        lang === 'ar'
          ? 'مرحباً بك في الدعم الفني المباشر لـ "مدبر" من درة. كيف يمكننا مساعدتك في إدارة محافظ شموس أو كلود اليوم؟'
          : 'Welcome to Mudabbir by Durrat Priority Support! How can we assist with your Shomoos Elm or Claude OCR wallets today?',
      time: '10:00 AM',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal;
    setInputVal('');
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    // Simulated quick support auto-reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'support',
          text:
            lang === 'ar'
              ? 'تم استلام طلبك. فريق الدعم في "درة" يتحقق من حالة الاتصال بروابط "علم" ومحافظ منشآتك. للمساعدة الفورية اتصل على الرقم الموحد 920000000.'
              : 'Message received. Durrat Hospitality Technical Ops is reviewing your property wallet status. Elm gateway health is currently 100% operational.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 700);
  };

  const handleQuickQuestion = (q: string) => {
    setInputVal(q);
  };

  return (
    <>
      {/* Floating Circular Green WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none ring-4 ring-emerald-500/20"
          title="Mudabbir WhatsApp Support"
          aria-label="WhatsApp Support"
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <svg
              className="w-8 h-8 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.89-9.884 9.89m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          )}
        </button>
      </div>

      {/* WhatsApp Chat Popup Box */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 flex flex-col h-[480px]">
          {/* Header */}
          <div className="bg-[#0b3824] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#25D366]">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  Mudabbir Support (Durrat)
                  <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
                </h4>
                <p className="text-[11px] text-[#93c7af]">Typically replies in seconds</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#93c7af] hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]/20">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className="text-[9px] text-slate-400 block text-right mt-1">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick FAQ Prompts */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleQuickQuestion('How do I top up my Shomoos wallet?')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-full whitespace-nowrap text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Top-up question
            </button>
            <button
              onClick={() => handleQuickQuestion('Check Elm Shomoos API status')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-full whitespace-nowrap text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Elm status
            </button>
            <button
              onClick={() => handleQuickQuestion('Claude OCR token pricing in SAR')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-full whitespace-nowrap text-slate-700 hover:bg-slate-100 transition-colors"
            >
              OCR pricing
            </button>
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#25D366]"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
