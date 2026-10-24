// Add REAL reviews only (e.g. copied from Google). The section stays hidden while this list is empty.
export type Review = { name: string; rating: number; text: string; source?: string; date?: string };

export const reviews: Review[] = [];
