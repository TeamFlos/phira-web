
export type Page<T> = {
  count: number,
  results: T[],
};

export type User = {
  id: number,
  avatar: string,
  name: string,
  email: string,
  language: string,
  bio: string | null,
  badges: string[],

  joined: string,
  last_login: string,
};

export type Chart = {
  id: number,
  name: string,
  composer: string,
  illustrator: string,
  charter: string,
  description: string,
  level: string,
  difficulty: number,
  ranked: boolean,
  stable: boolean,
  stableRequest: boolean,

  illustration: string,
  preview: string,
  file: string,

  uploader: number,

  tags: string[],
  rating?: number,

  created: string,
  updated: string,
  chartUpdated: string,
};

export type Record = {
  id: number,
  player: number,
  chart: number,
  score: number,
  accuracy: number,
  perfect: number,
  good: number,
  bad: number,
  miss: number,
  speed: number,
  maxCombo: number,
  mods: number,
  fullCombo: boolean,
  std: number,
  std_score: number,

  best: boolean,
  best_std: boolean,
  time: string,
};

export type StbHistory = {
  id: number,
  reviewer?: number,
  reviewerName?: string,
  reviewerAvatar?: string,
  chart: number,
  approve: boolean,
  comment?: string,
  time: string,
};
