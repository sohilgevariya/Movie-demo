"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upvoteModel = void 0;
var mongoose = require('mongoose');
// import mongoose from 'mongoose'
const upvoteSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
    movieId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });
exports.upvoteModel = mongoose.model('upvote', upvoteSchema);
//# sourceMappingURL=upvote.js.map