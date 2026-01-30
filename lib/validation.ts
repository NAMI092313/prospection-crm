// Utilitaires de validation pour les formulaires

export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email) {
    return { valid: true }; // Email optionnel
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Format d\'email invalide (ex: nom@exemple.fr)' };
  }
  
  return { valid: true };
};

export const validateTelephone = (telephone: string): { valid: boolean; message?: string } => {
  if (!telephone) {
    return { valid: true }; // Téléphone optionnel
  }
  
  // Supprimer les espaces, points, tirets pour la validation
  const cleaned = telephone.replace(/[\s.\-]/g, '');
  
  // Format français: 10 chiffres commençant par 0, ou international commençant par +
  const frenchRegex = /^0[1-9]\d{8}$/;
  const internationalRegex = /^\+\d{10,15}$/;
  
  if (!frenchRegex.test(cleaned) && !internationalRegex.test(cleaned)) {
    return { 
      valid: false, 
      message: 'Format invalide (ex: 06 12 34 56 78 ou +33612345678)' 
    };
  }
  
  return { valid: true };
};
