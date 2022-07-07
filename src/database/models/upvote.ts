var mongoose = require('mongoose')
// import mongoose from 'mongoose'
const upvoteSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
    movieId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const upvoteModel = mongoose.model('upvote', upvoteSchema)