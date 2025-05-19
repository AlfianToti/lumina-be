import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bycrpt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    const hash = await bycrpt.hash(createUserDto.password, 10);
    createUserDto.password = hash;
    const result = new this.userModel(createUserDto);
    return result.save();
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
    sort: string,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };

    if (search) {
      filter['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const data = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ [sort]: -1 })
      .populate('role')
      .exec();

    const total = await this.userModel.countDocuments(filter).exec();
    return { data, page, limit, total };
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findUserWithRoleAndPermission(id: string): Promise<User | null> {
    return this.userModel.findById(id).populate({
      path: 'role',
      populate: {
        path: 'permissions',
        model: 'Privilege',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).populate('role');
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateUserDto,
      { new: true },
    );
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  remove(id: string) {
    const user = this.userModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }
}
