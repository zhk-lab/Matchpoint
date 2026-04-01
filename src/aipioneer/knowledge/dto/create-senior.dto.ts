import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateSeniorDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @MaxLength(120)
  school!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  major?: string;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  graduationYear?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  destination?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  direction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  intro?: string;
}
