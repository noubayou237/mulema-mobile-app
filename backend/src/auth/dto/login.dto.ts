import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: "Email",
    example: 'test@test.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mot de passe', example: 'password123' })
  @IsString()
  password: string;
}
