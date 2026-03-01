import React from 'react';
import { Smartphone, Check, Copy, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const PreviewPhone: React.FC<{
    message: string;
    onChange: (val: string) => void;
    onSend: () => void;
    onCopy: () => void;
    copied: boolean;
}> = ({ message, onChange, onSend, onCopy, copied }) => (
    <div className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 md:border-2 shadow-xl md:shadow-2xl bg-white dark:bg-[#000] md:ring-4 ring-slate-200/50 dark:ring-slate-800/50 flex flex-col min-h-[400px] md:min-h-0">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 md:p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-green-400/30">
                        <Smartphone size={16} className="md:w-[18px] md:h-[18px]" />
                    </div>

                </div>
                <div>
                    <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">Guest</div>
                    <div className="text-[9px] md:text-[10px] text-green-500 dark:text-green-400 font-medium flex items-center gap-1">
                        <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></span>
                        Online
                    </div>
                </div>
            </div>
            <button
                onClick={onCopy}
                className="p-2 md:p-2.5 hover:bg-slate-300 dark:hover:bg-white/10 rounded-full transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95 group relative"
                title={copied ? "Copied!" : "Copy message"}
            >
                {copied ? (
                    <Check size={16} className="text-green-500 dark:text-green-400 md:w-[18px] md:h-[18px]" />
                ) : (
                    <Copy size={16} className="group-hover:scale-110 transition-transform md:w-[18px] md:h-[18px]" />
                )}
            </button>
        </div>

        {/* Chat Background */}
        <div className="relative flex-1 w-full bg-[#e5ddd5] dark:bg-[#0b141a] p-4 dark:bg-[url('https://i.pinimg.com/originals/97/c0/07/97c00759d90d786d9b6096d274ad3e07.png')] dark:bg-opacity-10 dark:bg-contain flex flex-col overflow-hidden">
            {/* Message Bubble */}
            <div className="relative flex-1 animate-fade-in group/bubble flex flex-col">
                <div className="bg-white dark:bg-[#005c4b] p-3 md:p-4 rounded-2xl text-slate-900 dark:text-white text-sm leading-relaxed shadow-lg dark:shadow-xl relative border border-slate-200/50 dark:border-transparent flex-1 flex flex-col">
                    {/* Editable Message Area */}
                    <textarea
                        value={message}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Your message preview will appear here..."
                        className="w-full bg-transparent border-none focus:ring-0 p-0 m-0 resize-none whitespace-pre-wrap break-words flex-1 text-sm leading-relaxed scrollbar-hide text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400"
                        spellCheck={false}
                    />

                    {/* Timestamp and status */}
                    <div className="text-[10px] text-slate-400 dark:text-slate-300 text-right mt-2 flex items-center justify-end gap-1.5">
                        <span className="font-medium">12:00 PM</span>
                        <div className="flex">
                            <Check size={14} className="text-blue-500 dark:text-blue-400 -mr-2" />
                            <Check size={14} className="text-blue-500 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-white/5 hidden lg:block w-full z-20 space-y-3">
            <Button
                onClick={onSend}
                disabled={!message}
                className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0f7a6a] disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 shadow-lg hover:shadow-xl disabled:shadow-none text-white border-none py-4 text-base font-bold rounded-2xl transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 group"
            >
                <MessageCircle size={20} fill="white" className="text-white group-hover:scale-110 transition-transform" />
                Send via WhatsApp
            </Button>
        </div>
    </div>
);
