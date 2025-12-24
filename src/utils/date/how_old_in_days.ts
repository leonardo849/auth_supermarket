export function howOldInDays(initalDate: Date): number {
    const now = new Date()
    const date = new Date(initalDate)
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return days
}