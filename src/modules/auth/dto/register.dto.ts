import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @Length(6, 50)
  password: string;

  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;
}
