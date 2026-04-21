import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: "Email",
    example: 'test@test.com',
  })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Mot de passe', example: 'password123' })
  @IsString()
  password: string;
}
