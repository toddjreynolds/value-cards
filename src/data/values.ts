export const CARD_COLORS = [
  '#E7E578', // yellow
  '#C36D38', // orange
  '#C5445C', // red
  '#6D5391', // purple
  '#3E7493', // teal
  '#5D9443', // green
] as const;

export type ValueCard = {
  id: string;
  name: string;
  color: string;
};

// 55 unique values (Patience was listed twice in original list)
const valueNames = [
  'Family',
  'Security',
  'Freedom',
  'Happiness',
  'Success',
  'Health',
  'Adventure',
  'Knowledge',
  'Integrity',
  'Honesty',
  'Stability',
  'Love',
  'Wealth',
  'Legacy',
  'Responsibility',
  'Achievement',
  'Comfort',
  'Independence',
  'Generosity',
  'Growth',
  'Innovation',
  'Loyalty',
  'Compassion',
  'Creativity',
  'Balance',
  'Spirituality',
  'Community',
  'Excellence',
  'Fun',
  'Recognition',
  'Respect',
  'Trust',
  'Wisdom',
  'Contribution',
  'Flexibility',
  'Gratitude',
  'Passion',
  'Peace',
  'Power',
  'Relationships',
  'Self-reliance',
  'Simplicity',
  'Sustainability',
  'Tradition',
  'Influence',
  'Optimism',
  'Patience',
  'Perseverance',
  'Faith',
  'Charity',
  'Altruism',
  'Resilience',
  'Curiosity',
  'Authenticity',
  'Pleasure',
];

export const VALUES: ValueCard[] = valueNames.map((name, index) => ({
  id: name.toLowerCase().replace(/[^a-z]/g, '-'),
  name: name.toUpperCase(),
  color: CARD_COLORS[index % CARD_COLORS.length],
}));

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
