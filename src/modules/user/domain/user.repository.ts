import { User } from "./user.entity";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  deleteAll(): Promise<void>;
  findAllExceptUser(userId: string): Promise<User[]>;
}
