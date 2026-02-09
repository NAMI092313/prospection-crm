'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GoogleCalendarButton } from '@/components/GoogleCalendarButton';

type ThemeMode = 'light' | 'dark' | 'auto';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'light' as ThemeMode,
    notifications: true,
    emailNotifications: false,
    itemsPerPage: 10,
  });

  const applyTheme = (theme: ThemeMode) => {
    const root = document.documentElement;
    if (theme === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('crm_settings');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed) {
        setSettings((prev) => ({ ...prev, ...parsed }));
        if (parsed.theme) {
          applyTheme(parsed.theme as ThemeMode);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleSelectChange = (key: keyof typeof settings, value: string | number) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };
      if (key === 'theme') {
        applyTheme(value as ThemeMode);
        localStorage.setItem('crm_settings', JSON.stringify(next));
      }
      return next;
    });
  };

  const handleSave = () => {
    localStorage.setItem('crm_settings', JSON.stringify(settings));
    alert('Paramètres sauvegardés avec succès !');
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Paramètres</h1>
            <p className="text-gray-600">Gérez vos préférences et paramètres de l'application</p>
          </div>
          <Link
            href="/"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 font-semibold transition"
          >
            ← Retour
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Section Apparence */}
          <div className="border-b p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Apparence</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-900 font-medium">Thème</label>
                  <p className="text-gray-600 text-sm">Choisissez le thème clair ou sombre</p>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSelectChange('theme', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section Notifications */}
          <div className="border-b p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-900 font-medium">Notifications dans l'app</label>
                  <p className="text-gray-600 text-sm">Recevez les notifications de l'application</p>
                </div>
                <button
                  onClick={() => handleToggle('notifications')}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    settings.notifications ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      settings.notifications ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-900 font-medium">Notifications par email</label>
                  <p className="text-gray-600 text-sm">Recevez les mises à jour par email</p>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifications')}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section Affichage */}
          <div className="border-b p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Affichage</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-900 font-medium">Éléments par page</label>
                  <p className="text-gray-600 text-sm">Nombre de prospects affichés par page</p>
                </div>
                <select
                  value={settings.itemsPerPage}
                  onChange={(e) => handleSelectChange('itemsPerPage', parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section Aide */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Intégrations</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-900 font-medium block mb-3">Google Calendar</label>
                <GoogleCalendarButton />
              </div>
            </div>
          </div>

          {/* Section À propos */}
          <div className="border-t p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <label className="text-gray-900 font-medium">Version de l'application</label>
                  <p className="text-gray-600 text-sm">CRM Prospection</p>
                </div>
                <span className="text-gray-600 font-medium">v0.1.0</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-900 font-medium">Dernière mise à jour</label>
                  <p className="text-gray-600 text-sm">9 février 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            💾 Sauvegarder les paramètres
          </button>
          <Link
            href="/"
            className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Annuler
          </Link>
        </div>
      </div>
    </main>
  );
}
