'use client';

import { useProspects } from '@/hooks/useProspects';
import { ProspectStatus, Prospect } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import * as XLSX from 'xlsx';

const statusLabels: Record<ProspectStatus, string> = {
  nouveau: 'Nouveau',
  contact: 'Contact établi',
  qualification: 'Qualification',
  proposition: 'Proposition',
  negociation: 'Négociation',
  conclu: 'Conclu',
  perdu: 'Perdu',
};

const statusColors: Record<ProspectStatus, string> = {
  nouveau: 'bg-blue-50 text-blue-700',
  contact: 'bg-yellow-50 text-yellow-700',
  qualification: 'bg-purple-50 text-purple-700',
  proposition: 'bg-orange-50 text-orange-700',
  negociation: 'bg-pink-50 text-pink-700',
  conclu: 'bg-green-50 text-green-700',
  perdu: 'bg-gray-50 text-gray-700',
};

export default function DataPage() {
  const { prospects, isLoading, addProspect } = useProspects();
  const [sortField, setSortField] = useState<'nom' | 'entreprise' | 'valeurEstimee' | 'status'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const exportToExcel = () => {
    if (prospects.length === 0) {
      alert('Aucun prospect à exporter');
      return;
    }

    // Préparer les données
    const data = prospects.map((prospect) => ({
      Nom: prospect.nom,
      Entreprise: prospect.entreprise,
      Email: prospect.email,
      Téléphone: prospect.telephone,
      Adresse: prospect.adresse,
      Statut: statusLabels[prospect.status],
      'Valeur estimée (€)': prospect.valeurEstimee ?? '',
      'Date création': new Date(prospect.dateCreation).toLocaleDateString('fr-FR'),
      'Nombre interactions': prospect.interactions.length,
    }));

    // Créer le classeur
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospects');

    // Ajuster les largeurs de colonne
    const colWidths = [
      { wch: 20 }, // Nom
      { wch: 20 }, // Entreprise
      { wch: 25 }, // Email
      { wch: 15 }, // Téléphone
      { wch: 25 }, // Adresse
      { wch: 15 }, // Statut
      { wch: 15 }, // Valeur
      { wch: 15 }, // Date
      { wch: 15 }, // Interactions
    ];
    worksheet['!cols'] = colWidths;

    // Télécharger le fichier
    const fileName = `prospects_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        let imported = 0;
        let skipped = 0;

        for (const row of data as any[]) {
          try {
            const email = row.Email || row.email || '';
            const nom = row.Nom || row.nom || '';
            const entreprise = row.Entreprise || row.entreprise || '';

            // Vérifier si un prospect avec le même email existe déjà
            const existingProspect = prospects.find(
              (p) => p.email.toLowerCase() === email.toLowerCase()
            );

            if (existingProspect) {
              skipped++;
              continue;
            }

            // Vérifier aussi par nom + entreprise
            const existingByNameCompany = prospects.find(
              (p) =>
                p.nom.toLowerCase() === nom.toLowerCase() &&
                p.entreprise.toLowerCase() === entreprise.toLowerCase()
            );

            if (existingByNameCompany) {
              skipped++;
              continue;
            }

            await addProspect({
              nom,
              entreprise,
              email,
              telephone: row.Téléphone || row.telephone || '',
              adresse: row.Adresse || row.adresse || '',
              status: 'nouveau' as ProspectStatus,
              valeurEstimee: row['Valeur estimée (€)'] ? parseInt(row['Valeur estimée (€)']) : undefined,
              dateCreation: new Date().toISOString(),
              interactions: [],
            });
            imported++;
          } catch (err) {
            console.error('Erreur import ligne:', err);
          }
        }
        
        let message = `${imported} prospects importés avec succès !`;
        if (skipped > 0) {
          message += `\n${skipped} doublons ignorés`;
        }
        alert(message);
        event.target.value = ''; // Reset input
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('Erreur lors de l\'import du fichier');
      }
    };
    reader.readAsBinaryString(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Chargement des données...</div>
      </div>
    );
  }

  const sortedProspects = [...prospects].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'valeurEstimee') {
      aValue = a.valeurEstimee ?? 0;
      bValue = b.valeurEstimee ?? 0;
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: 'nom' | 'entreprise' | 'valeurEstimee' | 'status') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Données des prospects</h1>
            <p className="text-gray-600">
              Total: <span className="font-semibold">{prospects.length}</span> prospects
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold transition"
            >
              📥 Exporter Excel
            </button>
            <label className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition cursor-pointer">
              📤 Importer Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={importFromExcel}
                className="hidden"
              />
            </label>
            <Link
              href="/"
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 font-semibold transition"
            >
              ← Retour
            </Link>
          </div>
        </div>

        {prospects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Aucun prospect pour le moment</p>
            <Link
              href="/prospects/new"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Ajouter un prospect
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('nom')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                      >
                        Nom
                        {sortField === 'nom' && (
                          <span className="text-sm">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('entreprise')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                      >
                        Entreprise
                        {sortField === 'entreprise' && (
                          <span className="text-sm">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                      >
                        Statut
                        {sortField === 'status' && (
                          <span className="text-sm">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Téléphone</th>
                    <th className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleSort('valeurEstimee')}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 ml-auto"
                      >
                        Valeur estimée
                        {sortField === 'valeurEstimee' && (
                          <span className="text-sm">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">Interactions</th>
                    <th className="px-6 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedProspects.map((prospect) => (
                    <tr key={prospect.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{prospect.nom}</td>
                      <td className="px-6 py-4 text-gray-700">{prospect.entreprise}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[prospect.status]}`}>
                          {statusLabels[prospect.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{prospect.email}</td>
                      <td className="px-6 py-4 text-gray-700">{prospect.telephone}</td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">
                        {prospect.valeurEstimee
                          ? `${prospect.valeurEstimee.toLocaleString('fr-FR')} €`
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                          {prospect.interactions.length}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/prospects/${prospect.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Voir détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
