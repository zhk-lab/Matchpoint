import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seniorProfileId?: number;
}
