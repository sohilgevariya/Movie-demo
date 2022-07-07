"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, default: true },
    senderId: { type: mongoose_1.default.Schema.Types.ObjectId, default: null },
    receiverId: { type: mongoose_1.default.Schema.Types.ObjectId, default: null },
    roomId: { type: mongoose_1.default.Schema.Types.ObjectId, default: null },
    message: { type: String, default: null },
}, { timestamps: true });
exports.messageModel = mongoose_1.default.model('message', messageSchema);
//# sourceMappingURL=message.js.map