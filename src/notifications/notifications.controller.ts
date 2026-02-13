import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('isRead') isRead?: string,
  ) {
    const isReadFilter = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
    return this.notificationsService.findByUser(userId, isReadFilter);
  }

  @Get('user/:userId/unread-count')
  getUnreadCount(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.findOne(id);

    @Patch(':id/mark-read')
    markAsRead(@Param('id', ParseIntPipe) id: number) {
      return this.notificationsService.markAsRead(id);
    }

    @Patch(':id/mark-sent')
    markAsSent(@Param('id', ParseIntPipe) id: number) {
      return this.notificationsService.markAsSent(id);
    }

    @Patch('user/:userId/mark-all-read')
    markAllAsRead(@Param('userId', ParseIntPipe) userId: number) {
      return this.notificationsService.markAllAsRead(userId);
    }

    @Post('bulk')
    bulkCreate(@Body() body: { notifications: CreateNotificationDto[] }) {
      return this.notificationsService.bulkCreate(body.notifications);
    }
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }
}
