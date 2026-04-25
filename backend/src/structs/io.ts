export class ApiResponse {
    constructor (
        public statusCode: number = 200,
        public errors: string[] = [],
        public payload: any = {}
    ) {}
}

export interface QueryRequest {
    query: string;
}