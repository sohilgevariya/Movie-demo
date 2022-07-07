"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_upvote_movie = exports.downvote_movie = exports.upvote_movie = exports.get_movie_pagination = exports.get_movie = exports.movie_by_id = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const movie_by_id = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { id } = req.params;
    try {
        // let response = await movieModel.findOne({ _id: ObjectId(id), isActive: true }, { name: 1, genre: 1, details: 1, releaseDate: 1, rating: 1 })
        let response = await database_1.movieModel.aggregate([
            { $match: { _id: ObjectId(id), isActive: true } },
            {
                $lookup: {
                    from: "reviews",
                    let: { movieId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$movieId", "$$movieId"] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "reviews"
                }
            }
        ]);
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
        let response = await database_1.movieModel.find({ isActive: true }, { name: 1, genre: 1, details: 1, releaseDate: 1 }).sort({ releaseDate: -1 });
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
const get_movie_pagination = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let response, { page, limit, search, genre, releaseDate } = req.body, match = {}, user = req.header('user');
    try {
        if (search) {
            var nameArray = [];
            search = search.split(" ");
            search.forEach(data => {
                nameArray.push({ name: { $regex: data, $options: 'si' } });
            });
            match.$or = [{ $and: nameArray }];
        }
        match.isActive = true;
        if (genre)
            match.genre = genre;
        response = await database_1.movieModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "upvotes",
                    let: { movieId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$movieId", "$$movieId"] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "upvote"
                }
            },
            {
                $lookup: {
                    from: "downvotes",
                    let: { movieId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$movieId", "$$movieId"] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "downvote"
                }
            },
            {
                $facet: {
                    data: [
                        { $sort: { releaseDate: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                name: 1, genre: 1, details: 1, releaseDate: 1, isActive: 1,
                                isUpvote: { $cond: { if: { $in: [ObjectId(user?._id), "$upvote.userId"] }, then: true, else: false } },
                                isDownVote: { $cond: { if: { $in: [ObjectId(user?._id), "$downvote.userId"] }, then: true, else: false } },
                            }
                        },
                    ],
                    data_count: [{ $count: "count" }]
                }
            },
        ]);
        return res.status(200).json(new common_1.apiResponse(200, 'Movie successfully retrieved!', {
            movie_data: response[0]?.data,
            state: {
                page: req.body?.page,
                limit: req.body?.limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / (req.body?.limit)) || 1
            }
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', {}));
    }
};
exports.get_movie_pagination = get_movie_pagination;
const upvote_movie = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, user = req.header('user');
    try {
        body.userId = user?._id;
        let findData = await database_1.downVoteModel.findOne({ movieId: ObjectId(body.movieId), userId: ObjectId(user._id) });
        if (findData) {
            await database_1.downVoteModel.deleteOne({ userId: ObjectId(user._id), movieId: ObjectId(body.movieId) });
            await database_1.movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { downVote: -1 } });
        }
        let existData = await database_1.upvoteModel.findOne({ movieId: ObjectId(body.movieId), userId: ObjectId(user._id) });
        if (existData != null) {
            await database_1.upvoteModel.deleteOne({ userId: ObjectId(user._id), movieId: ObjectId(body.movieId) });
            await database_1.movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { upVote: -1 } });
            return res.status(200).json(new common_1.apiResponse(200, 'Movie successfully not upVoted!', {}));
        }
        else {
            let response = await new database_1.upvoteModel(body).save();
            await database_1.movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { upVote: 1 } });
            return res.status(200).json(new common_1.apiResponse(200, 'Movie successfully upVoted!', {}));
        }
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', error));
    }
};
exports.upvote_movie = upvote_movie;
const downvote_movie = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, user = req.header('user');
    try {
        body.userId = user?._id;
        let findData = await database_1.upvoteModel.findOne({ movieId: ObjectId(body.movieId), userId: ObjectId(user._id) });
        if (findData) {
            await database_1.upvoteModel.deleteOne({ userId: ObjectId(user._id), movieId: ObjectId(body.movieId) });
            await database_1.movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { upVote: -1 } });
        }
        let existData = await database_1.downVoteModel.findOne({ movieId: ObjectId(body.movieId), userId: ObjectId(user._id) });
        if (existData != null) {
            await database_1.downVoteModel.deleteOne({ userId: ObjectId(user._id), movieId: ObjectId(body.movieId) });
            await database_1.movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { downVote: -1 } });
            return res.status(200).json(new common_1.apiResponse(200, 'Movie successfully not downVoted!', {}));
        }
        else {
            let response = await new database_1.downVoteModel(body).save();
            await database_1.movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { downVote: 1 } });
            return res.status(200).json(new common_1.apiResponse(200, 'Movie successfully downVoted!', {}));
        }
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', error));
    }
};
exports.downvote_movie = downvote_movie;
const get_upvote_movie = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        let response = await database_1.movieModel.aggregate([
            { $match: { isActive: true } },
            { $sort: { upVote: -1 } },
            { $limit: 10 }
        ]);
        return res.status(200).json(new common_1.apiResponse(200, 'Movie successfully fetched!', response));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', {}));
    }
};
exports.get_upvote_movie = get_upvote_movie;
//# sourceMappingURL=movie.js.map