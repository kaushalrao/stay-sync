import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getFirebaseConfig = () => {
    if (typeof window !== 'undefined' && (window as any).__firebase_config) {
        try {
            return JSON.parse((window as any).__firebase_config);
        } catch (e) {
            console.error("Failed to parse injected firebase config", e);
        }
    }

    return {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
};

export const appId = typeof window !== 'undefined' && (window as any).__app_id ? (window as any).__app_id : 'guest-greeter-default';
const firebaseConfig = getFirebaseConfig();

export const app = !getApps().length && firebaseConfig.apiKey ? initializeApp(firebaseConfig) : (getApps().length ? getApp() : undefined);
export const auth = app ? getAuth(app) : ({} as any);
export const db = app ? getFirestore(app) : ({} as any);
