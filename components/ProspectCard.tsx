'use client';

import { Prospect, ProspectStatus } from '@/types';
import Link from 'next/link';
import { useState } from 'react';

interface ProspectCardProps {
  prospect: Prospect;
  onDelete: (id: string) => void | Promise<void>;
  onStatusChange?: (id: string, status: ProspectStatus) => void | Promise<void>;
}

const statusColors: Record<ProspectStatus, string> = {
  nouveau: 'bg-blue-100 text-blue-800',
  contact: 'bg-yellow-100 text-yellow-800',
  qualification: 'bg-purple-100 text-purple-800',
  proposition: 'bg-orange-100 text-orange-800',
  negociation: 'bg-pink-100 text-pink-800',
  conclu: 'bg-green-100 text-green-800',
  perdu: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<ProspectStatus, string> = {
  nouveau: 'Nouveau',
  contact: 'Contact établi',
  qualification: 'Qualification',
  proposition: 'Proposition',
  negociation: 'Négociation',
  conclu: 'Conclu',
  perdu: 'Perdu',
};

export function ProspectCard({ prospect, onDelete, onStatusChange }: ProspectCardProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const handleStatusChange = async (newStatus: ProspectStatus) => {
    if (onStatusChange) {
      setIsChangingStatus(true);
      try {
        await onStatusChange(prospect.id, newStatus);
      } finally {
        setIsChangingStatus(false);
      }
    }
  };

  const statuses: ProspectStatus[] = [
    "nouveau",
    "contact",
    "qualification",
    "proposition",
    "negociation",
    "conclu",
    "perdu",
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{prospect.nom}</h3>
          <p className="text-sm text-gray-600">{prospect.entreprise}</p>
        </div>
        {onStatusChange ? (
          <select
            value={prospect.status}
            onChange={(e) => handleStatusChange(e.target.value as ProspectStatus)}
            disabled={isChangingStatus}
            className={`px-2 py-1 rounded text-xs font-medium cursor-pointer border-0 ${statusColors[prospect.status]} disabled:opacity-50`}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        ) : (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[prospect.status]}`}>
            {statusLabels[prospect.status]}
          </span>
        )}
      </div>

      <div className="space-y-1 text-sm text-gray-700 mb-4">
        <p>📧 {prospect.email}</p>
        <p>📱 {prospect.telephone}</p>
        <p>📍 {prospect.adresse}</p>
        {prospect.valeurEstimee && (
          <p className="font-semibold text-green-600">💰 {prospect.valeurEstimee.toLocaleString('fr-FR')} €</p>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/prospects/${prospect.id}`}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition text-center"
        >
          Voir détails
        </Link>
        <button
          onClick={() => onDelete(prospect.id)}
          className="bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
