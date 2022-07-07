"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const movieSchema = new mongoose_1.default.Schema({
    name: { type: String, default: null },
    genre: { type: Array, default: [] },
    details: { type: String, default: null },
    releaseDate: { type: Date },
    rating: { type: Number, default: 0 },
    totalRating: { type: Number, default: 0, min: 0 },
    upVote: { type: Number, default: 0, min: 0 },
    downVote: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
exports.movieModel = mongoose_1.default.model('movie', movieSchema);
//# sourceMappingURL=movie.js.map