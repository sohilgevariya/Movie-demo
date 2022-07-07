"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    movieId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "movieModel" },
    rating: { type: Number, default: 0 },
    comment: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "userModel" }
}, { timestamps: true });
exports.reviewModel = mongoose_1.default.model('review', reviewSchema);
//# sourceMappingURL=review.js.map