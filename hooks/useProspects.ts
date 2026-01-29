'use client';

import { useState, useEffect } from 'react';
import { Prospect, Interaction } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export function useProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapProspect = (record: any): Prospect => ({
    id: record.id,
    nom: record.nom,
    entreprise: record.entreprise,
    email: record.email,
    telephone: record.telephone,
    adresse: record.adresse,
    status: record.status,
    valeurEstimee: record.valeur_estimee ?? undefined,
    dateCreation: record.date_creation,
    interactions: (record.interactions || []).map((i: any) => ({
      id: i.id,
      type: i.type,
      date: i.date,
      notes: i.notes,
      duree: i.duree ?? undefined,
    })),
  });

  // Charger les données depuis Supabase au démarrage
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('prospects')
        .select('*, interactions(*)')
        .order('date_creation', { ascending: false })
        .order('date', { foreignTable: 'interactions', ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des prospects:', error);
        setIsLoading(false);
        return;
      }

      setProspects((data || []).map(mapProspect));
      setIsLoading(false);
    };

    load();
  }, []);

  // Ajouter un nouveau prospect
  const addProspect = async (prospect: Omit<Prospect, 'id'>) => {
    const { data, error } = await supabase
      .from('prospects')
      .insert({
        nom: prospect.nom,
        entreprise: prospect.entreprise,
        email: prospect.email,
        telephone: prospect.telephone,
        adresse: prospect.adresse,
        status: prospect.status,
        valeur_estimee: prospect.valeurEstimee ?? null,
        date_creation: prospect.dateCreation,
      })
      .select('*, interactions(*)')
      .single();

    if (error) {
      console.error('Erreur lors de la création du prospect:', error);
      throw error;
    }

    const newProspect = mapProspect(data);
    setProspects((prev) => [newProspect, ...prev]);
    return newProspect;
  };

  // Modifier un prospect
  const updateProspect = async (id: string, updates: Partial<Prospect>) => {
    const payload: Record<string, any> = {};
    if (updates.nom !== undefined) payload.nom = updates.nom;
    if (updates.entreprise !== undefined) payload.entreprise = updates.entreprise;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.telephone !== undefined) payload.telephone = updates.telephone;
    if (updates.adresse !== undefined) payload.adresse = updates.adresse;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.valeurEstimee !== undefined) payload.valeur_estimee = updates.valeurEstimee;
    if (updates.dateCreation !== undefined) payload.date_creation = updates.dateCreation;

    const { data, error } = await supabase
      .from('prospects')
      .update(payload)
      .eq('id', id)
      .select('*, interactions(*)')
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du prospect:', error);
      throw error;
    }

    const updatedProspect = mapProspect(data);
    setProspects((prev) => prev.map((p) => (p.id === id ? updatedProspect : p)));
  };

  // Supprimer un prospect
  const deleteProspect = async (id: string) => {
    const { error } = await supabase.from('prospects').delete().eq('id', id);
    if (error) {
      console.error('Erreur lors de la suppression du prospect:', error);
      throw error;
    }
    setProspects((prev) => prev.filter((p) => p.id !== id));
  };

  // Ajouter une interaction à un prospect
  const addInteraction = async (prospectId: string, interaction: Omit<Interaction, 'id'>) => {
    const { data, error } = await supabase
      .from('interactions')
      .insert({
        prospect_id: prospectId,
        type: interaction.type,
        date: interaction.date,
        notes: interaction.notes,
        duree: interaction.duree ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de l\'interaction:', error);
      throw error;
    }

    const newInteraction: Interaction = {
      id: data.id,
      type: data.type,
      date: data.date,
      notes: data.notes,
      duree: data.duree ?? undefined,
    };

    setProspects((prev) =>
      prev.map((p) =>
        p.id === prospectId
          ? { ...p, interactions: [newInteraction, ...p.interactions] }
          : p
      )
    );
  };

  return {
    prospects,
    isLoading,
    addProspect,
    updateProspect,
    deleteProspect,
    addInteraction,
  };
}

