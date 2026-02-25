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

// 82 values
const valueNames = [
  'Achievement',
  'Adventure',
  'Ambition',
  'Balance',
  'Beauty',
  'Challenge',
  'Change',
  'Charity',
  'Clarity',
  'Communication',
  'Community',
  'Connection',
  'Contribution',
  'Courage',
  'Creativity',
  'Curiosity',
  'Dominance',
  'Enjoyment',
  'Equality',
  'Excitement',
  'Family',
  'Freedom',
  'Friendship',
  'Fun',
  'Generosity',
  'Gratitude',
  'Grit',
  'Growth',
  'Happiness',
  'Health',
  'Home',
  'Honesty',
  'Humor',
  'Independence',
  'Indulgence',
  'Influence',
  'Innovation',
  'Integrity',
  'Intelligence',
  'Justice',
  'Kindness',
  'Learning',
  'Love',
  'Loyalty',
  'Mindfulness',
  'Openness',
  'Optimism',
  'Passion',
  'Patience',
  'Peace',
  'Pleasure',
  'Power',
  'Professionalism',
  'Purpose',
  'Quality',
  'Recognition',
  'Relationship',
  'Resilience',
  'Religion',
  'Reputation',
  'Respect',
  'Responsibility',
  'Security',
  'Self-respect',
  'Service',
  'Simplicity',
  'Spirituality',
  'Stability',
  'Strength',
  'Status',
  'Success',
  'Teamwork',
  'Time',
  'Tradition',
  'Trust',
  'Understanding',
  'Usefulness',
  'Versatility',
  'Virtue',
  'Warmth',
  'Wealth',
  'Wisdom',
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
