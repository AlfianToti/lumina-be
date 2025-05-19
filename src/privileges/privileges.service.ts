import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrivilegeDto } from './dto/create-privilege.dto';
import { UpdatePrivilegeDto } from './dto/update-privilege.dto';
import { Privilege } from './schemas/privilege.schema';
import { PaginationOptions } from 'src/common/interfaces/pagination.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PrivilegesService {
  constructor(
    @InjectModel(Privilege.name) private privilageModel: Model<Privilege>,
  ) {}

  async create(createPrivilegeDto: CreatePrivilegeDto): Promise<Privilege> {
    const privilege = new this.privilageModel(createPrivilegeDto);
    return privilege.save();
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
    sort: string,
  ): Promise<{
    data: Privilege[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };

    if (search) {
      filter['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const data = await this.privilageModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ [sort]: -1 })
      .exec();

    const total = await this.privilageModel.countDocuments(filter).exec();

    return { data, page, limit, total };
  }

  async findOne(id: string): Promise<Privilege> {
    const privilege = await this.privilageModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    if (!privilege) {
      throw new NotFoundException(`Privilege with id ${id} not found`);
    }
    return privilege;
  }

  async update(
    id: string,
    updatePrivilegeDto: UpdatePrivilegeDto,
  ): Promise<Privilege> {
    const privilege = await this.privilageModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updatePrivilegeDto, {
        new: true,
      })
      .exec();
    if (!privilege) {
      throw new NotFoundException(`Privilege with id ${id} not found`);
    }
    return privilege;
  }

  async remove(id: string): Promise<Privilege> {
    const privilege = await this.privilageModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true },
      )
      .exec();
    if (!privilege) {
      throw new NotFoundException(`Privilege with id ${id} not found`);
    }
    return privilege;
  }
}
