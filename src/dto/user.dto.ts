import { IsDate, IsDateString, IsEmail, IsInt, IsOptional, IsString, IsStrongPassword, Length, MaxDate, min, MinDate, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Roles } from "../types/enums/roles.ts";


const today = new Date();

const minDate = new Date(Date.UTC(today.getFullYear() - 130, today.getMonth(), today.getDate()))
const maxDate = new Date(Date.UTC(today.getFullYear() - 16, today.getMonth(), today.getDate()))






export class CreateAddressDTO {
    @IsString()
    @Length(8, 100)
    street!: string

    @IsInt()
    number!: number

    @IsString()
    @Length(5, 100)
    neighborhood!: string

    @IsString()
    @Length(3, 100)
    city!: string

    @IsString()
    @Length(4, 100)
    state!: string
}

export class CreateUserDTO {
    @Length(10, 100)
    name!: string

    @IsEmail()
    email!: string

    @IsStrongPassword()
    password!: string

    @Type(() => Date)
    @IsDate()
    @MinDate(minDate)
    @MaxDate(maxDate)
    dateOfBirth!: string

    @ValidateNested()
    @Type(() => CreateAddressDTO)
    address!: CreateAddressDTO

}

export class UpdateAddressDTO {
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
    @Type(() => Date)
    @IsDate()
    @MinDate(minDate)
    @MaxDate(maxDate)
    dateOfBirth?: string

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateAddressDTO)
    address?: UpdateAddressDTO
}

export class LoginUserDTO {
    @IsEmail()
    email!: string

    @IsStrongPassword()
    password!: string
}

export class FindAddressDTO {
    constructor(readonly street: string, readonly number: number, readonly neighborhood: string, readonly city: string, readonly state: string) {

    }
}

export class FindUserDTO {
    constructor(readonly id: string, readonly email: string,  readonly role: Roles, readonly dateOfBirth: Date, readonly active: boolean, readonly address: FindAddressDTO, readonly createdAt: Date, readonly updatedAt: Date) {
        
    }
}