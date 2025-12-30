import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: "Email ou nom d'utilisateur", example: 'johndoe' })
  @IsString()
  identifier: string; // email ou username

  @ApiProperty({ description: 'Mot de passe', example: 'password123' })
  @IsString()
  password: string;
}
