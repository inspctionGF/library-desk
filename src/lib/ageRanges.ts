export type AgeRange = '3-5' | '6-8' | '9-11' | '12-14' | '15-18' | '19-22';

export const ageRangeOptions: { value: AgeRange; label: string }[] = [
  { value: '3-5', label: '3-5 ans' },
  { value: '6-8', label: '6-8 ans' },
  { value: '9-11', label: '9-11 ans' },
  { value: '12-14', label: '12-14 ans' },
  { value: '15-18', label: '15-18 ans' },
  { value: '19-22', label: '19-22 ans' },
];

export const ageRangeColors: Record<AgeRange, string> = {
  '3-5': 'hsl(340, 75%, 55%)',   // Rose - Petits
  '6-8': 'hsl(25, 95%, 53%)',    // Orange
  '9-11': 'hsl(48, 95%, 50%)',   // Jaune
  '12-14': 'hsl(142, 70%, 45%)', // Vert
  '15-18': 'hsl(200, 80%, 50%)', // Bleu
  '19-22': 'hsl(262, 83%, 58%)', // Violet - Adultes
};

export function getAgeRange(age: number): AgeRange {
  if (age >= 3 && age <= 5) return '3-5';
  if (age >= 6 && age <= 8) return '6-8';
  if (age >= 9 && age <= 11) return '9-11';
  if (age >= 12 && age <= 14) return '12-14';
  if (age >= 15 && age <= 18) return '15-18';
  if (age >= 19 && age <= 22) return '19-22';
  // Default for out of range
  if (age < 3) return '3-5';
  return '19-22';
}

export function isAgeCompatibleWithRange(age: number, range: AgeRange): boolean {
  const ageRange = getAgeRange(age);
  return ageRange === range;
}

export function getAgeRangeLabel(range: AgeRange): string {
  return ageRangeOptions.find(o => o.value === range)?.label || range;
}
