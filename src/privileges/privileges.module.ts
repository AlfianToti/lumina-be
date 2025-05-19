import { Module } from '@nestjs/common';
import { PrivilegesService } from './privileges.service';
import { PrivilegesController } from './privileges.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Privilege, PrivilegeSchema } from './schemas/privilege.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Privilege.name, schema: PrivilegeSchema },
    ]),
  ],
  controllers: [PrivilegesController],
  providers: [PrivilegesService],
  exports: [PrivilegesService],
})
export class PrivilegesModule {}
