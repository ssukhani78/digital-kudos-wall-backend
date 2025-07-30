import { Kudos } from "./kudos.entity";

export interface KudosRepository {
  create(kudos: Kudos): Promise<void>;
  findById(id: string): Promise<Kudos | null>;
  findByRecipientId(recipientId: string): Promise<Kudos[]>;
  findBySenderId(senderId: string): Promise<Kudos[]>;
}
