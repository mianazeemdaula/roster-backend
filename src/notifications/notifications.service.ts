import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) { }

  create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  findAll() {
    return this.prisma.notification.findMany();
  }

  findByUser(userId: number, isRead?: boolean) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(isRead !== undefined ? { isRead } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { userId, unreadCount: count };
  }

  findOne(id: number) {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    });
  }

  remove(id: number) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAsSent(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isSent: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async bulkCreate(notifications: CreateNotificationDto[]) {
    return this.prisma.notification.createMany({
      data: notifications,
    });
  }
}
