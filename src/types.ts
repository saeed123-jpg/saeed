export type CityGroupKey = "westbank" | "inside" | "gaza";

export type City = {
  id: string;
  name: string;
  category: CityGroupKey;
  legacyCategory?: string;
  region: string;
  wikiTitle: string;
  realImage: string;
  realSource: string;
  oldImageSearch: string[];
  modernImageSearch: string[];
  summary: string;
  history: string;
  political?: string;
  geography: string;
  today: string;
  highlights: string[];
  tags: string[];
};

export type CityVillage = {
  id: string;
  cityId: string;
  name: string;
  searchName?: string;
  district: string;
  type: "village" | "municipality" | "camp" | "neighborhood" | "depopulated";
  relation: string;
  summary: string;
  imageQueries: string[];
  sourceHref: string;
  tags: string[];
};

export type HistoryEvent = {
  category: string;
  period: string;
  title: string;
  summary: string;
  details: string[];
  imageQueries: string[];
  source: string;
  tags: string[];
};
