import { PrismaClient } from "../../../../../shared/infrastructure/persistence/prisma/client";
import { KudosRepository } from "../../../domain/kudos.repository";
import { Kudos } from "../../../domain/kudos.entity";

export class PrismaKudosRepository implements KudosRepository {
  constructor(private prisma: PrismaClient) {}

  async create(kudos: Kudos): Promise<void> {
    await this.prisma.kudos.create({
      data: {
        id: kudos.id.toString(),
        categoryId: kudos.categoryId,
        senderId: kudos.senderId,
        recipientId: kudos.recipientId,
        message: kudos.message,
        createdAt: kudos.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Kudos | null> {
    const kudos = await this.prisma.kudos.findUnique({
      where: { id },
      include: {
        sender: true,
        recipient: true,
        category: true,
      },
    });

    if (!kudos) {
      return null;
    }

    return Kudos.create({
      categoryId: kudos.categoryId,
      senderId: kudos.senderId,
      recipientId: kudos.recipientId,
      message: kudos.message,
      createdAt: kudos.createdAt,
    }).getValue();
  }

  async findBySenderId(senderId: string): Promise<Kudos[]> {
    const kudos = await this.prisma.kudos.findMany({
      where: { senderId },
      include: {
        sender: true,
        recipient: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return kudos.map((kudos) =>
      Kudos.create({
        categoryId: kudos.categoryId,
        senderId: kudos.senderId,
        recipientId: kudos.recipientId,
        message: kudos.message,
        createdAt: kudos.createdAt,
      }).getValue()
    );
  }

  async findByRecipientId(recipientId: string): Promise<Kudos[]> {
    const kudos = await this.prisma.kudos.findMany({
      where: { recipientId },
      include: {
        sender: true,
        recipient: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return kudos.map((kudos) =>
      Kudos.create({
        categoryId: kudos.categoryId,
        senderId: kudos.senderId,
        recipientId: kudos.recipientId,
        message: kudos.message,
        createdAt: kudos.createdAt,
      }).getValue()
    );
  }
}
