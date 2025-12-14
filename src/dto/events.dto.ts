export class VerifiedUser {
    constructor(readonly id: string, readonly name: string, readonly email: string, readonly updatedAt: Date) {
        
    }
}

export class CreatedUserEvent {
    constructor(readonly id: string) {

    }
}