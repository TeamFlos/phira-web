export enum Permission {
  NONE = 0x00000000,
  ALL = 0xffffffff,
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
  SET_ROLES = 0x00001000,
  SET_REVIEWER = 0x00002000,
  SET_SUPERVISOR = 0x00004000,
  BAN_AVATAR = 0x00008000,
  REVIEW_PECJAM = 0x00010000,
  UPLOAD_RECORD = 0x00020000,
  BAN_USER_LOGIN = 0x00040000,
  HIDE_CHART = 0x00080000,
}

export class Permissions {
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
  HEAD_SUPERVISOR = 0x0008,
  HEAD_REVIEWER = 0x0010,
}

export class Roles {
  roles: number;

  constructor(roles: number) {
    this.roles = roles;
  }

  static from(roles: number) {
    return new Roles(roles);
  }

  static all() {
    let res = 0;
    for (const roleFlag in Role) {
      if (!isNaN(Number(roleFlag))) {
        res |= Number(roleFlag);
      }
    }
    return new Roles(res);
  }

  *iter() {
    for (const roleName in Role) {
      if (isNaN(Number(roleName))) {
        if (Number(Role[roleName]) === Role.USER) {
          continue;
        }
        yield roleName;
      }
    }
  }

  *iter_flags() {
    for (const roleFlag in Role) {
      if (!isNaN(Number(roleFlag))) {
        if (Number(roleFlag) === Role.USER) {
          continue;
        }
        yield Number(roleFlag);
      }
    }
  }

  diff(older: Roles) {
    return {
      added: Roles.from(this.roles & (older.roles ^ Roles.all().roles)),
      removed: Roles.from((this.roles ^ Roles.all().roles) & older.roles),
    };
  }

  to_selection() {
    const res: { [key: string]: boolean } = {};
    for (const r of Roles.all().iter_flags()) {
      res[Role[r]] = (this.roles & r) == r;
    }
    return res;
  }

  static from_selection(selection: { [key: string]: boolean }) {
    let res = 0;
    for (const r of Roles.all().iter_flags()) {
      if (selection[Role[r]]) {
        res |= r;
      }
    }
    return new Roles(res);
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
      perms.grant(Permission.SEE_UNREVIEWED, Permission.DELETE_STABLE, Permission.REVIEW, Permission.EDIT_TAGS);
    }
    if (this.has(Role.SUPERVISOR)) {
      perms.grant(Permission.SEE_UNREVIEWED, Permission.SEE_STABLE_REQ, Permission.STABILIZE_CHART, Permission.EDIT_TAGS);
    }
    if (this.has(Role.HEAD_SUPERVISOR)) {
      perms.grant(Permission.STABILIZE_JUDGE, Permission.DELETE_STABLE, Permission.SET_RANKED, Permission.SET_SUPERVISOR);
    }
    if (this.has(Role.HEAD_REVIEWER)) {
      perms.grant(Permission.SET_REVIEWER, Permission.BAN_USER, Permission.BAN_AVATAR);
    }
    return perms;
  }
}

export type Page<T> = {
  count: number;
  results: T[];
};

export type User = {
  id: number;
  avatar: string;
  name: string;
  email: string;
  language: string;
  bio: string | null;
  badges: string[];
  roles: number;
  banned: boolean;
  login_banned: boolean;

  rks: number;

  follower_count: number;
  following_count: number;

  joined: string;
  last_login: string;
};

export type UserView = User & { following: boolean };

export type Chart = {
  id: number;
  name: string;
  composer: string;
  illustrator: string;
  charter: string;
  description?: string;
  level: string;
  difficulty: number;
  reviewed: boolean;
  ranked: boolean;
  stable: boolean;
  stableRequest: boolean;

  illustration: string;
  preview: string;
  file: string;

  uploader: number;

  tags: string[];
  rating?: number;
  ratingCount: number;

  created: string;
  updated: string;
  chartUpdated: string;
};

export type PlayRecord = {
  id: number;
  player: number;
  chart: number;
  score: number;
  accuracy: number;
  perfect: number;
  good: number;
  bad: number;
  miss: number;
  speed: number;
  max_combo: number;
  mods: number;
  full_combo: boolean;
  std: number;
  std_score: number;

  best: boolean;
  best_std: boolean;
  time: string;
};

export type PoolItem = {
  record: number;
  chart: number;
  rks: number;
};

export type RecordPool = {
  bestPool: PoolItem[];
  recentPool: PoolItem[];
  rks: number;
};

export type StbHistory = {
  id: number;
  reviewer?: number;
  reviewerName?: string;
  reviewerAvatar?: string;
  chart: number;
  approve: boolean;
  comment?: string;
  time: string;
};

export type SimpleUser = {
  id: number;
  name: string;
};

export type StbStatus = {
  stable: boolean;
  stableRequest: boolean;
  approves: SimpleUser[];
  denies: SimpleUser[];
  history: StbHistory[];
};

export type EmailSubs = {
  review: boolean;
  stb: boolean;
};

export type OAuthApp = {
  id: number;
  name: string;
  clientId: string;
  redirectUri: string;
  maxPerm: number;
  avatar: string;
  creator: number;
  created: string;
};
