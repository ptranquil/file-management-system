const apiSuccess = ( statusCode: number, message: string, res: any, data: any = "") => {
    const response: { status: boolean; message: string; data?: any;} = {
        status: true,
        message,
    };

    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

export default apiSuccess;
