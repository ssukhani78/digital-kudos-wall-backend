import { KudosRepository } from "../../../domain/kudos.repository";
import { Kudos } from "../../../domain/kudos.entity";
import { PrismaClient } from "@prisma/client";
import { UniqueEntityID } from "../../../../../shared/domain/unique-entity-id";

export class PrismaKudosRepository implements KudosRepository {
  constructor(private prisma: PrismaClient) {}

  async create(kudos: Kudos): Promise<void> {
    await this.prisma.kudos.create({
      data: {
        id: kudos.id.toString(),
        senderId: kudos.senderId,
        recipientId: kudos.recipientId,
        message: kudos.message,
        category: kudos.category,
        createdAt: kudos.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Kudos | null> {
    const kudos = await this.prisma.kudos.findUnique({
      where: { id },
    });

    if (!kudos) return null;

    return Kudos.create(
      {
        senderId: kudos.senderId,
        recipientId: kudos.recipientId,
        message: kudos.message,
        category: kudos.category,
        createdAt: kudos.createdAt,
      },
      new UniqueEntityID(kudos.id)
    ).getValue();
  }

  async findByRecipientId(recipientId: string): Promise<Kudos[]> {
    const kudosList = await this.prisma.kudos.findMany({
      where: { recipientId },
    });

    return kudosList.map((kudos) =>
      Kudos.create(
        {
          senderId: kudos.senderId,
          recipientId: kudos.recipientId,
          message: kudos.message,
          category: kudos.category,
          createdAt: kudos.createdAt,
        },
        new UniqueEntityID(kudos.id)
      ).getValue()
    );
  }

  async findBySenderId(senderId: string): Promise<Kudos[]> {
    const kudosList = await this.prisma.kudos.findMany({
      where: { senderId },
    });

    return kudosList.map((kudos) =>
      Kudos.create(
        {
          senderId: kudos.senderId,
          recipientId: kudos.recipientId,
          message: kudos.message,
          category: kudos.category,
          createdAt: kudos.createdAt,
        },
        new UniqueEntityID(kudos.id)
      ).getValue()
    );
  }
}
