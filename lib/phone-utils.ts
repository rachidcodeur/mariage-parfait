/**
 * Utilitaires pour normaliser les numéros de téléphone français
 */

/**
 * Normalise un numéro de téléphone français pour la recherche
 * Gère les formats : +33 7 59 17 50 29, +33 07 59 17 50 29, 7 59 17 50 29, 07 59 17 50 29
 * Retourne le numéro au format : 0759175029 (sans espaces, avec 0 initial)
 */
export function normalizeFrenchPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return ''

  // Nettoyer le numéro : garder les chiffres, +, et espaces pour le moment
  let cleaned = phone.trim()
  
  // Traiter d'abord le cas +33 (doit être en début de chaîne)
  if (cleaned.startsWith('+33')) {
    // Extraire tout ce qui suit +33 (peut contenir des espaces, tirets, etc.)
    const afterPlus33 = cleaned.substring(3).trim()
    // Extraire uniquement les chiffres
    const digits = afterPlus33.replace(/\D/g, '')
    
    // Si on a 9 chiffres après +33, ajouter le 0
    if (digits.length === 9) {
      return '0' + digits
    }
    // Si on a déjà 10 chiffres (avec le 0), retourner tel quel
    if (digits.length === 10 && digits.startsWith('0')) {
      return digits
    }
    // Si on a 10 chiffres sans le 0, ajouter le 0
    if (digits.length === 10 && !digits.startsWith('0')) {
      return '0' + digits
    }
    // Si on a moins de 9 chiffres, retourner avec 0
    if (digits.length > 0 && digits.length < 9) {
      return '0' + digits
    }
    return digits.length > 0 ? '0' + digits : ''
  }

  // Traiter le cas 33 (sans +)
  if (cleaned.startsWith('33') && !cleaned.startsWith('+')) {
    const after33 = cleaned.substring(2).trim()
    const digits = after33.replace(/\D/g, '')
    
    if (digits.length === 9) {
      return '0' + digits
    }
    if (digits.length === 10 && digits.startsWith('0')) {
      return digits
    }
    if (digits.length === 10 && !digits.startsWith('0')) {
      return '0' + digits
    }
    if (digits.length > 0) {
      return '0' + digits
    }
  }

  // Extraire uniquement les chiffres pour les autres cas
  let digitsOnly = cleaned.replace(/\D/g, '')
  
  // Si le numéro a 9 chiffres et commence par 6, 7, 8, ou 9 (mobiles/fixes), ajouter le 0
  if (digitsOnly.length === 9 && /^[6789]/.test(digitsOnly)) {
    return '0' + digitsOnly
  }

  // Si le numéro a 11 chiffres et commence par 33, convertir en 0XXXXXXXXX
  if (digitsOnly.length === 11 && digitsOnly.startsWith('33')) {
    return '0' + digitsOnly.substring(2)
  }

  // Si le numéro a 10 chiffres et commence par 0, retourner tel quel
  if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) {
    return digitsOnly
  }
  
  // Si le numéro a 9 chiffres et commence par un chiffre valide (1-9), ajouter le 0
  if (digitsOnly.length === 9 && /^[1-9]/.test(digitsOnly)) {
    return '0' + digitsOnly
  }

  // Si le numéro a 10 chiffres mais ne commence pas par 0, peut-être qu'il manque le 0
  if (digitsOnly.length === 10 && !digitsOnly.startsWith('0')) {
    // Vérifier si c'est un numéro français valide (commence par 6, 7, 8, 9)
    if (/^[6789]/.test(digitsOnly)) {
      return '0' + digitsOnly
    }
  }

  // Retourner tel quel si on ne peut pas le normaliser correctement
  return digitsOnly
}

/**
 * Génère toutes les variantes possibles d'un numéro de téléphone pour la recherche
 */
export function generatePhoneVariants(phone: string): string[] {
  const normalized = normalizeFrenchPhone(phone)
  if (!normalized) return []

  const variants = new Set<string>()

  // Format avec 0 initial
  variants.add(normalized)

  // Format sans 0 initial (si le numéro commence par 0)
  if (normalized.startsWith('0') && normalized.length === 10) {
    variants.add(normalized.substring(1))
  }

  // Format avec +33
  if (normalized.startsWith('0') && normalized.length === 10) {
    variants.add('+33' + normalized.substring(1))
    variants.add('33' + normalized.substring(1))
  }

  // Format avec espaces (ex: 07 59 17 50 29)
  if (normalized.length === 10) {
    const withSpaces = normalized.match(/.{1,2}/g)?.join(' ') || normalized
    variants.add(withSpaces)
  }

  return Array.from(variants)
}

