"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProspects } from "@/hooks/useProspects";
import type { ProspectStatus } from "@/types";
import { validateEmail, validateTelephone } from "@/lib/validation";

const statuses: ProspectStatus[] = [
  "nouveau",
  "contact",
  "qualification",
  "proposition",
  "negociation",
  "conclu",
  "perdu",
];

export default function NewProspectPage() {
  const router = useRouter();
  const { addProspect } = useProspects();

  const [nom, setNom] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [status, setStatus] = useState<ProspectStatus>("nouveau");
  const [valeurEstimee, setValeurEstimee] = useState<number | "">("");
  const [errors, setErrors] = useState<{ email?: string; telephone?: string }>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const emailValidation = validateEmail(email);
    const telephoneValidation = validateTelephone(telephone);
    
    const newErrors: { email?: string; telephone?: string } = {};
    if (!emailValidation.valid) newErrors.email = emailValidation.message;
    if (!telephoneValidation.valid) newErrors.telephone = telephoneValidation.message;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    try {
      const created = await addProspect({
        nom,
        entreprise,
        email,
        telephone,
        adresse,
        status,
        valeurEstimee: valeurEstimee === "" ? undefined : Number(valeurEstimee),
        dateCreation: new Date().toISOString(),
        interactions: [],
      });
      router.push(`/prospects/${created.id}`);
    } catch (error) {
      console.error(error);
      alert('❌ Erreur lors de la création du prospect');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
            ← Retour à l’accueil
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">Nouveau Prospect</h1>

        <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Entreprise</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className={`mt-1 w-full rounded border px-3 py-2 ${
                  errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    const validation = validateEmail(e.target.value);
                    if (validation.valid) {
                      setErrors({ ...errors, email: undefined });
                    }
                  }
                }}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                className={`mt-1 w-full rounded border px-3 py-2 ${
                  errors.telephone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                value={telephone}
                onChange={(e) => {
                  setTelephone(e.target.value);
                  if (errors.telephone) {
                    const validation = validateTelephone(e.target.value);
                    if (validation.valid) {
                      setErrors({ ...errors, telephone: undefined });
                    }
                  }
                }}
                placeholder="06 12 34 56 78"
              />
              {errors.telephone && (
                <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Statut</label>
              <select
                className="mt-1 w-full rounded border px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProspectStatus)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Valeur estimée (€)</label>
              <input
                type="number"
                className="mt-1 w-full rounded border px-3 py-2"
                value={valeurEstimee}
                onChange={(e) => setValeurEstimee(e.target.value === "" ? "" : Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded border"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}