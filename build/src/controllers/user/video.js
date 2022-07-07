"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_all_video_pagination = exports.get_all_video = exports.video_by_id_detail = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("config"));
const get_youtube_id_1 = __importDefault(require("get-youtube-id"));
const helpers_1 = require("../../helpers");
const axios_1 = __importDefault(require("axios"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const google_api_key = config_1.default.get("google_api_key");
const youtube_url = config_1.default.get("youtube_url");
const video_by_id_detail = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { id } = req.params;
    let user = req.header("user");
    try {
        let response = await database_1.videoModel.aggregate([
            { $match: { _id: ObjectId(id), isActive: true } },
            {
                $lookup: {
                    from: "favorites",
                    let: { videoId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$videoId", "$$videoId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "favoriteBy",
                },
            },
            {
                $project: {
                    title: 1,
                    url: 1,
                    description: 1,
                    isPremium: 1,
                    isFavorite: {
                        $cond: {
                            if: { $in: [ObjectId(user?._id), "$favoriteBy.userId"] },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
        ]);
        if (response) {
            let video_id = (0, get_youtube_id_1.default)(response[0]?.url);
            let getThumbnail = await axios_1.default
                .get(`${youtube_url}?part=snippet&key=${google_api_key}&id=${video_id}`)
                .then((result) => {
                return result.data;
            })
                .catch((error) => {
                return false;
            });
            response[0].thumbnail =
                getThumbnail?.items[0]?.snippet?.thumbnails?.maxres == undefined ? getThumbnail?.items[0]?.snippet?.thumbnails?.standard?.url : getThumbnail?.items[0]?.snippet?.thumbnails?.maxres?.url;
            return res
                .status(200)
                .json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("video"), response));
        }
        else
            return res
                .status(400)
                .json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound("video"), {}));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.video_by_id_detail = video_by_id_detail;
const get_all_video = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header("user");
    try {
        let response = await database_1.videoModel.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: "favorites",
                    let: { videoId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$videoId", "$$videoId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "favoriteBy",
                },
            },
            {
                $project: {
                    title: 1,
                    url: 1,
                    description: 1,
                    isPremium: 1,
                    isFavorite: {
                        $cond: {
                            if: { $in: [ObjectId(user?._id), "$favoriteBy.userId"] },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
        if (response) {
            let data_response = [];
            for (let i = 0; i < response.length; i++) {
                let video_id = (0, get_youtube_id_1.default)(response[i]?.url);
                await axios_1.default.get(`${youtube_url}?part=snippet&key=${google_api_key}&id=${video_id}`).then((res) => {
                    let path = res?.data?.items[0]?.snippet?.thumbnails;
                    data_response.push({
                        ...response[i],
                        thumbnail: path?.maxres == undefined ? path?.standard?.url : path?.maxres?.url,
                    });
                });
            }
            return res
                .status(200)
                .json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("video"), data_response));
        }
        else
            return res
                .status(400)
                .json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound("video"), {}));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.get_all_video = get_all_video;
const get_all_video_pagination = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header("user");
    let response, { page, limit, search } = req.body, match = {};
    try {
        // if (search) {
        //     var titleArray: Array<any> = []
        //     search = search.split(" ")
        //     search.forEach(data => {
        //         titleArray.push({ title: { $regex: data, $options: 'si' } })
        //     })
        //     match.$or = [{ $and: titleArray }]
        // }
        match.isActive = true;
        response = await database_1.videoModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "favorites",
                    let: { videoId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$videoId", "$$videoId"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "favoriteBy",
                },
            },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: ((page - 1) * limit) },
                        { $limit: limit },
                        {
                            $project: {
                                title: 1,
                                url: 1,
                                description: 1,
                                isPremium: 1,
                                isActive: 1,
                                createdAt: 1,
                                isFavorite: {
                                    $cond: {
                                        if: { $in: [ObjectId(user?._id), "$favoriteBy.userId"] },
                                        then: true,
                                        else: false,
                                    },
                                },
                            },
                        },
                    ],
                    data_count: [{ $count: "count" }],
                },
            },
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess("video"), {
            video_data: response[0]?.data,
            state: {
                page: req.body?.page,
                limit: req.body?.limit,
                page_limit: Math.ceil((response[0]?.data_count[0]?.count / req.body?.limit)) || 1,
            },
        }));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_all_video_pagination = get_all_video_pagination;
//# sourceMappingURL=video.js.map