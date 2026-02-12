import React from 'react';
import { Smartphone, Check, Copy, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const PreviewPhone: React.FC<{
    message: string;
    onSend: () => void;
    onCopy: () => void;
    copied: boolean;
}> = ({ message, onSend, onCopy, copied }) => (
    <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-2xl bg-slate-100 dark:bg-[#000] ring-4 ring-slate-300/50 dark:ring-slate-800/50">
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-200 to-slate-100 dark:from-[#1f2937] dark:to-[#1a2332] p-4 flex items-center justify-between border-b border-slate-300 dark:border-white/5">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-green-400/30">
                        <Smartphone size={18} />
                    </div>
                    {/* Online status dot */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-200 dark:border-[#1f2937]"></div>
                </div>
                <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Guest</div>
                    <div className="text-[10px] text-green-500 dark:text-green-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></span>
                        Online
                    </div>
                </div>
            </div>
            <button
                onClick={onCopy}
                className="p-2.5 hover:bg-slate-300 dark:hover:bg-white/10 rounded-full transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95 group relative"
                title={copied ? "Copied!" : "Copy message"}
            >
                {copied ? (
                    <Check size={18} className="text-green-500 dark:text-green-400" />
                ) : (
                    <Copy size={18} className="group-hover:scale-110 transition-transform" />
                )}
            </button>
        </div>

        {/* Chat Background */}
        <div className="relative bg-[#e5ddd5] dark:bg-[#0b141a] min-h-[350px] lg:min-h-[400px] p-4 dark:bg-[url('https://i.pinimg.com/originals/97/c0/07/97c00759d90d786d9b6096d274ad3e07.png')] dark:bg-opacity-10 dark:bg-contain">
            {/* Message Bubble */}
            <div className="relative max-w-[90%] animate-fade-in">
                <div className="bg-white dark:bg-[#005c4b] p-4 rounded-2xl text-slate-900 dark:text-white text-sm leading-relaxed shadow-lg dark:shadow-xl relative border border-slate-200/50 dark:border-transparent">
                    {/* Message content */}
                    <div className="whitespace-pre-wrap break-words">{message || 'Your message preview will appear here...'}</div>

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

        {/* Desktop Action Bar */}
        <div className="p-4 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-[#1a2332] dark:to-[#1f2937] border-t border-slate-300 dark:border-white/5 hidden lg:block">
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
