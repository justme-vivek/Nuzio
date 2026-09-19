// Interest -> GDELT keyword queries, profession keywords and category maps.
// GDELT's DOC 2.0 API searches a rolling window of news coverage worldwide.

export const CATEGORIES = [
  { id: 'technology', label: 'Technology' },
  { id: 'ai', label: 'AI' },
  { id: 'business', label: 'Business' },
  { id: 'finance', label: 'Finance' },
  { id: 'startups', label: 'Startups' },
  { id: 'politics', label: 'Politics' },
  { id: 'science', label: 'Science' },
  { id: 'health', label: 'Health' },
  { id: 'climate', label: 'Climate' },
  { id: 'sports', label: 'Sports' },
  { id: 'culture', label: 'Culture' },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

// GDELT query snippets per onboarding interest (client sends these ids).
export const INTEREST_QUERIES = {
  'ai-tech': '("artificial intelligence" OR "AI" OR technology)',
  'financial-markets': '(stocks OR "stock market" OR "financial markets")',
  'indian-business': '("indian business" OR "indian economy" OR nifty)',
  'global-politics': '(politics OR diplomacy OR election OR government)',
  startups: '(startup OR "venture capital" OR funding)',
  science: '(science OR research OR space OR scientists)',
  'health-medicine': '(health OR medicine OR "clinical trial" OR hospital)',
  'climate-energy': '(climate OR "clean energy" OR renewable OR emissions)',
  sports: '(cricket OR football OR olympics OR sports)',
  'culture-arts': '(film OR music OR entertainment OR arts)',
  'legal-policy': '(law OR court OR regulation OR policy)',
};

export const INTEREST_LABELS = {
  'ai-tech': 'AI & Technology',
  'financial-markets': 'Financial Markets',
  'indian-business': 'Indian Business',
  'global-politics': 'Global Politics',
  startups: 'Startups',
  science: 'Science',
  'health-medicine': 'Health & Medicine',
  'climate-energy': 'Climate & Energy',
  sports: 'Sports',
  'culture-arts': 'Culture & Arts',
  'legal-policy': 'Legal & Policy',
};

// Lowercase keywords used to score titles against a user's interests.
export const INTEREST_KEYWORDS = {
  'ai-tech': ['ai', 'artificial intelligence', 'tech', 'software', 'chip', 'semiconductor', 'robot', 'data centre', 'data center'],
  'financial-markets': ['stock', 'market', 'invest', 'rupee', 'inflation', 'bank', 'sensex', 'nifty'],
  'indian-business': ['india', 'indian', 'mumbai', 'delhi', 'bengaluru', 'rupee'],
  'global-politics': ['election', 'government', 'minister', 'diplomacy', 'parliament', 'president', 'war'],
  startups: ['startup', 'funding', 'venture', 'unicorn', 'founder', 'ipo'],
  science: ['science', 'space', 'nasa', 'isro', 'research', 'study', 'physic', 'genome'],
  'health-medicine': ['health', 'hospital', 'medical', 'vaccine', 'disease', 'cancer', 'drug'],
  'climate-energy': ['climate', 'solar', 'renewable', 'emission', 'heatwave', 'energy'],
  sports: ['cricket', 'football', 'olympic', 'tournament', 'match', 'championship', 'ipl'],
  'culture-arts': ['film', 'music', 'festival', 'movie', 'art', 'album', 'box office'],
  'legal-policy': ['court', 'law', 'regulation', 'legislation', 'policy', 'tribunal'],
};

export const PROFESSION_KEYWORDS = {
  technology: ['tech', 'software', 'ai', 'chip', 'startup', 'data', 'cyber'],
  'finance-trading': ['market', 'stock', 'rbi', 'invest', 'bank', 'economy', 'inflation'],
  legal: ['court', 'law', 'regulation', 'supreme', 'attorney'],
  healthcare: ['health', 'hospital', 'medical', 'drug', 'patient'],
  consulting: ['economy', 'business', 'strategy', 'market'],
  'marketing-media': ['brand', 'media', 'advertising', 'film', 'streaming'],
  'government-policy': ['government', 'policy', 'ministry', 'parliament', 'regulation'],
  'real-estate': ['real estate', 'housing', 'property', 'infrastructure'],
  education: ['education', 'university', 'school', 'exam', 'students'],
  'founder-builder': ['startup', 'funding', 'founder', 'venture', 'product launch'],
};

// Discover feed queries per category chip.
export const CATEGORY_QUERIES = {
  technology: '(technology OR "tech industry" OR software OR gadgets)',
  ai: '("artificial intelligence" OR "AI" OR "machine learning")',
  business: '(business OR companies OR revenue OR merger)',
  finance: '(stocks OR markets OR "central bank" OR inflation)',
  startups: '(startup OR "venture capital" OR funding OR unicorn)',
  politics: '(politics OR government OR election OR parliament)',
  science: '(science OR space OR research OR discovery)',
  health: '(health OR medicine OR disease OR hospital)',
  climate: '(climate OR "clean energy" OR emissions OR renewables)',
  sports: '(sports OR cricket OR football OR olympics)',
  culture: '(film OR music OR entertainment OR arts)',
};

const CATEGORY_KEYWORDS = {
  technology: ['tech', 'software', 'chip', 'semiconductor', 'app', 'gadget', 'cyber', 'smartphone'],
  ai: ['ai', 'artificial intelligence', 'llm', 'chatgpt', 'openai', 'gemini', 'anthropic', 'machine learning', 'copilot', 'chatbot'],
  business: ['business', 'company', 'revenue', 'merger', 'acquisition', 'ceo', 'profit', 'earnings'],
  finance: ['market', 'stock', 'share', 'rupee', 'rbi', 'inflation', 'bank', 'invest'],
  startups: ['startup', 'funding', 'venture', 'unicorn', 'founder', 'ipo'],
  politics: ['election', 'government', 'parliament', 'minister', 'policy', 'modi', 'trump', 'president'],
  science: ['science', 'research', 'space', 'nasa', 'isro', 'study', 'scientists'],
  health: ['health', 'hospital', 'medical', 'disease', 'vaccine', 'drug', 'cancer'],
  climate: ['climate', 'emission', 'renewable', 'solar', 'heatwave', 'energy transition'],
  sports: ['cricket', 'football', 'olympic', 'match', 'tournament', 'ipl', 'championship'],
  culture: ['film', 'movie', 'music', 'festival', 'art', 'celebrity', 'album', 'box office'],
};

export function categorize(title = '') {
  const t = String(title).toLowerCase();
  const hits = [];
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((k) => t.includes(k))) hits.push(cat);
  }
  return hits;
}

