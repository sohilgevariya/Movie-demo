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
exports.by_id = exports.update_review = exports.add_review = void 0;
const Joi = __importStar(require("joi"));
const common_1 = require("../common");
const mongoose_1 = require("mongoose");
const add_review = async (req, res, next) => {
    const schema = Joi.object({
        movieId: Joi.string().required().error(new Error('movieId is required!')),
        rating: Joi.number().error(new Error('rating is required!')),
        comment: Joi.string().error(new Error('comment is required!')),
    });
    schema.validateAsync(req.body).then(result => {
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.add_review = add_review;
const update_review = async (req, res, next) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        movieId: Joi.string().required().error(new Error('movieId is required!')),
        rating: Joi.number().error(new Error('rating is a number')),
        comment: Joi.string().error(new Error('comment is required!')),
    });
    schema.validateAsync(req.body).then(result => {
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.update_review = update_review;
const by_id = async (req, res, next) => {
    if (!(0, mongoose_1.isValidObjectId)(req.params.id))
        return res.status(400).json(new common_1.apiResponse(400, "Invalid id", {}));
    next();
};
exports.by_id = by_id;
//# sourceMappingURL=review.js.map