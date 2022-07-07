"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete_movie = exports.get_movie = exports.movie_by_id = exports.update_movie = exports.add_movie = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const add_movie = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, search = new RegExp(`^${body.name}$`, "ig");
    try {
        let isExist = await database_1.movieModel.findOne({ name: { $regex: search }, isActive: true });
        if (isExist) {
            return res.status(409).json(new common_1.apiResponse(409, 'Movie data already exist!', {}));
        }
        let response = await new database_1.movieModel(body).save();
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, 'Movie successfully added!', response));
        else
            return res.status(400).json(new common_1.apiResponse(400, 'Oops! Something went wrong!', {}));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', error));
    }
};
exports.add_movie = add_movie;
const update_movie = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, movieId = body?.movieId;
    try {
        delete body?.movieId;
        let response = await database_1.movieModel.findOneAndUpdate({ _id: ObjectId(movieId), isActive: true }, body);
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, 'Movie successfully updated!', {}));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, 'Movie data not found!', {}));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', error));
    }
};
exports.update_movie = update_movie;
const movie_by_id = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { id } = req.params;
    try {
        let response = await database_1.movieModel.findOne({ _id: ObjectId(id), isActive: true }, { name: 1, genre: 1, details: 1 });
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, 'Movie successfully retrieved!', response));
        else
            return res.status(400).json(new common_1.apiResponse(400, 'Movie not found!', {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', error));
    }
};
exports.movie_by_id = movie_by_id;
const get_movie = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        let response = await database_1.movieModel.find({ isActive: true }, { name: 1, genre: 1, details: 1 }).sort({ createdAt: -1 });
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, 'Movies successfully retrieved!', response));
        else
            return res.status(400).json(new common_1.apiResponse(400, 'Movies not found!', {}));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', error));
    }
};
exports.get_movie = get_movie;
const delete_movie = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let id = req.params.id;
    try {
        let response = await database_1.movieModel.findByIdAndDelete({ _id: ObjectId(id) });
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, 'Movie has been successfully deleted!', response));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, 'Movies not found!', {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', error));
    }
};
exports.delete_movie = delete_movie;
//# sourceMappingURL=movie.js.map