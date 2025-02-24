export {};

export type Roles = 'admin';
declare global {
  interface CustomJwtSessionClaims {
    userId?: {
      userId?: string;
    };
    metadata: {
      role?: Roles;
    };
  }
}
