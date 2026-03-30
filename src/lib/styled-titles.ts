export interface TitleSegment {
  text: string;
  className?: string;
}

export function plainTitle(text: string): TitleSegment[] {
  return [{ text }];
}
