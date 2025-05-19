import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Category } from 'src/categories/schemas/category.schema';

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, default: null })
  cover: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], required: true })
  authors: User[];

  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  category: Category;

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ required: true, default: false })
  isDeleted: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
