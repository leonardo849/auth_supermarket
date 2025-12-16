export const ALLOWED_MONGO_OPERATORS = [
    "$eq", //equals
    "$ne", // not equal
    "$in", // i don't need to comment that
    "$gte", // greater than or equal
    "$lte", // less than or equal
    "$gt", // greater than
    "$lt" // less than
] 

export const ALLOWED_UPDATE_OPERATORS = [
    "$set",
    "$unset",
    "$inc"
] 