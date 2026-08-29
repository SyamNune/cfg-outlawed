/**
 * Legal Aid PII (Personally Identifiable Information) Redaction & Privacy Utilities
 * Masks names, contact numbers, and landmark addresses ONLY for resolved/closed cases to protect confidentiality,
 * while keeping active/ongoing cases fully visible for field operations.
 */

/**
 * Checks whether a case is resolved/closed or active
 */
export function isCaseResolved(caseObj) {
  if (!caseObj) return false;
  const status = (caseObj.status || '').toLowerCase();
  return status === 'resolved' || status === 'closed' || caseObj.isResolved === true;
}

/**
 * Masks a person's name (e.g. "Ravi Kumar" -> "R*** K***")
 */
export function maskName(name = '', fallback = 'Beneficiary [Redacted]') {
  if (!name || typeof name !== 'string') return fallback;
  const trimmed = name.trim();
  if (!trimmed) return fallback;

  const parts = trimmed.split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 1) return part + '***';
      return part.charAt(0) + '*'.repeat(Math.min(part.length - 1, 4));
    })
    .join(' ');
}

/**
 * Masks contact numbers (e.g. "+91 98451 22334" -> "+91 98451 •••••")
 */
export function maskPhone(phone = '', fallback = '••••••••••') {
  if (!phone || typeof phone !== 'string') return fallback;
  const cleaned = phone.trim();
  if (!cleaned || cleaned.toLowerCase() === 'n/a') return 'Not Provided';

  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length >= 10) {
    const prefix = cleaned.startsWith('+') ? cleaned.slice(0, 7) : cleaned.slice(0, 4);
    return `${prefix} •••••`;
  }

  return '••••••••••';
}

/**
 * Masks sensitive landmarks and granular house/street details, retaining only district/region.
 */
export function maskLandmark(location = '', district = 'Mandya') {
  if (!location || typeof location !== 'string') {
    return `${district} [Landmark Protected]`;
  }
  
  const trimmed = location.trim();
  if (!trimmed || trimmed.toLowerCase() === 'n/a') {
    return `${district} [Landmark Protected]`;
  }

  return `${district} •••••• [Location Confidential]`;
}

/**
 * Returns the beneficiary name:
 * - Real name if the case is active/ongoing
 * - Masked name if the case is resolved/closed
 */
export function getClientDisplayName(caseObj) {
  if (!caseObj) return 'N/A';
  const name = caseObj.client?.name || 'Beneficiary';
  if (isCaseResolved(caseObj)) {
    return maskName(name);
  }
  return name;
}

/**
 * Returns the beneficiary phone:
 * - Real phone if the case is active/ongoing
 * - Masked phone if the case is resolved/closed
 */
export function getClientDisplayPhone(caseObj) {
  if (!caseObj) return 'N/A';
  const phone = caseObj.client?.phone || 'N/A';
  if (isCaseResolved(caseObj)) {
    return maskPhone(phone);
  }
  return phone;
}

/**
 * Returns the beneficiary location / landmark:
 * - Real address / village if the case is active/ongoing
 * - Masked landmark if the case is resolved/closed
 */
export function getClientDisplayAddress(caseObj) {
  if (!caseObj) return 'N/A';
  const rawAddress = caseObj.client?.address || '';
  const rawVillage = caseObj.client?.villageTaluk || '';
  const district = caseObj.district || 'Mandya';

  if (isCaseResolved(caseObj)) {
    return maskLandmark(rawAddress || rawVillage, district);
  }

  const combined = [rawAddress, rawVillage, district].filter(Boolean).join(', ');
  return combined || 'Address not specified';
}

/**
 * Returns field visit location:
 * - Real location for active cases
 * - Masked location for resolved cases
 */
export function getFieldVisitDisplayLocation(caseObj, rawLocation) {
  if (isCaseResolved(caseObj)) {
    return maskLandmark(rawLocation, caseObj?.district || 'Mandya');
  }
  return rawLocation || 'Field Location';
}

/**
 * General PII scrubber for case facts, updates, and notes
 * Only scrubs if the case is resolved/closed.
 */
export function redactPIIFromText(text = '', caseObj = null) {
  if (!text || typeof text !== 'string') return text;
  if (caseObj && !isCaseResolved(caseObj)) {
    return text; // Keep intact for active cases
  }

  let sanitized = text;
  sanitized = sanitized.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE REDACTED]');
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]');

  return sanitized;
}
