"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_lat_long = exports.get_profile = exports.update_profile = exports.Apple_SL = exports.facebook_SL = exports.google_SL = exports.user_logout = exports.generate_token = exports.change_password = exports.otp_verification = exports.login = exports.signUp = void 0;
const winston_logger_1 = require("../helpers/winston_logger");
const database_1 = require("../database");
const common_1 = require("../common");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("config"));
const axios_1 = __importDefault(require("axios"));
const ObjectId = require('mongoose').Types.ObjectId;
const jwt_token_secret = config_1.default.get('jwt_token_secret');
const refresh_jwt_token_secret = config_1.default.get('refresh_jwt_token_secret');
const signUp = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, otpFlag = 1, otp;
    try {
        let isAlready = await database_1.userModel.findOne({ email: body.email, isActive: true });
        if (isAlready?.isEmailVerified == true && isAlready?.email == body?.email)
            return res.status(409).json(new common_1.apiResponse(409, responseMessage?.alreadyEmail, {}));
        if (isAlready?.isBlock == true)
            return res.status(401).json(new common_1.apiResponse(401, responseMessage?.accountBlock, {}));
        if (isAlready?.isEmailVerified == false) {
            const salt = await bcryptjs_1.default.genSaltSync(10);
            const hashPassword = await bcryptjs_1.default.hash(body.password, salt);
            delete body.password;
            body.password = hashPassword;
            while (otpFlag == 1) {
                for (let flag = 0; flag < 1;) {
                    otp = await Math.round(Math.random() * 1000000);
                    if (otp.toString().length == 6) {
                        flag++;
                    }
                    let isAlreadyAssign = await database_1.userModel.findOne({ otp: otp, isActive: true });
                    if (isAlreadyAssign?.otp != otp)
                        otpFlag = 0;
                }
            }
            body.authToken = otp;
            body.otp = otp;
            let update_data = await database_1.userModel.findOneAndUpdate({ email: body?.email, isActive: true }, {
                authToken: body.authToken, otp: body.otp
            }, { new: true });
            if (update_data) {
                await email_verification_mail(update_data, otp);
                return res.status(200).json(new common_1.apiResponse(200, "Please verify your email!", { _id: update_data._id }));
            }
        }
        const salt = await bcryptjs_1.default.genSaltSync(10);
        const hashPassword = await bcryptjs_1.default.hash(body.password, salt);
        delete body.password;
        body.password = hashPassword;
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = await Math.round(Math.random() * 1000000);
                if (otp.toString().length == 6) {
                    flag++;
                }
                let isAlreadyAssign = await database_1.userModel.findOne({ otp: otp, isActive: true });
                if (isAlreadyAssign?.otp != otp)
                    otpFlag = 0;
            }
        }
        body.authToken = otp;
        body.otp = otp;
        let response = await new database_1.userModel(body).save();
        await email_verification_mail(response, otp);
        return res.status(200).json(new common_1.apiResponse(200, "Please verify your email!", { _id: response?._id }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, responseMessage?.internalServerError, error));
    }
};
exports.signUp = signUp;
const login = async (req, res) => {
    let body = req.body, response;
    (0, winston_logger_1.reqInfo)(req);
    try {
        response = await database_1.userModel.findOneAndUpdate({ email: body.email, isActive: true }, { $addToSet: { deviceToken: body?.deviceToken } }).select('-__v -createdAt -updatedAt');
        if (!response)
            return res.status(400).json(new common_1.apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}));
        if (response?.isBlock == true)
            return res.status(401).json(new common_1.apiResponse(401, responseMessage?.accountBlock, {}));
        const passwordMatch = await bcryptjs_1.default.compare(body.password, response.password);
        if (!passwordMatch)
            return res.status(400).json(new common_1.apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}));
        const token = jsonwebtoken_1.default.sign({
            _id: response._id,
            authToken: response.authToken,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret);
        const refresh_token = jsonwebtoken_1.default.sign({
            _id: response._id,
            generatedOn: (new Date().getTime())
        }, refresh_jwt_token_secret);
        await new userSessionModel({
            createdBy: response._id,
            refresh_token
        }).save();
        response = {
            _id: response?._id,
            firstName: response?.firstName,
            lastName: response?.lastName,
            image: response?.image,
            email: response?.email,
            isEmailVerified: response?.isEmailVerified,
            token,
            refresh_token,
        };
        return res.status(200).json(new common_1.apiResponse(200, responseMessage?.loginSuccess, response));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, responseMessage?.internalServerError, error));
    }
};
exports.login = login;
const otp_verification = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body;
    try {
        body.isActive = true;
        let data = await database_1.userModel.findOneAndUpdate({ otp: body?.otp, isActive: true }, { deviceToken: body?.deviceToken, otp: 0, isEmailVerified: true }).select('-__v -updatedAt');
        if (!data)
            return res.status(400).json(new common_1.apiResponse(400, responseMessage?.invalidOTP, {}));
        if (data.isBlock == true)
            return res.status(401).json(new common_1.apiResponse(401, responseMessage?.accountBlock, {}));
        const token = jsonwebtoken_1.default.sign({
            _id: data._id,
            authToken: data?.authToken,
            type: data.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret);
        const refresh_token = jsonwebtoken_1.default.sign({
            _id: data._id,
            generatedOn: (new Date().getTime())
        }, refresh_jwt_token_secret);
        await new userSessionModel({
            createdBy: data._id,
            type: 0,
            token
        }).save();
        if (data)
            return res.status(200).json(new common_1.apiResponse(200, responseMessage?.OTPverified, {
                _id: data?._id,
                firstName: data?.firstName,
                lastName: data?.lastName,
                image: data?.image,
                email: data?.email,
                isEmailVerified: data?.isEmailVerified,
                token,
                refresh_token,
            }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, responseMessage?.internalServerError, error));
    }
};
exports.otp_verification = otp_verification;
// export const forgot_password = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let body = req.body,
//         otpFlag = 1, // OTP has already assign or not for cross-verification
//         otp = 0, response: any
//     try {
//         body.isActive = true
//         let data = await userModel.findOne(body).select('email fullName isBlock isEmailVerified')
//         if (!data) return res.status(400).json(new apiResponse(400, responseMessage?.invalidEmail, {}));
//         if (data.isBlock == true) return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}));
//         // if (data?.isEmailVerified == false) return res.status(502).json(new apiResponse(502, responseMessage?.emailUnverified, {}));
//         while (otpFlag == 1) {
//             for (let flag = 0; flag < 1;) {
//                 otp = await Math.round(Math.random() * 1000000)
//                 if (otp.toString().length == 6) {
//                     flag++
//                 }
//             }
//             let isAlreadyAssign = await userModel.findOne({ otp: otp })
//             if (isAlreadyAssign?.otp != otp) otpFlag = 0
//         }
//         if (data?.isEmailVerified)
//             response = await forgot_password_mail(data, otp).then(result => { return result }).catch(error => { return error })
//         else
//             response = await email_verification_mail(data, otp).then(result => { return result }).catch(error => { return error })
//         if (response) {
//             await userModel.findOneAndUpdate(body, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })
//             return res.status(200).json(new apiResponse(200, `${response}`, {}));
//         }
//         else return res.status(501).json(new apiResponse(501, responseMessage?.errorMail, `${response}`));
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error));
//     }
// }
// export const reset_password = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let body = req.body,
//         authToken = 0,
//         id = body.id,
//         otp = body?.otp
//     delete body.otp
//     try {
//         const salt = await bcryptjs.genSaltSync(10)
//         const hashPassword = await bcryptjs.hash(body.password, salt)
//         delete body.password
//         delete body.id
//         body.password = hashPassword
//         for (let flag = 0; flag < 1;) {
//             authToken = await Math.round(Math.random() * 1000000)
//             if (authToken.toString().length == 6) {
//                 flag++
//             }
//         }
//         body.authToken = authToken
//         body.otp = 0
//         body.otpExpireTime = null
//         let response = await userModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true, otp: otp }, body, { new: true })
//         if (response) {
//             await setCache(response?._id, response, cachingTimeOut)
//             return res.status(200).json(new apiResponse(200, responseMessage?.resetPasswordSuccess, { action: "please go to login page" }))
//         }
//         else return res.status(501).json(new apiResponse(501, responseMessage?.resetPasswordError, response))
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error))
//     }
// }
const change_password = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user'), { old_password, new_password } = req.body, authToken;
    try {
        let user_data = await database_1.userModel.findOne({ _id: ObjectId(user._id), isActive: true }).select('password');
        const passwordMatch = await bcryptjs_1.default.compare(old_password, user_data.password);
        if (!passwordMatch)
            return res.status(400).json(new common_1.apiResponse(400, responseMessage?.oldPasswordError, {}));
        const salt = await bcryptjs_1.default.genSaltSync(10);
        const hashPassword = await bcryptjs_1.default.hash(new_password, salt);
        for (let flag = 0; flag < 1;) {
            authToken = await Math.round(Math.random() * 1000000);
            if (authToken.toString().length == 6) {
                flag++;
            }
        }
        let response = await database_1.userModel.findOneAndUpdate({ _id: ObjectId(user._id), isActive: true }, { password: hashPassword, authToken }, { new: true });
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, responseMessage?.passwordChangeSuccess, {}));
        }
        else
            return res.status(501).json(new common_1.apiResponse(501, responseMessage?.passwordChangeError, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, responseMessage?.internalServerError, {}));
    }
};
exports.change_password = change_password;
const generate_token = async (req, res) => {
    let { old_token, refresh_token } = req.body;
    (0, winston_logger_1.reqInfo)(req);
    try {
        let isVerifyToken = jsonwebtoken_1.default.verify(old_token, jwt_token_secret);
        let refreshTokenVerify = jsonwebtoken_1.default.verify(refresh_token, refresh_jwt_token_secret);
        if (refreshTokenVerify._id != isVerifyToken._id)
            return res.status(401).json(new common_1.apiResponse(401, responseMessage?.invalidOldTokenReFreshToken, {}));
        let response = await userSessionModel.findOneAndUpdate({ createdBy: ObjectId(isVerifyToken._id), refresh_token, isActive: true }, { isActive: false });
        if (response == null)
            return res.status(404).json(new common_1.apiResponse(404, responseMessage?.refreshTokenNotFound, {}));
        const token = jsonwebtoken_1.default.sign({
            _id: isVerifyToken._id,
            authToken: isVerifyToken.authToken,
            type: isVerifyToken.userType,
            status: "Generate Token",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret);
        refresh_token = jsonwebtoken_1.default.sign({
            _id: response._id,
            generatedOn: (new Date().getTime())
        }, refresh_jwt_token_secret);
        await new userSessionModel({
            createdBy: response._id,
            refresh_token
        }).save();
        response = {
            token,
            refresh_token
        };
        return res.status(200).json(new common_1.apiResponse(200, responseMessage?.refreshTokenSuccess, response));
    }
    catch (error) {
        console.log(error.message);
        if (error.message == "invalid signature")
            return res.status(401).json(new common_1.apiResponse(401, responseMessage?.differentToken, {}));
        if (error.message == "jwt malformed")
            return res.status(401).json(new common_1.apiResponse(401, responseMessage?.differentToken, {}));
        if (error.message === "jwt must be provided")
            return res.status(401).json(new common_1.apiResponse(401, responseMessage?.tokenNotFound, {}));
        return res.status(500).json(new common_1.apiResponse(500, responseMessage?.internalServerError, error));
    }
};
exports.generate_token = generate_token;
const user_logout = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        await database_1.userModel.findOneAndUpdate({ _id: ObjectId(req.header('user')?._id), isActive: true, }, { $pull: { deviceToken: req.body?.deviceToken } });
        return res.status(200).json(new common_1.apiResponse(200, responseMessage?.logout, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, responseMessage?.internalServerError, error));
    }
};
exports.user_logout = user_logout;
const google_SL = async (req, res) => {
    let { accessToken, idToken, deviceToken } = req.body;
    (0, winston_logger_1.reqInfo)(req);
    try {
        if (accessToken && idToken) {
            let verificationAPI = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`, idAPI = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
            let access_token = await axios_1.default.get(verificationAPI)
                .then((result) => {
                return result.data;
            }).catch((error) => {
                return false;
            });
            let id_token = await axios_1.default.get(idAPI)
                .then((result) => {
                return result.data;
            }).catch((error) => {
                return false;
            });
            if (access_token.email == id_token.email && access_token.verified_email == true) {
                const isUser = await database_1.userModel.findOneAndUpdate({ email: id_token?.email, isActive: true }, { $addToSet: { deviceToken: deviceToken } });
                if (!isUser) {
                    for (let flag = 0; flag < 1;) {
                        var authToken = await Math.round(Math.random() * 1000000);
                        if (authToken.toString().length == 6) {
                            flag++;
                        }
                    }
                    return new database_1.userModel({
                        email: id_token.email,
                        name: id_token.given_name + " " + id_token.family_name,
                        image: id_token.picture,
                        loginType: loginType.google,
                        deviceToken: [deviceToken],
                        authToken
                    }).save()
                        .then(async (response) => {
                        const token = jsonwebtoken_1.default.sign({
                            _id: response._id,
                            authToken: response.authToken,
                            type: response.userType,
                            status: "Login",
                            generatedOn: (new Date().getTime())
                        }, jwt_token_secret);
                        const refresh_token = jsonwebtoken_1.default.sign({
                            _id: response._id,
                            generatedOn: (new Date().getTime())
                        }, refresh_jwt_token_secret);
                        await new userSessionModel({
                            createdBy: response._id,
                            refresh_token
                        }).save();
                        let return_response = {
                            userType: response?.userType,
                            loginType: response?.loginType,
                            _id: response?._id,
                            name: response?.name,
                            email: response?.email,
                            isUserPremium: response?.isUserPremium,
                            image: id_token?.picture,
                            token,
                            refresh_token
                        };
                        return res.status(200).json(new common_1.apiResponse(200, responseMessage?.loginSuccess, return_response));
                    });
                }
                else {
                    if (isUser?.isBlock == true)
                        return res.status(401).json(new common_1.apiResponse(401, responseMessage?.accountBlock, {}));
                    const token = jsonwebtoken_1.default.sign({
                        _id: isUser._id,
                        authToken: isUser.authToken,
                        type: isUser.userType,
                        status: "Login",
                        generatedOn: (new Date().getTime())
                    }, jwt_token_secret);
                    const refresh_token = jsonwebtoken_1.default.sign({
                        _id: isUser._id,
                        generatedOn: (new Date().getTime())
                    }, refresh_jwt_token_secret);
                    await new userSessionModel({
                        createdBy: isUser._id,
                        refresh_token
                    }).save();
                    let response = {
                        userType: isUser?.userType,
                        loginType: isUser?.loginType,
                        _id: isUser?._id,
                        name: isUser?.name,
                        email: isUser?.email,
                        image: isUser?.image,
                        isUserPremium: isUser?.isUserPremium,
                        token,
                        refresh_token
                    };
                    return res.status(200).json(new common_1.apiResponse(200, responseMessage?.loginSuccess, response));
                }
            }
            return res.status(401).json(new common_1.apiResponse(401, responseMessage?.invalidIdTokenAndAccessToken, {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, responseMessage?.internalServerError, error));
    }
};
exports.google_SL = google_SL;
const facebook_SL = async (req, res) => {
    let { accessToken, deviceToken } = req.body;
    (0, winston_logger_1.reqInfo)(req);
    try {
        let userURL = `https://graph.facebook.com/me?fields=first_name,last_name,picture,email&access_token=${accessToken}`;
        let user_profile = await axios_1.default.get(userURL)
            .then((result) => {
            return result.data;
        }).catch((error) => {
            return false;
        });
        if (!user_profile)
            return res.status(200).json(new common_1.apiResponse(200, responseMessage?.invalidToken, {}));
        let userIsExist = await database_1.userModel.findOneAndUpdate({ $and: [{ $or: [{ facebookId: user_profile?.id }, { email: user_profile?.email, }] }, { isActive: true }] }, { $addToSet: { deviceToken: deviceToken } });
        if (userIsExist) {
            if (userIsExist?.isBlock == true)
                return res.status(401).json(new common_1.apiResponse(401, responseMessage?.accountBlock, {}));
            const token = jsonwebtoken_1.default.sign({
                _id: userIsExist._id,
                authToken: userIsExist.authToken,
                type: userIsExist.userType,
                status: "Login",
                generatedOn: (new Date().getTime())
            }, jwt_token_secret);
            const refresh_token = jsonwebtoken_1.default.sign({
                _id: userIsExist._id,
                generatedOn: (new Date().getTime())
            }, refresh_jwt_token_secret);
            await new userSessionModel({
                createdBy: userIsExist._id,
                refresh_token
            }).save();
            let response = {
                _id: userIsExist?._id,
                name: userIsExist?.name,
                userType: userIsExist.userType,
                loginType: userIsExist.loginType,
                email: userIsExist?.email,
                image: userIsExist?.image,
                isUserPremium: userIsExist?.isUserPremium,
                token,
                refresh_token
            };
            return res.status(200).json(new common_1.apiResponse(200, responseMessage?.loginSuccess, response));
        }
        else {
            for (let flag = 0; flag < 1;) {
                var authToken = await Math.round(Math.random() * 1000000);
                if (authToken.toString().length == 6) {
                    flag++;
                }
            }
            return new database_1.userModel({
                email: user_profile.email,
                name: user_profile.first_name + " " + user_profile.last_name,
                loginType: loginType.facebook,
                facebookId: user_profile?.id,
                image: user_profile.picture.data.url,
                deviceToken: [deviceToken],
                authToken
            }).save()
                .then(async (response) => {
                const token = jsonwebtoken_1.default.sign({
                    _id: response._id,
                    authToken: response.authToken,
                    type: response.userType,
                    status: "Login",
                    generatedOn: (new Date().getTime())
                }, jwt_token_secret);
                const refresh_token = jsonwebtoken_1.default.sign({
                    _id: response._id,
                    generatedOn: (new Date().getTime())
                }, refresh_jwt_token_secret);
                await new userSessionModel({
                    createdBy: response._id,
                    refresh_token
                }).save();
                let return_response = {
                    userType: response.userType,
                    loginType: response.loginType,
                    _id: response?._id,
                    name: response?.name,
                    email: response?.email,
                    isUserPremium: response?.isUserPremium,
                    image: user_profile?.picture?.data.url,
                    token,
                    refresh_token
                };
                return res.status(200).json(new common_1.apiResponse(200, responseMessage?.loginSuccess, return_response));
            });
        }
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, responseMessage?.internalServerError, error));
    }
};
exports.facebook_SL = facebook_SL;
const Apple_SL = async (req, res) => {
    let { deviceToken, email, lastName, firstName, appleAuthCode, } = req.body, match = {};
    (0, winston_logger_1.reqInfo)(req);
    try {
        if (email && appleAuthCode.length != 0)
            match = { $or: [{ email, }, { appleAuthCode }], isActive: true, };
        if (!email && appleAuthCode.length != 0)
            match = { isActive: true, appleAuthCode };
        let userExist = await database_1.userModel.findOneAndUpdate(match, { $addToSet: { ...(deviceToken) && { deviceToken }, ...(appleAuthCode.length != 0) && { appleAuthCode } } }, { new: true });
        if (!userExist) {
            if (!email)
                return res.status(400).json(new common_1.apiResponse(400, responseMessage?.appleAccountError, {}));
            for (let flag = 0; flag < 1;) {
                var authToken = await Math.round(Math.random() * 1000000);
                if (authToken.toString().length == 6) {
                    flag++;
                }
            }
            return new database_1.userModel({
                email: email,
                name: "Guest User",
                loginType: loginType.apple,
                deviceToken: [deviceToken],
                authToken,
                appleAuthCode: appleAuthCode
            }).save()
                .then(async (response) => {
                const token = jsonwebtoken_1.default.sign({
                    _id: response._id,
                    authToken: response.authToken,
                    type: response.userType,
                    status: "Login",
                    generatedOn: (new Date().getTime())
                }, jwt_token_secret);
                const refresh_token = jsonwebtoken_1.default.sign({
                    _id: response._id,
                    generatedOn: (new Date().getTime())
                }, refresh_jwt_token_secret);
                await new userSessionModel({
                    createdBy: response._id,
                    refresh_token
                }).save();
                let return_response = {
                    userType: response?.userType,
                    loginType: response?.loginType,
                    _id: response?._id,
                    name: response?.name,
                    email: response?.email,
                    isUserPremium: response?.isUserPremium,
                    image: null,
                    token,
                    refresh_token
                };
                return res.status(200).json(new common_1.apiResponse(200, responseMessage?.loginSuccess, return_response));
            });
        }
        else {
            if (userExist?.isBlock == true)
                return res.status(401).json(new common_1.apiResponse(401, responseMessage?.accountBlock, {}));
            const token = jsonwebtoken_1.default.sign({
                _id: userExist._id,
                authToken: userExist.authToken,
                type: userExist.userType,
                status: "Login",
                generatedOn: (new Date().getTime())
            }, jwt_token_secret);
            const refresh_token = jsonwebtoken_1.default.sign({
                _id: userExist._id,
                generatedOn: (new Date().getTime())
            }, refresh_jwt_token_secret);
            await new userSessionModel({
                createdBy: userExist._id,
                refresh_token
            }).save();
            let response = {
                userType: userExist?.userType,
                loginType: userExist?.loginType,
                _id: userExist?._id,
                name: userExist?.name,
                email: userExist?.email,
                image: userExist?.image,
                isUserPremium: userExist?.isUserPremium,
                token,
                refresh_token
            };
            return res.status(200).json(new common_1.apiResponse(200, responseMessage?.loginSuccess, response));
        }
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, responseMessage?.internalServerError, error));
    }
};
exports.Apple_SL = Apple_SL;
const update_profile = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, user = req.header('user');
    body.updatedBy = user._id;
    try {
        let response = await database_1.userModel.findOneAndUpdate({ _id: ObjectId(req.header('user')?._id), isActive: true, userType: userStatus.user }, body);
        if (response) {
            if (body?.image != response?.image && response.image != null && body?.image != null && body?.image != undefined) {
                let [folder_name, image_name] = await URL_decode(response?.image);
                await deleteImage(image_name, folder_name);
            }
            return res.status(200).json(new common_1.apiResponse(200, 'Profile updated successfully', {}));
        }
        else
            return res.status(404).json(new common_1.apiResponse(404, 'Database error while updating profile', {}));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, "Internal Server Error", error));
    }
};
exports.update_profile = update_profile;
const get_profile = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user'), response;
    try {
        response = await database_1.userModel.findOne({ _id: ObjectId(user._id), isActive: true }).select('firstName lastName image email gender interest isEmailVerified phoneNumber dob isActive isBlock');
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, responseMessage.getDataSuccess('Your profile'), response));
        else
            return res.status(404).json(new common_1.apiResponse(404, responseMessage.getDataNotFound('profile'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, responseMessage?.internalServerError, {}));
    }
};
exports.get_profile = get_profile;
const user_lat_long = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body;
    try {
        let response = await database_1.userModel.findOneAndUpdate({ _id: ObjectId(req.header('user')?._id), isActive: true, }, { latitude: body.latitude, longitude: body.longitude }, { new: true });
        return res.status(200).json(new common_1.apiResponse(200, "Lat long has been added!", response));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, responseMessage?.internalServerError, error));
    }
};
exports.user_lat_long = user_lat_long;
//# sourceMappingURL=authentication.js.map