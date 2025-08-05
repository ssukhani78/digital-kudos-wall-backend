import { User } from "../../user/domain/user.entity";

export interface AuthRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
