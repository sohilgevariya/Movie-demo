"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_video_pagination = exports.delete_video = exports.get_video = exports.video_by_id = exports.update_video = exports.add_video = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const helpers_1 = require("../../helpers");
const ObjectId = mongoose_1.default.Types.ObjectId;
const add_video = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, search = new RegExp(`^${body.title}$`, "ig");
    let user = req.header('user');
    body.createdBy = user?._id;
    try {
        let isExist = await database_1.videoModel.findOne({ title: { $regex: search }, isActive: true });
        if (isExist) {
            return res.status(409).json(new common_1.apiResponse(409, helpers_1.responseMessage?.dataAlreadyExist('video'), {}));
        }
        let response = await new database_1.videoModel(body).save();
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.addDataSuccess('video'), response));
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.addDataError, `${response}`));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.add_video = add_video;
const update_video = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body, videoId = body?.videoId, user = req.header('user');
    body.updatedBy = user?._id;
    try {
        delete body?.videoId;
        let response = await database_1.videoModel.findOneAndUpdate({ _id: ObjectId(videoId), isActive: true }, body);
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.updateDataSuccess('video'), {}));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('video'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.update_video = update_video;
const video_by_id = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let { id } = req.params;
    try {
        let response = await database_1.videoModel.findOne({ _id: ObjectId(id), isActive: true }, { title: 1, url: 1, description: 1, isPremium: 1 });
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess('video'), response));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('video'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.video_by_id = video_by_id;
const get_video = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    try {
        let response = await database_1.videoModel.find({ isActive: true }, { title: 1, url: 1, description: 1, isPremium: 1 }).sort({ createdAt: -1 });
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess('video'), response));
        else
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('video'), {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.get_video = get_video;
const delete_video = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let id = req.params.id;
    try {
        // let response = await videoModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isActive: false })
        let response = await database_1.videoModel.findByIdAndDelete({ _id: ObjectId(id) });
        if (response) {
            await database_1.favoriteModel.findOneAndDelete({ videoId: ObjectId(id), isActive: true });
            return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.deleteDataSuccess('video'), response));
        }
        else {
            return res.status(400).json(new common_1.apiResponse(400, helpers_1.responseMessage?.getDataNotFound('video'), {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, error));
    }
};
exports.delete_video = delete_video;
const get_video_pagination = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
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
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        { $project: { title: 1, url: 1, description: 1, isPremium: 1, isActive: 1, createdAt: 1 } },
                    ],
                    data_count: [{ $count: "count" }]
                }
            },
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helpers_1.responseMessage?.getDataSuccess('video'), {
            video_data: response[0]?.data,
            state: {
                page: req.body?.page,
                limit: req.body?.limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / (req.body?.limit)) || 1
            }
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helpers_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_video_pagination = get_video_pagination;
//# sourceMappingURL=video.js.map