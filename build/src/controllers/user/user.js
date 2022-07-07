"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signUp = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("config"));
const ObjectId = require('mongoose').Types.ObjectId;
const jwt_token_secret = config_1.default.get('jwt_token_secret');
const refresh_jwt_token_secret = config_1.default.get('refresh_jwt_token_secret');
const signUp = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        let body = req.body;
        let isAlready = await database_1.userModel.findOne({ email: body?.email, isActive: true });
        if (isAlready)
            return res.status(409).json(new common_1.apiResponse(409, 'email already registered!', {}));
        const salt = await bcryptjs_1.default.genSaltSync(8);
        const hashPassword = await bcryptjs_1.default.hash(body.password, salt);
        delete body.password;
        body.password = hashPassword;
        let addUser = await new database_1.userModel(body).save();
        const token = jsonwebtoken_1.default.sign({
            _id: addUser._id,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret);
        let response = {
            _id: addUser?._id,
            name: addUser?.name,
            email: addUser?.email,
            token
        };
        return res.status(200).json(new common_1.apiResponse(200, "signup successfully!", response));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', {}));
    }
};
exports.signUp = signUp;
const login = async (req, res) => {
    let body = req.body, response;
    (0, winston_logger_1.reqInfo)(req);
    try {
        response = await database_1.userModel.findOne({ email: body.email, isActive: true }).select('-__v -createdAt -updatedAt');
        if (!response)
            return res.status(400).json(new common_1.apiResponse(400, 'invalid email or password', {}));
        const passwordMatch = await bcryptjs_1.default.compare(body.password, response.password);
        if (!passwordMatch)
            return res.status(400).json(new common_1.apiResponse(400, 'invalid email or password', {}));
        const token = jsonwebtoken_1.default.sign({
            _id: response._id,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret);
        response = {
            _id: response?._id,
            name: response?.name,
            email: response?.email,
            token
        };
        return res.status(200).json(new common_1.apiResponse(200, 'Login successfully', response));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', {}));
    }
};
exports.login = login;
//# sourceMappingURL=user.js.map