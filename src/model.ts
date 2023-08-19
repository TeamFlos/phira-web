
export enum Permission {
  NONE = 0x00000000,
  ALL = 0xFFFFFFFF,
  UPLOAD_CHART = 0x00000001,
  SEE_UNREVIEWED = 0x00000002,
  DELETE_UNSTABLE = 0x00000004,
  REVIEW = 0x00000008,
  SEE_STABLE_REQ = 0x00000010,
  STABILIZE_CHART = 0x00000020,
  EDIT_TAGS = 0x00000040,
  STABILIZE_JUDGE = 0x00000080,
  DELETE_STABLE = 0x00000100,
  SEE_ALL_EVENTS = 0x00000200,
  BAN_USER = 0x00000400,
  SET_RANKED = 0x00000800,
}

class Permissions {
  private permissions: number;

  constructor(permission: Permission, ...rest: Permission[]) {
    this.permissions = permission;
    rest.forEach((perm) => {
      this.permissions |= perm;
    });
  }

  /**
   * check if the `Permissions` object has the permission
   * @param permission single permission
   * @returns
   */
  has(permission: Permission): boolean {
    return (this.permissions & permission) === permission;
  }

  /**
   * add permission to the `Permissions` object
   * @param permission single permission
   * @param rest other permissions
   */
  grant(permission: Permission, ...rest: Permission[]): void {
    this.permissions |= permission;
    rest.forEach((perm) => {
      this.permissions |= perm;
    });
  }

  /**
   * delete permission from the `Permissions` object
   * @param permission single permission
   * @param rest other permissions
   */
  revoke(permission: Permission, ...rest: Permission[]): void {
    this.permissions &= ~permission;
    rest.forEach((perm) => {
      this.permissions &= ~perm;
    });
  }
}

export enum Role {
  USER = 0x0000,
  ADMIN = 0x0001,
  REVIEWER = 0x0002,
  SUPERVISOR = 0x0004,
  HEAD_SUPERVISOR = 0x0008
}

export class Roles {

  private roles: number;


  constructor(roles: number) {
    this.roles = roles;
  }

  static from(roles: number) {
    return new Roles(roles);
  }

  has(role: Role): boolean {
    return (this.roles & role) === role;
  }

  permissions(banned: boolean): Permissions {
    const perms = new Permissions(Permission.NONE);
    if (!banned) {
      perms.grant(Permission.UPLOAD_CHART);
    }
    if (this.has(Role.ADMIN)) {
      perms.grant(Permission.ALL);
      return perms;
    }
    if (this.has(Role.REVIEWER)) {
      perms.grant(
        Permission.SEE_UNREVIEWED,
        Permission.DELETE_STABLE,
        Permission.REVIEW,
        Permission.EDIT_TAGS,
        Permission.BAN_USER,
      );
    }
    if (this.has(Role.SUPERVISOR)) {
      perms.grant(
        Permission.SEE_UNREVIEWED,
        Permission.SEE_STABLE_REQ,
        Permission.STABILIZE_CHART,
        Permission.EDIT_TAGS,
      );
    }
    if (this.has(Role.HEAD_SUPERVISOR)) {
      perms.grant(
        Permission.STABILIZE_JUDGE,
        Permission.DELETE_STABLE,
        Permission.SET_RANKED,
      );
    }
    return perms;
  }
}


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
  roles: number,
  banned: boolean,

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
  ratingCount: number,

  created: string,
  updated: string,
  chartUpdated: string,
};

export type PlayRecord = {
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
  max_combo: number,
  mods: number,
  full_combo: boolean,
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

export type SimpleUser = {
  id: number,
  name: string,
};

export type StbStatus = {
  stable: boolean,
  stableRequest: boolean,
  approves: SimpleUser[],
  denies: SimpleUser[],
  history: StbHistory[],
};

export type EmailSubs = {
  review: boolean,
  stb: boolean,
};
