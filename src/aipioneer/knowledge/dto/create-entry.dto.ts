import { ExperienceCategory } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEntryDto {
  @IsInt()
  @Min(1)
  seniorProfileId!: number;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsEnum(ExperienceCategory)
  category!: ExperienceCategory;

  @IsString()
  @MaxLength(6000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  applicableTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  outcome?: string;

  @IsOptional()
  @IsDateString()
  happenedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  sourceNote?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
