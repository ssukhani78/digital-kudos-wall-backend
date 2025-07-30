export interface RoleRepository {
  findById(id: number): Promise<boolean>;
}
