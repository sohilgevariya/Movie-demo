"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_message = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const response_1 = require("../../helpers/response");
const ObjectId = require('mongoose').Types.ObjectId;
const get_message = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let user = req.header('user'), { roomId } = req.query;
    try {
        let response = await database_1.messageModel.aggregate([
            { $match: { roomId: ObjectId(roomId), isActive: true } },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    user: 1, message: 1, senderId: 1, receiverId: 1, createdAt: 1
                }
            }
        ]);
        return res.status(200).json(new common_1.apiResponse(200, response_1.responseMessage?.getDataSuccess('message by roomId'), response));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, response_1.responseMessage?.internalServerError, {}));
    }
};
exports.get_message = get_message;
//# sourceMappingURL=message.js.map