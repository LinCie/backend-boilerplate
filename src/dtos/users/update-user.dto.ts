import { IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Matches(/^\S*$/, {
    message: "Username should not contain spaces",
  })
  readonly username?: string;
}
