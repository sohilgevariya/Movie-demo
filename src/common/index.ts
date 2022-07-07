export class apiResponse {
    private status: number | null
    private message: string | null
    private data: any | null
    constructor(status: number, message: string, data: any) {
        this.status = status
        this.message = message
        this.data = data
    }
}
export const [cachingTimeOut, commentLimit] = [1800, 2]