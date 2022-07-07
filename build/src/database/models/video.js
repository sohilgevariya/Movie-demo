"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoModel = void 0;
const mongoose = require('mongoose');
const videoSchema = new mongoose.Schema({
    title: { type: String, default: null },
    url: { type: String, default: null, },
    description: { type: String, default: null },
    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.videoModel = mongoose.model('video', videoSchema);
//# sourceMappingURL=video.js.map