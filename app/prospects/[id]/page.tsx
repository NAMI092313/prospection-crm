"use client";

import { useParams, useRouter } from "next/navigation";
import { useProspects } from "@/hooks/useProspects";
import type { InteractionType } from "@/types";
import { useMemo, useState } from "react";
import { GoogleCalendarButton } from "@/components/GoogleCalendarButton";
import { useSession } from "next-auth/react";

const interactionTypes: InteractionType[] = ["appel", "email", "reunion", "sms", "visite"];

export default function ProspectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { prospects, addInteraction, deleteProspect } = useProspects();
  const { data: session } = useSession();

  const prospect = useMemo(() => prospects.find((p) => p.id === params.id), [prospects, params.id]);

  const [type, setType] = useState<InteractionType>("appel");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [duree, setDuree] = useState<number | "">("");
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // +1h
    location: "",
  });

  if (!prospect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700">Prospect introuvable.</p>
            <button className="mt-4 px-4 py-2 rounded border" onClick={() => router.push("/")}>Retour</button>
          </div>
        </div>
      </div>
    );
  }

  const onAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    addInteraction(prospect.id, {
      type,
      date: new Date(date).toISOString(),
      notes,
      duree: duree === "" ? undefined : Number(duree),
    });
    setNotes("");
    setDuree("");
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setEventLoading(true);
    try {
      const response = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: eventForm.title || `RDV avec ${prospect.nom}`,
          description: eventForm.description || `Rendez-vous avec ${prospect.nom} (${prospect.entreprise})`,
          startTime: new Date(eventForm.startDate).toISOString(),
          endTime: new Date(eventForm.endDate).toISOString(),
          location: eventForm.location || prospect.adresse,
          attendees: [prospect.email],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Événement créé dans Google Calendar !');
        setShowEventModal(false);
        // Ajouter aussi une interaction
        addInteraction(prospect.id, {
          type: 'reunion',
          date: new Date(eventForm.startDate).toISOString(),
          notes: `RDV planifié: ${eventForm.title || 'Rendez-vous'}`,
        });
      } else {
        alert('❌ Erreur: ' + data.error);
      }
    } catch (error) {
      alert('❌ Erreur lors de la création de l\'événement');
      console.error(error);
    } finally {
      setEventLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{prospect.nom}</h1>
            <p className="text-gray-600">{prospect.entreprise}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded border" onClick={() => router.push("/")}>Retour</button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                deleteProspect(prospect.id);
                router.push("/");
              }}
            >
              Supprimer
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <p>📧 {prospect.email}</p>
            <p>📱 {prospect.telephone}</p>
            <p>📍 {prospect.adresse}</p>
            {prospect.valeurEstimee && (
              <p className="font-semibold text-green-600">💰 {prospect.valeurEstimee.toLocaleString("fr-FR")} €</p>
            )}
            <p>🗓️ Créé le {new Date(prospect.dateCreation).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Google Calendar</h2>
          <GoogleCalendarButton 
            showCreateButton={true}
            onCreateEvent={() => setShowEventModal(true)}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Ajouter une interaction</h2>
          <form onSubmit={onAddInteraction} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select className="mt-1 w-full rounded border px-3 py-2" value={type} onChange={(e) => setType(e.target.value as InteractionType)}>
                {interactionTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="datetime-local" className="mt-1 w-full rounded border px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Durée (min)</label>
              <input type="number" min={0} className="mt-1 w-full rounded border px-3 py-2" value={duree} onChange={(e) => setDuree(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea className="mt-1 w-full rounded border px-3 py-2" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Ajouter</button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Historique des interactions</h2>
          {prospect.interactions.length === 0 ? (
            <p className="text-gray-600">Aucune interaction pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {prospect.interactions.map((i) => (
                <li key={i.id} className="border rounded p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{i.type}</span>
                    <span className="text-gray-500">{new Date(i.date).toLocaleString("fr-FR")}</span>
                  </div>
                  {i.duree ? <div className="text-gray-700">Durée: {i.duree} min</div> : null}
                  <div className="text-gray-700">{i.notes}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Modal pour créer un événement Calendar */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Planifier un rendez-vous</h3>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    placeholder={`RDV avec ${prospect.nom}`}
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full rounded border px-3 py-2"
                    rows={2}
                    placeholder={`Rendez-vous avec ${prospect.nom}`}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded border px-3 py-2"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded border px-3 py-2"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    placeholder={prospect.adresse}
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 rounded border hover:bg-gray-50"
                    disabled={eventLoading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    disabled={eventLoading}
                  >
                    {eventLoading ? 'Création...' : 'Créer l\'événement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}