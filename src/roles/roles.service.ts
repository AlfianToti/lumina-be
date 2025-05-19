import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schemas/role.schema';
import { Model } from 'mongoose';
import { PaginationOptions } from 'src/common/interfaces/pagination.interface';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  create(createRoleDto: CreateRoleDto) {
    return this.roleModel.create(createRoleDto);
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
    sort: string,
  ): Promise<{ data: Role[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'privileges',
          localField: 'permissions',
          foreignField: '_id',
          as: 'permissions',
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { 'permissions.name': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    if (sort) {
      pipeline.push({ $sort: { [sort]: -1 } });
    }

    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await this.roleModel.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    const data = await this.roleModel.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit },
    ]);

    return {
      data,
      page,
      limit,
      total,
    };
  }

  async findOne(id: string) {
    const role = await this.roleModel
      .findOne({ _id: id, isDeleted: false })
      .populate('permissions')
      .exec();
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateRoleDto, {
        new: true,
      })
      .exec();
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  async remove(id: string): Promise<Role> {
    const role = await this.roleModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true },
      )
      .exec();
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }
}
