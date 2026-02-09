"use client";

import { useProspects } from "@/hooks/useProspects";
import { ProspectCard } from "@/components/ProspectCard";
import { KanbanBoard } from "@/components/KanbanBoard";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import type { ProspectStatus } from "@/types";

const statuses: ProspectStatus[] = [
  "nouveau",
  "contact",
  "qualification",
  "proposition",
  "negociation",
  "conclu",
  "perdu",
];

const statusLabels: Record<ProspectStatus, string> = {
  nouveau: 'Nouveau',
  contact: 'Contact établi',
  qualification: 'Qualification',
  proposition: 'Proposition',
  negociation: 'Négociation',
  conclu: 'Conclu',
  perdu: 'Perdu',
};

export default function Home() {
  const { prospects, isLoading, deleteProspect, updateProspect } = useProspects();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtrer et rechercher les prospects
  const filteredProspects = useMemo(() => {
    let result = prospects;

    // Filtrer par statut
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Rechercher par nom, email, téléphone, entreprise
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.nom.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.telephone.toLowerCase().includes(query) ||
          p.entreprise.toLowerCase().includes(query)
      );
    }

    return result;
  }, [prospects, searchQuery, statusFilter]);

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
            <div className="flex gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    viewMode === "grid"
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📊 Grille
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    viewMode === "kanban"
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📋 Kanban
                </button>
              </div>
              <Link
                href="/data"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                📈 Données
              </Link>
              <Link
                href="/settings"
                className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                ⚙️ Paramètres
              </Link>
              <Link
                href="/prospects/new"
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                ➕ Nouveau Prospect
              </Link>
            </div>
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

        {/* Recherche et filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Rechercher
              </label>
              <input
                type="text"
                placeholder="Nom, email, téléphone, entreprise..."
                className="w-full rounded-lg border-gray-300 px-4 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ Filtrer par statut
              </label>
              <select
                className="w-full rounded-lg border-gray-300 px-4 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProspectStatus | "all")}
              >
                <option value="all">Tous les statuts</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(searchQuery || statusFilter !== "all") && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredProspects.length} résultat{filteredProspects.length > 1 ? "s" : ""} trouvé{filteredProspects.length > 1 ? "s" : ""}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : filteredProspects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            {searchQuery || statusFilter !== "all" ? (
              <>
                <p className="text-gray-600 text-lg mb-4">Aucun prospect ne correspond à votre recherche</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Réinitialiser les filtres
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 text-lg mb-4">Aucun prospect pour le moment</p>
                <Link
                  href="/prospects/new"
                  className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Ajouter un prospect
                </Link>
              </>
            )}
          </div>
        ) : viewMode === "kanban" ? (
          <KanbanBoard
            prospects={filteredProspects}
            onUpdateStatus={async (id, status) => {
              await updateProspect(id, { status });
            }}
            onDelete={deleteProspect}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProspects.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                onDelete={deleteProspect}
                onStatusChange={async (id, status) => {
                  await updateProspect(id, { status });
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
