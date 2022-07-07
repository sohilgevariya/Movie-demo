"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const Joi = __importStar(require("joi"));
const common_1 = require("../common");
const signup = async (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().error(new Error('email is required!')),
        password: Joi.string().required().error(new Error('password is required!')),
        name: Joi.string().trim().required().error(new Error('name is required!')),
    });
    schema.validateAsync(req.body).then(result => {
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}));
    });
};
exports.signup = signup;
const login = async (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().required().error(new Error('email is required!')),
        password: Joi.string().required().error(new Error('password is required!')),
    });
    schema.validateAsync(req.body).then(result => {
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}));
    });
};
exports.login = login;
//# sourceMappingURL=user.js.map