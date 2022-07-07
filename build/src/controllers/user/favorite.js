"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_filter_favorite = exports.delete_favorite = exports.get_favorite = exports.add_favorite = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("config"));
const get_youtube_id_1 = __importDefault(require("get-youtube-id"));
const axios_1 = __importDefault(require("axios"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const google_api_key = config_1.default.get("google_api_key");
const youtube_url = config_1.default.get("youtube_url");
const add_favorite = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, user = req.header('user');
    try {
        let existFav = await database_1.favoriteModel.findOne({ userId: ObjectId(user._id), videoId: ObjectId(body.videoId), isActive: true });
        if (existFav != null) {
            await database_1.favoriteModel.deleteOne({ userId: ObjectId(user._id), videoId: ObjectId(body.videoId) });
            return res.status(200).json(new common_1.apiResponse(200, 'Video unfavorited successfully', {}));
        }
        else {
            await new database_1.favoriteModel({ userId: ObjectId(user._id), videoId: ObjectId(body.videoId) }).save();
            return res.status(200).json(new common_1.apiResponse(200, 'Video favorited successfully', {}));
        }
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, "Internal Server Error", error));
    }
};
exports.add_favorite = add_favorite;
const get_favorite = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user')?._id;
    try {
        let response = await database_1.favoriteModel.aggregate([
            { $match: { userId: ObjectId(user), isActive: true } },
            {
                $lookup: {
                    from: "videos",
                    let: { videoId: '$videoId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$videoId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        {
                            $project: {
                                title: 1,
                                url: 1,
                                description: 1,
                                isPremium: 1
                            }
                        }
                    ],
                    as: "video"
                }
            },
            {
                $project: {
                    video: { $first: "$video" }
                }
            }
        ]);
        if (response) {
            let data_response = [];
            for (let i = 0; i < response.length; i++) {
                let video_id = (0, get_youtube_id_1.default)(response[i]?.video?.url);
                await axios_1.default.get(`${youtube_url}?part=snippet&key=${google_api_key}&id=${video_id}`).then((res) => {
                    let path = res?.data?.items[0]?.snippet?.thumbnails;
                    response[i].video.thumbnail = path?.maxres == undefined ? path?.standard?.url : path?.maxres?.url;
                    data_response.push({
                        ...response[i],
                    });
                });
            }
            return res.status(200).json(new common_1.apiResponse(200, 'Favorited video', data_response));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, 'Database error', {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, "Internal Server Error", error));
    }
};
exports.get_favorite = get_favorite;
const delete_favorite = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user')?._id;
    try {
        let response = await database_1.favoriteModel.findOneAndUpdate({ _id: ObjectId(req.params.id), isActive: true }, { isActive: false });
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, 'Favorite video deleted', {}));
        else
            return res.status(400).json(new common_1.apiResponse(400, 'Database error', {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, "Internal Server Error", error));
    }
};
exports.delete_favorite = delete_favorite;
const get_filter_favorite = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user'), { limit, page, ascending } = req.body, skip = 0, response = {}, sort = {};
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        sort.createdAt = -1;
        let fav_video = await database_1.favoriteModel.aggregate([
            { $match: { userId: ObjectId(req.header('user')?._id), isActive: true } },
            {
                $lookup: {
                    from: "videos",
                    let: { videoId: '$videoId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$videoId'] },
                                        { $eq: ['$isActive', true] },
                                    ],
                                },
                            }
                        },
                        {
                            $project: {
                                title: 1,
                                url: 1,
                                description: 1,
                                isPremium: 1
                            }
                        }
                    ],
                    as: "video"
                }
            },
            {
                $facet: {
                    video: [
                        { $unwind: { path: "$video" } },
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                video: { $first: "$video" }
                            }
                        }
                    ],
                    video_count: [{ $count: "count" }]
                }
            }
        ]);
        let data_response = [];
        for (let i = 0; i < fav_video[0].video.length; i++) {
            let video_id = (0, get_youtube_id_1.default)(fav_video[0].video[i]?.video?.url);
            await axios_1.default.get(`${youtube_url}?part=snippet&key=${google_api_key}&id=${video_id}`).then((res) => {
                let path = res?.data?.items[0]?.snippet?.thumbnails;
                data_response.push({
                    ...fav_video[0].video[i],
                    thumbnail: path?.maxres == undefined ? path?.standard?.url : path?.maxres?.url,
                });
            });
        }
        response.fav_video = data_response || [];
        response.state = {
            page, limit,
            page_limit: Math.ceil(fav_video[0]?.video_count[0]?.count / limit)
        };
        res.status(200).json(new common_1.apiResponse(200, `Get fav book successfully`, response));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal Server error', error));
    }
};
exports.get_filter_favorite = get_filter_favorite;
//# sourceMappingURL=favorite.js.map