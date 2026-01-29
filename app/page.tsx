"use client";

import { useProspects } from "@/hooks/useProspects";
import { ProspectCard } from "@/components/ProspectCard";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { prospects, isLoading, deleteProspect } = useProspects();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalProspects = prospects.length;
  const nouveaux = prospects.filter((p) => p.status === "nouveau").length;
  const conclues = prospects.filter((p) => p.status === "conclu").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CRM Prospection</h1>
              <p className="text-gray-600 mt-1">Mon suivi de prospection</p>
            </div>
            <Link
              href="/prospects/new"
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              ➕ Nouveau Prospect
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Total Prospects</div>
            <div className="text-4xl font-bold text-gray-900 mt-2">{totalProspects}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Nouveaux</div>
            <div className="text-4xl font-bold text-blue-600 mt-2">{nouveaux}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Conclues</div>
            <div className="text-4xl font-bold text-green-600 mt-2">{conclues}</div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : prospects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Aucun prospect pour le moment</p>
            <Link
              href="/prospects/new"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Ajouter un prospect
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prospects.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                onDelete={deleteProspect}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
