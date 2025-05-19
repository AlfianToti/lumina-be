import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';
import { Model } from 'mongoose';
import { PaginationOptions } from 'src/common/interfaces/pagination.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.categoryModel.create(createCategoryDto);
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
    sort: string,
  ): Promise<{ data: Category[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };

    if (search) {
      filter['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const data = await this.categoryModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ [sort]: -1 })
      .exec();

    const total = await this.categoryModel.countDocuments(filter).exec();

    return { data, page, limit, total };
  }

  findOne(id: string) {
    const category = this.categoryModel.findOne({ _id: id, isDeleted: false });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = this.categoryModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateCategoryDto,
      { new: true },
    );
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  remove(id: string) {
    const category = this.categoryModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }
}
