export const RECORD_FORMAT_ID = 'deccan-birders-sighting';
export const RECORD_FORMAT_VERSION = 1;

export interface SightingRecord {
  formatId: typeof RECORD_FORMAT_ID;
  version: typeof RECORD_FORMAT_VERSION;
  recordId: string;
  species: string;
  observationDate: number; // Unix timestamp
  location: string;
  observerReference?: string;
  photoReference?: string;
}

/**
 * Type guard to validate if an unknown object is a valid SightingRecord.
 */
export function isSightingRecord(data: unknown): data is SightingRecord {
  if (typeof data !== 'object' || data === null) return false;

  const record = data as Partial<SightingRecord>;
  return (
    record.formatId === RECORD_FORMAT_ID &&
    record.version === RECORD_FORMAT_VERSION &&
    typeof record.recordId === 'string' &&
    typeof record.species === 'string' &&
    typeof record.observationDate === 'number' &&
    typeof record.location === 'string'
  );
}

export function createSightingRecord(
  species: string,
  observationDate: number,
  location: string,
  observerReference?: string,
  photoReference?: string
): SightingRecord {
  return {
    formatId: RECORD_FORMAT_ID,
    version: RECORD_FORMAT_VERSION,
    recordId: crypto.randomUUID(),
    species,
    observationDate,
    location,
    observerReference,
    photoReference,
  };
}
