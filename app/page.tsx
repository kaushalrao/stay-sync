"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, onSnapshot } from "firebase/firestore";

import { auth, db, appId } from './lib/firebase';
import { Property, Template, ViewState, ToastState } from './lib/types';

import { Toast } from './components/ui/Toast';
import { Header } from './components/Header';
import { AuthView } from './components/views/AuthView';
import { HomeView } from './components/views/HomeView';
import { SettingsView } from './components/views/SettingsView';
import { GreeterView } from './components/views/GreeterView';

export default function GuestGreeterPage() {
  const [view, setView] = useState<ViewState>('home');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data State
  const [properties, setProperties] = useState<Property[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // UI State
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });
  // Lifted state
  const [selectedPropId, setSelectedPropId] = useState('');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (!selectedPropId && properties.length > 0) {
      setSelectedPropId(properties[0].id);
    }
  }, [properties]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!user) {
      setProperties([]);
      setTemplates([]);
      return;
    }

    // Fetch Properties
    const qProps = query(collection(db, `artifacts/${appId}/users/${user.uid}/properties`));
    const unsubProps = onSnapshot(qProps, (snapshot) => {
      const props = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setProperties(props);
    });

    // Fetch Templates
    const qTemps = query(collection(db, `artifacts/${appId}/users/${user.uid}/templates`));
    const unsubTemps = onSnapshot(qTemps, (snapshot) => {
      const temps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
      setTemplates(temps);
    });

    return () => {
      unsubProps();
      unsubTemps();
    };
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <Loader2 size={48} className="animate-spin text-orange-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <React.Fragment>
        {/* Background Ambience */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none transform-gpu z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[100px] will-change-transform" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[100px] will-change-transform" />
        </div>
        <AuthView onAuthSuccess={(u) => setUser(u)} />
      </React.Fragment>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans relative flex flex-col shadow-2xl overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none transform-gpu z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[100px] will-change-transform" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[100px] will-change-transform" />
      </div>

      <Header
        view={view}
        setView={setView}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
        properties={properties}
        selectedPropId={selectedPropId}
        setSelectedPropId={setSelectedPropId}
      />

      <Toast toast={toast} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

      <main className="flex-1 px-4 lg:px-8 relative z-10 pb-10 w-full max-w-7xl mx-auto">
        {view === 'home' && <HomeView onNavigate={setView} />}

        {view === 'settings' && (
          <SettingsView
            properties={properties}
            templates={templates}
            showToast={showToast}
            userId={user.uid}
          />
        )}

        {view === 'greeter' && (
          <GreeterView
            properties={properties}
            templates={templates}
            showToast={showToast}
            selectedPropId={selectedPropId}
            setSelectedPropId={setSelectedPropId}
            mobileTab={mobileTab}
            setMobileTab={setMobileTab}
          />
        )}
      </main>
    </div>
  );
}