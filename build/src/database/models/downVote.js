"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downVoteModel = void 0;
var mongoose = require('mongoose');
// import mongoose from 'mongoose'
const downVoteSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
    movieId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });
exports.downVoteModel = mongoose.model('downVote', downVoteSchema);
//# sourceMappingURL=downVote.js.map