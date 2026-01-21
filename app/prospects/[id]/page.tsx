"use client";

import { useParams, useRouter } from "next/navigation";
import { useProspects } from "@/hooks/useProspects";
import type { InteractionType } from "@/types";
import { useMemo, useState } from "react";

const interactionTypes: InteractionType[] = ["appel", "email", "reunion", "sms", "visite"];

export default function ProspectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { prospects, addInteraction, deleteProspect } = useProspects();

  const prospect = useMemo(() => prospects.find((p) => p.id === params.id), [prospects, params.id]);

  const [type, setType] = useState<InteractionType>("appel");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [duree, setDuree] = useState<number | "">("");

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
      </div>
    </div>
  );
}