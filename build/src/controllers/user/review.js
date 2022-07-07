"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_review_by_movie = exports.add_review = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const add_review = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, user = req.header('user');
    try {
        let isAlreadyFeedback = await database_1.reviewModel.findOne({ createdBy: ObjectId(user._id), movieId: ObjectId(body?.movieId), isActive: true });
        if (isAlreadyFeedback) {
            let movie_data = await database_1.movieModel.findOne({ _id: ObjectId(body?.movieId), isActive: true });
            if (movie_data) {
                await database_1.movieModel.findOneAndUpdate({ _id: ObjectId(movie_data?._id), isActive: true }, {
                    rating: ((((movie_data?.totalRating * movie_data?.rating) - isAlreadyFeedback?.rating) + body?.rating) / movie_data?.totalRating)
                });
            }
            let response = await database_1.reviewModel.findOneAndUpdate({ movieId: ObjectId(body?.movieId) }, body, { new: true });
            if (response)
                return res.status(200).json(new common_1.apiResponse(200, "review added successfully!", response));
            else
                return res.status(200).json(new common_1.apiResponse(200, "Data error", {}));
        }
        else {
            let movie_data = await database_1.movieModel.findOne({ _id: ObjectId(body?.movieId), isActive: true });
            if (movie_data) {
                await database_1.movieModel.findOneAndUpdate({ _id: ObjectId(movie_data?._id), isActive: true }, {
                    $inc: { totalRating: 1 },
                    rating: (((movie_data?.totalRating * movie_data?.rating) + body?.rating) / (movie_data?.totalRating + 1))
                });
            }
            let response = await new database_1.reviewModel(body).save();
            if (response)
                return res.status(200).json(new common_1.apiResponse(200, "review added successfully!", response));
            else
                return res.status(200).json(new common_1.apiResponse(200, "Data error", {}));
        }
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', {}));
    }
};
exports.add_review = add_review;
const get_review_by_movie = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user');
    try {
        let response = await database_1.reviewModel.aggregate([
            { $match: { shopId: ObjectId(req.params.id), isActive: true } },
        ]);
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, "review data successfully", response));
        else
            return res.status(400).json(new common_1.apiResponse(400, "Data error", {}));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, "Internal server error", {}));
    }
};
exports.get_review_by_movie = get_review_by_movie;
//# sourceMappingURL=review.js.map