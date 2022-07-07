"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.add_user = void 0;
const winston_logger_1 = require("../../helpers/winston_logger");
const database_1 = require("../../database");
const common_1 = require("../../common");
const add_user = async (req, res) => {
    (0, winston_logger_1.reqInfo)(req);
    let body = req.body;
    try {
        let isExist = await database_1.userModel.findOne({ email: body.email, isActive: true });
        if (isExist) {
            return res.status(409).json(new common_1.apiResponse(409, 'user data already exist!', {}));
        }
        let response = await new database_1.userModel(body).save();
        if (response)
            return res.status(200).json(new common_1.apiResponse(200, 'User successfully added!', response));
        else
            return res.status(400).json(new common_1.apiResponse(400, 'Oops! Something went wrong!', {}));
    }
    catch (error) {
        return res.status(500).json(new common_1.apiResponse(500, 'Internal server error', error));
    }
};
exports.add_user = add_user;
//# sourceMappingURL=user.js.map