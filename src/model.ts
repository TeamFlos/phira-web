
export type User = {
  id: number,
  avatar: string,
  name: string,
  email: string,
  language: string,
  bio: string | null,
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
  stable_request: boolean,

  illustration: string,
  preview: string,
  file: string,

  uploader: number,

  tags: string[],
  rating?: number,

  created: string,
  updated: string,
  chart_updated: string,
};
