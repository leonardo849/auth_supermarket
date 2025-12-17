import { Roles } from "../types/enums/roles.ts";

export class CreateWorkerEvent {
    constructor(readonly id: string,readonly auth_updated_at: string, readonly role: Roles) {
        
    }
}

export class CreatedUserEvent {
    constructor(readonly id: string) {

    }
}