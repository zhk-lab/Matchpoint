import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  school?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  grade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  major?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  target?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  bio?: string;
}
