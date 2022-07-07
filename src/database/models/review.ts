import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "movieModel" },
    rating: { type: Number, default: 0 },
    comment: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" }
}, { timestamps: true })

export const reviewModel = mongoose.model('review', reviewSchema)