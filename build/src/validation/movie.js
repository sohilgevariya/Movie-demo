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
exports.downVote_movie = exports.upVote_movie = exports.by_id = exports.update_movie = exports.add_movie = void 0;
const Joi = __importStar(require("joi"));
const common_1 = require("../common");
const mongoose_1 = require("mongoose");
const add_movie = async (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().required().error(new Error('name is required!')),
        genre: Joi.array().required().error(new Error('genre is required!')),
        details: Joi.string().required().error(new Error('details is required!')),
        releaseDate: Joi.string().required().error(new Error('releaseDate is required!')),
    });
    schema.validateAsync(req.body).then(result => {
        req.body = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.add_movie = add_movie;
const update_movie = async (req, res, next) => {
    const schema = Joi.object({
        movieId: Joi.string().required().error(new Error('movieId is required!')),
        name: Joi.string().error(new Error('name is string!')),
        genre: Joi.array().error(new Error('genre is array!')),
        details: Joi.string().error(new Error('details is string!')),
        releaseDate: Joi.string().error(new Error('releaseDate is string!')),
    });
    schema.validateAsync(req.body).then(result => {
        if (!(0, mongoose_1.isValidObjectId)(result?.movieId))
            return res.status(400).json(new common_1.apiResponse(400, "movieId invalid !", {}));
        req.body = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.update_movie = update_movie;
const by_id = async (req, res, next) => {
    if (!(0, mongoose_1.isValidObjectId)(req.params.id))
        return res.status(400).json(new common_1.apiResponse(400, "Invalid id", {}));
    next();
};
exports.by_id = by_id;
const upVote_movie = async (req, res, next) => {
    const schema = Joi.object({
        movieId: Joi.string().required().error(new Error('movieId is required!')),
    });
    schema.validateAsync(req.body).then(result => {
        if (!(0, mongoose_1.isValidObjectId)(result?.movieId))
            return res.status(400).json(new common_1.apiResponse(400, "movieId invalid !", {}));
        req.body = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.upVote_movie = upVote_movie;
const downVote_movie = async (req, res, next) => {
    const schema = Joi.object({
        movieId: Joi.string().required().error(new Error('movieId is required!')),
    });
    schema.validateAsync(req.body).then(result => {
        if (!(0, mongoose_1.isValidObjectId)(result?.movieId))
            return res.status(400).json(new common_1.apiResponse(400, "movieId invalid !", {}));
        req.body = result;
        return next();
    }).catch(error => { res.status(400).json(new common_1.apiResponse(400, error.message, {})); });
};
exports.downVote_movie = downVote_movie;
//# sourceMappingURL=movie.js.map