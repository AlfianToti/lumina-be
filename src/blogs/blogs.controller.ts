import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Permissions('blogs')
  @Post()
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `book-${filename}_${ext}`);
        },
      }),
      fileFilter(req, file, callback) {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          callback(null, true);
        } else {
          return callback(
            new BadRequestException('Only jpg,png,webp files are allowed'),
            false,
          );
        }
      },
    }),
  )
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const coverPath = file ? `/uploads/images/${file.filename}` : null;
    createBlogDto.cover = coverPath;
    return this.blogsService.create(createBlogDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('sort') sort = 'createdAt',
  ) {
    return this.blogsService.findAll(Number(page), Number(limit), search, sort);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @Permissions('blogs')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.update(id, updateBlogDto);
  }

  @Permissions('blogs')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }
}
