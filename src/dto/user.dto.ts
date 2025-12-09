import { IsDateString, IsEmail, IsInt, IsOptional, IsString, IsStrongPassword, Length, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class CreateAddressDTO {
    @IsString()
    @Length(10, 100)
    street!: string

    @IsInt()
    number!: number

    @IsString()
    @Length(10, 100)
    neighborhood!: string

    @IsString()
    @Length(10, 100)
    city!: string

    @IsString()
    @Length(10, 100)
    state!: string
}

export class CreateUserDTO {
    @Length(10, 100)
    name!: string

    @IsEmail()
    email!: string

    @IsStrongPassword()
    password!: string

    @IsDateString()
    dateOfBirth!: string

    @ValidateNested()
    @Type(() => CreateAddressDTO)
    address!: CreateAddressDTO
    
}

class UpdateAddressDTO {
    @IsOptional()
    @IsString()
    @Length(10, 100)
    street?: string

    @IsOptional()
    @IsInt()
    number?: number

    @IsOptional()
    @IsString()
    @Length(10, 100)
    neighborhood?: string

    @IsOptional()
    @IsString()
    @Length(10, 100)
    city?: string

    @IsOptional()
    @IsString()
    @Length(10, 100)
    state?: string
    [key: string]: any
}

export class UpdateUserDTO {
    @IsOptional()
    @Length(10, 100)
    name?: string

    @IsOptional()
    @IsEmail()
    email?: string

    @IsOptional()
    @IsStrongPassword()
    password?: string

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateAddressDTO)
    address?: UpdateAddressDTO
    [key: string]: any
    
}