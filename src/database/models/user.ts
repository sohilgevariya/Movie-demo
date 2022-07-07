const mongoose = require('mongoose')

const userSchema: any = new mongoose.Schema({
    name: { type: String, default: null },
    email: { type: String, default: null },
    password: { type: String, default: null },
    isActive: { type: Boolean, default: true },
}, { timestamps: true }
)

export const userModel = mongoose.model('user', userSchema);