declare class appError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    constructor(message: any, statusCode: any);
}
export default appError;
