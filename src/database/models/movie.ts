import mongoose from 'mongoose'

const movieSchema: any = new mongoose.Schema({
    name: { type: String, default: null },
    genre: { type: Array, default: [] },
    details: { type: String, default: null },
    releaseDate: { type: Date },
    rating: { type: Number, default: 0 },
    totalRating: { type: Number, default: 0, min: 0 },
    upVote: { type: Number, default: 0, min: 0 },
    downVote: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true }
)

export const movieModel = mongoose.model('movie', movieSchema);