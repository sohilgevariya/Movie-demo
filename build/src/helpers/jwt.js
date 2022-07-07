"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.partial_userJWT = exports.userJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("config"));
const database_1 = require("../database");
const mongoose_1 = __importDefault(require("mongoose"));
const common_1 = require("../common");
const ObjectId = mongoose_1.default.Types.ObjectId;
const jwt_token_secret = config_1.default.get('jwt_token_secret');
const userJWT = async (req, res, next) => {
    let { authorization, userType } = req.headers, result;
    if (authorization) {
        try {
            let isVerifyToken = jsonwebtoken_1.default.verify(authorization, jwt_token_secret);
            result = await database_1.userModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true });
            if (result?.isBlock == true)
                return res.status(403).json(new common_1.apiResponse(403, 'Your account han been blocked.', {}));
            if (result?.isActive == true) {
                req.headers.user = result;
                return next();
            }
            else {
                return res.status(401).json(new common_1.apiResponse(401, "Invalid-Token", {}));
            }
        }
        catch (err) {
            if (err.message == "invalid signature")
                return res.status(403).json(new common_1.apiResponse(403, `Don't try different one token`, {}));
            console.log(err);
            return res.status(401).json(new common_1.apiResponse(401, "Invalid Token", {}));
        }
    }
    else {
        return res.status(401).json(new common_1.apiResponse(401, "Token not found in header", {}));
    }
};
exports.userJWT = userJWT;
const partial_userJWT = async (req, res, next) => {
    let { authorization, userType } = req.headers, result;
    if (!authorization) {
        next();
    }
    else {
        try {
            let isVerifyToken = jsonwebtoken_1.default.verify(authorization, jwt_token_secret);
            result = await database_1.userModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true });
            if (result.isActive == true) {
                // Set in Header Decode Token Information
                req.headers.user = isVerifyToken;
                return next();
            }
            else {
                return res.status(401).json(new common_1.apiResponse(401, "Invalid-Token", {}));
            }
        }
        catch (err) {
            if (err.message == "invalid signature")
                return res.status(403).json(new common_1.apiResponse(403, `Don't try different one token`, {}));
            if (err.message === "jwt must be provided")
                return res.status(403).json(new common_1.apiResponse(403, `Token not found in header`, {}));
            console.log(err);
            return res.status(401).json(new common_1.apiResponse(401, "Invalid Token", {}));
        }
    }
};
exports.partial_userJWT = partial_userJWT;
//# sourceMappingURL=jwt.js.map