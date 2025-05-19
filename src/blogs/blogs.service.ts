import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './schemas/blog.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<Blog>,
  ) {}
  create(createBlogDto: CreateBlogDto) {
    function toObjectId(id: string | Types.ObjectId): Types.ObjectId {
      return typeof id === 'string' ? new Types.ObjectId(id) : id;
    }
    const blogData = {
      ...createBlogDto,
      category: toObjectId(createBlogDto.category),
      authors: createBlogDto.authors.map(toObjectId),
    };
    const result = new this.blogModel(blogData);
    return result.save();
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
    sort: string,
  ): Promise<{ data: Blog[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const pipeline: any[] = [
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'users',
          localField: 'authors',
          foreignField: '_id',
          as: 'authors',
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { 'category.name': { $regex: search, $options: 'i' } },
            { 'authors.name': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    if (sort) {
      pipeline.push({ $sort: { [sort]: -1 } });
    }

    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await this.blogModel.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    const data = await this.blogModel.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit },
    ]);

    return { data, page, limit, total };
  }

  async findOne(id: string) {
    const role = await this.blogModel
      .findOne({ _id: id, isDeleted: false })
      .populate('authors')
      .populate('category')
      .exec();
    if (!role) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const role = await this.blogModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateBlogDto, {
        new: true,
      })
      .exec();
    if (!role) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return role;
  }

  async remove(id: string): Promise<Blog> {
    const role = await this.blogModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true },
      )
      .exec();
    if (!role) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return role;
  }
}
