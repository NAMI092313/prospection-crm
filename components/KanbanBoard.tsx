'use client';

import { Prospect, ProspectStatus } from '@/types';
import { useState } from 'react';
import Link from 'next/link';

interface KanbanBoardProps {
  prospects: Prospect[];
  onUpdateStatus: (id: string, status: ProspectStatus) => void;
  onDelete: (id: string) => void;
}

const statuses: ProspectStatus[] = [
  'nouveau',
  'contact',
  'qualification',
  'proposition',
  'negociation',
  'conclu',
  'perdu',
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

const statusColors: Record<ProspectStatus, string> = {
  nouveau: 'bg-blue-100 border-blue-300',
  contact: 'bg-yellow-100 border-yellow-300',
  qualification: 'bg-purple-100 border-purple-300',
  proposition: 'bg-orange-100 border-orange-300',
  negociation: 'bg-pink-100 border-pink-300',
  conclu: 'bg-green-100 border-green-300',
  perdu: 'bg-gray-100 border-gray-300',
};

export function KanbanBoard({ prospects, onUpdateStatus, onDelete }: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const getProspectsByStatus = (status: ProspectStatus) => {
    return prospects.filter((p) => p.status === status);
  };

  const handleDragStart = (e: React.DragEvent, prospectId: string) => {
    setDraggedId(prospectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: ProspectStatus) => {
    e.preventDefault();
    if (draggedId) {
      await onUpdateStatus(draggedId, newStatus);
      setDraggedId(null);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const statusProspects = getProspectsByStatus(status);
        return (
          <div
            key={status}
            className={`flex-shrink-0 w-80 ${statusColors[status]} rounded-lg border-2 p-4`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{statusLabels[status]}</h3>
              <span className="bg-white rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                {statusProspects.length}
              </span>
            </div>

            <div className="space-y-3">
              {statusProspects.map((prospect) => (
                <div
                  key={prospect.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, prospect.id)}
                  className={`bg-white rounded-lg shadow p-4 cursor-move hover:shadow-lg transition ${
                    draggedId === prospect.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{prospect.nom}</h4>
                      <p className="text-sm text-gray-600">{prospect.entreprise}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-700 mb-3">
                    <p>📧 {prospect.email}</p>
                    <p>📱 {prospect.telephone}</p>
                    {prospect.valeurEstimee && (
                      <p className="font-semibold text-green-600">
                        💰 {prospect.valeurEstimee.toLocaleString('fr-FR')} €
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/prospects/${prospect.id}`}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Détails
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(prospect.id);
                      }}
                      className="bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {statusProspects.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Aucun prospect
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
