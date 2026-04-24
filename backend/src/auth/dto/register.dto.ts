import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: "Nom complet de l'utilisateur",
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: "Email unique de l'utilisateur",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'johndoe', description: "Nom d'utilisateur unique" })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mot de passe (minimum 6 caractères)',
  })
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'fr',
    description: "Langue d'interface préférée (fr ou en)",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['fr', 'en'])
  language?: string;
}
