type MongoFilter = Record<string, any>

//true = approved
// false = reproved
export function validateMongoFilter(filter: MongoFilter, allowedFields: string[],allowedOperators: string[]): boolean {
    if (!filter || Object.keys(filter).length === 0) {
        return false
    }

    for (const field of Object.keys(filter)) {
        if (!allowedFields.includes(field)) {
            return false
        }

        const value = filter[field]

        
        if ( typeof value === "object" && value !== null &&!Array.isArray(value) && !(value instanceof Date)) {
            for (const operator of Object.keys(value)) {
                if (!allowedOperators.includes(operator)) {
                    return false
                }
            }
        }
    }


    return true
}
