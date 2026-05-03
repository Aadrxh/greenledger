export type UserRole = 'admin' | 'member';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}
