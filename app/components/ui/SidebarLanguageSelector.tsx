import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

export function SidebarLanguageSelector() {
    const { i18n } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by performing a two-pass render
    if (!mounted) {
        return (
            <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        );
    }

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        Cookies.set("i18next", lang, {
            expires: 365,
            path: "/",
            sameSite: 'strict'
        });
    };

    const currentLang = i18n.language || "en";

    return (
        <div className="mt-auto px-4 py-2">
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => changeLanguage("en")}
                    className={`
            flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all duration-200
            ${currentLang === "en"
                            ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }
          `}
                    aria-label="Switch to English"
                >
                    <span className="text-base">🇬🇧</span>
                    <span>English</span>
                </button>
                <button
                    onClick={() => changeLanguage("kn")}
                    className={`
            flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all duration-200
            ${currentLang === "kn"
                            ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }
          `}
                    aria-label="Switch to Kannada"
                >
                    <span className="text-base">🇮🇳</span>
                    <span>ಕನ್ನಡ</span>
                </button>
            </div>
        </div>
    );
}
