import axios from "axios";
import { appError } from "filemanagement-utils";

export const apiSuccess = ( statusCode: number, message: string, res: any, data: any = "") => {
    const response: { status: boolean; message: string; data?: any;} = {
        status: true,
        message,
    };

    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

export const callHeirarchyService = async (method: string, url: string, body: {} ) => {
    let requestConfig = {
        method: method,
        url,
        headers: {
            "x-internal-token": process.env.INTERNAL_SECRET!,
        },
        data: body,
    }
    try {
        const response = await axios(requestConfig);
        return response;
    } catch (err: any) {
        if (err.status === 403) {
            throw(new appError("You are not authorized to access these folders", 403));
        }
        throw(new appError("hierarchy service API Down", 500));
    }
}
