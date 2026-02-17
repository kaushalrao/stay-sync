"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { getOptions, languages, cookieName } from "./config";
import resourcesToBackend from "i18next-resources-to-backend";

// Initialize i18next once
i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(
        resourcesToBackend(
            (language: string, namespace: string) =>
                import(`./locales/${language}/${namespace}.json`)
        )
    )
    .init({
        ...getOptions(),
        lng: undefined, // let detect the language on client side
        detection: {
            order: ["cookie"],
            caches: ["cookie"],
            lookupCookie: cookieName,
        },
        preload: languages,
    });

export default i18next;
