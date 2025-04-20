import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import _ from "lodash";
import { catchAsync, appError } from "filemanagement-utils";

import userModel from "../models/user.model";
import apiSuccess from "../utils/helper";


export const healthCheck = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    return apiSuccess(200, "User Service is Healthy!!!!!", res);
});

/** function to check the existence in DB based on the pass obj param */
async function checkExist(data: any) {
    const isUserExist = await userModel.find({
        ...data,
        isActive: true
    }).select("-_id -password -token -isActive, -createdAt -updatedAt");
    return isUserExist;
}

export const signUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const reqData = req.body;

    /** checking whether user already exist */
    /** Email duplication check */
    let userEmailExist = await checkExist({ email: reqData.email })
    if (userEmailExist.length > 0) {
        return next(new appError("User email already exists", 409));
    }
    const password = await bcrypt.hash(reqData.password, 10);
    const newUser = new userModel({
        name: reqData.name,
        email: reqData.email,
        password: password,
        isActive: true
    });
    await newUser.save();
    return apiSuccess(201, "User Registeration Succesfull", res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    /** check wheter userExist */
    let user = await userModel.find({ email, isActive: true })
    if (user.length <= 0) {
        return next(new appError("Unauthorized - Invalid credential", 404));
    }

    /** Password validity check */
    const flag = await bcrypt.compare(password, user[0].password);
    if (!flag) {
        return next(new appError("Unauthorized - Invalid credential", 401));
    }

    // /** jwt token creation */
    //! Need to handle the expriesIn issue with .env file #######################################################
    const token = jwt.sign(
        { userId: user[0]._id },
        process.env.JWT_USER_SECRETKEY as string,
        { expiresIn: "1h" }
    );

    user[0].token = token;
    await user[0].save();
    return apiSuccess(200, "User logged in successfully", res, { token: token });
});

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.user.userId;
    const reqData = req.body;

    /** checking whether user exist and active */
    let existingUser = await userModel.findById(userId);
    if (_.isEmpty(existingUser)) {
        return next(new appError("User not found or is inactive", 404));
    }
    /** Validating user updated data */
    if (reqData.email) {
        /** Check for email duplication if email is provided */
        const userEmailExist = await userModel.findOne({ email: reqData.email, _id: { $ne: userId } });
        if (userEmailExist) {
            return next(new appError("Email is already in use", 409));
        }
        existingUser.email = reqData.email;
    }

    if (reqData.password) {
        /** Hasing and updating the password if provided */
        const hashedPassword = await bcrypt.hash(reqData.password, 10);
        existingUser.password = hashedPassword;
    }

    /** Updating other fields if needed */
    if (reqData.name) {
        existingUser.name = reqData.name;
    }

    await existingUser.save();
    return apiSuccess(200, "User updated successfully", res);
});