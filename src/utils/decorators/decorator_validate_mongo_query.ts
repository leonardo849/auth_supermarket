import {validateUpdateQuery} from  "../policies/validate_mongo_query.ts"


export function decoratorValidateUpdateQuery(policy: {allowedFields: string[], allowedOperators: string[]}) {
    return function(target: any, property: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = function(...args: any[]) {
            const query = args[1]
            if (!validateUpdateQuery(query, policy.allowedFields, policy.allowedOperators)) {
                throw new Error(`invalid mongo update query in ${target.constructor.name}.${property}`)
            }
            return originalMethod.apply(this, args)
        }
        return descriptor
    }
}