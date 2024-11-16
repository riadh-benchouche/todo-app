import { Role } from './roles.enum';
export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}
