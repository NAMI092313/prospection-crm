"use client";

import { useParams, useRouter } from "next/navigation";
import { useProspects } from "@/hooks/useProspects";
import type { InteractionType } from "@/types";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { validateEmail, validateTelephone } from "@/lib/validation";

const interactionTypes: InteractionType[] = ["appel", "email", "reunion", "sms", "visite"];

// Helper pour formater une date en timezone locale pour input datetime-local
const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function ProspectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { prospects, addInteraction, deleteProspect, updateProspect } = useProspects();
  const { data: session } = useSession();

  const prospect = useMemo(() => prospects.find((p) => p.id === params.id), [prospects, params.id]);

  const [type, setType] = useState<InteractionType>("appel");
  const [date, setDate] = useState<string>(formatDateTimeLocal(new Date()));
  const [notes, setNotes] = useState("");
  const [duree, setDuree] = useState<number | "">("");
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<{ email?: string; telephone?: string }>({});
  const [editForm, setEditForm] = useState({
    nom: prospect?.nom || "",
    entreprise: prospect?.entreprise || "",
    email: prospect?.email || "",
    telephone: prospect?.telephone || "",
    adresse: prospect?.adresse || "",
    valeurEstimee: prospect?.valeurEstimee || "",
  });
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    startDate: formatDateTimeLocal(new Date()),
    endDate: formatDateTimeLocal(new Date(Date.now() + 3600000)), // +1h
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

  const onAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addInteraction(prospect.id, {
        type,
        date: new Date(date).toISOString(),
        notes,
        duree: duree === "" ? undefined : Number(duree),
      });
      setNotes("");
      setDuree("");
    } catch (error) {
      console.error(error);
      alert('❌ Erreur lors de l\'ajout de l\'interaction');
    }
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
        await addInteraction(prospect.id, {
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

  const handleEditProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const emailValidation = validateEmail(editForm.email);
    const telephoneValidation = validateTelephone(editForm.telephone);
    
    const newErrors: { email?: string; telephone?: string } = {};
    if (!emailValidation.valid) newErrors.email = emailValidation.message;
    if (!telephoneValidation.valid) newErrors.telephone = telephoneValidation.message;
    
    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }
    
    setEditErrors({});
    setIsEditLoading(true);
    try {
      await updateProspect(prospect.id, {
        nom: editForm.nom,
        entreprise: editForm.entreprise,
        email: editForm.email,
        telephone: editForm.telephone,
        adresse: editForm.adresse,
        valeurEstimee: editForm.valeurEstimee ? Number(editForm.valeurEstimee) : undefined,
      });
      alert('✅ Prospect mis à jour avec succès!');
      setShowEditModal(false);
    } catch (error) {
      console.error(error);
      alert('❌ Erreur lors de la mise à jour');
    } finally {
      setIsEditLoading(false);
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
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                setEditForm({
                  nom: prospect.nom,
                  entreprise: prospect.entreprise,
                  email: prospect.email,
                  telephone: prospect.telephone,
                  adresse: prospect.adresse,
                  valeurEstimee: prospect.valeurEstimee || "",
                });
                setShowEditModal(true);
              }}
            >
              ✏️ Éditer
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                try {
                  await deleteProspect(prospect.id);
                  router.push("/");
                } catch (error) {
                  console.error(error);
                  alert('❌ Erreur lors de la suppression');
                }
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
          <button
            onClick={() => setShowEventModal(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Planifier un rendez-vous
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Ajouter une interaction</h2>
            <button
              onClick={onAddInteraction}
              type="button"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Ajouter
            </button>
          </div>
          <form onSubmit={onAddInteraction} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {/* Modal pour éditer le prospect */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Éditer le prospect</h3>
              <form onSubmit={handleEditProspect} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    value={editForm.nom}
                    onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    value={editForm.entreprise}
                    onChange={(e) => setEditForm({ ...editForm, entreprise: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className={`w-full rounded border px-3 py-2 ${
                      editErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    value={editForm.email}
                    onChange={(e) => {
                      setEditForm({ ...editForm, email: e.target.value });
                      if (editErrors.email) {
                        const validation = validateEmail(e.target.value);
                        if (validation.valid) {
                          setEditErrors({ ...editErrors, email: undefined });
                        }
                      }
                    }}
                    required
                  />
                  {editErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    className={`w-full rounded border px-3 py-2 ${
                      editErrors.telephone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    value={editForm.telephone}
                    onChange={(e) => {
                      setEditForm({ ...editForm, telephone: e.target.value });
                      if (editErrors.telephone) {
                        const validation = validateTelephone(e.target.value);
                        if (validation.valid) {
                          setEditErrors({ ...editErrors, telephone: undefined });
                        }
                      }
                    }}
                    placeholder="06 12 34 56 78"
                  />
                  {editErrors.telephone && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.telephone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    value={editForm.adresse}
                    onChange={(e) => setEditForm({ ...editForm, adresse: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valeur estimée (€)</label>
                  <input
                    type="number"
                    className="w-full rounded border px-3 py-2"
                    value={editForm.valeurEstimee}
                    onChange={(e) => setEditForm({ ...editForm, valeurEstimee: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded border hover:bg-gray-50"
                    disabled={isEditLoading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    disabled={isEditLoading}
                  >
                    {isEditLoading ? 'Sauvegarde...' : 'Sauvegarder'}
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