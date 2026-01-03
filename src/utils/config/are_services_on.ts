export function checkIfServicesAreOn(): boolean {
    if (!process.env.SERVICES) {
        return false
    }
        return process.env.SERVICES.toLowerCase() === "true"
}