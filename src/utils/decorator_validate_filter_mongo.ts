import { validateMongoFilter } from "./validate_filter_mongo.ts"


export function decoratorValidateFilter(policy: {allowedFields: string[], allowedOperators: string[]}) {
    return function(target: any, property: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = function(...args: any[]) {
            const filter = args[0]
            if (!validateMongoFilter(filter, policy.allowedFields, policy.allowedOperators)) {
                throw new Error(`invalid mongo filter in ${target.constructor.name}.${property}`)
            }

            return originalMethod.apply(this, args)
        }
        return descriptor
    }
}