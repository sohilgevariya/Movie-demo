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
exports.by_id = exports.update_video = exports.add_video = void 0;
const Joi = __importStar(require("joi"));
const common_1 = require("../common");
const mongoose_1 = require("mongoose");
const helpers_1 = require("../helpers");
const add_video = async (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().trim().required().error(new Error('title is required!')),
        url: Joi.string().trim().required().error(new Error('url is required!')),
        description: Joi.string().trim().required().error(new Error('description is required!')),
        isPremium: Joi.boolean().required().error(new Error('isPremium is required!')),
    });
    schema.validateAsync(req.body).then(result => {
        req.body = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.add_video = add_video;
const update_video = async (req, res, next) => {
    const schema = Joi.object({
        videoId: Joi.string().trim().required().error(new Error('videoId is required!')),
        title: Joi.string().trim().error(new Error('title is string!')),
        description: Joi.string().trim().error(new Error('description is string!')),
        url: Joi.string().trim().error(new Error('url is string!')),
        isPremium: Joi.boolean().error(new Error('isPremium is boolean!')),
    });
    schema.validateAsync(req.body).then(result => {
        if (!(0, mongoose_1.isValidObjectId)(result?.videoId))
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage.invalidId('videoId'), {}));
        req.body = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.update_video = update_video;
const by_id = async (req, res, next) => {
    if (!(0, mongoose_1.isValidObjectId)(req.params.id))
        return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage.invalidId('id'), {}));
    next();
};
exports.by_id = by_id;
//# sourceMappingURL=video.js.map