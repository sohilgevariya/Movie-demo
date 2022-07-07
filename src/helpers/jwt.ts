import jwt from 'jsonwebtoken'
import config from 'config'
import { userModel } from '../database'
import mongoose from 'mongoose'
import { apiResponse, } from '../common'
import { Request, Response } from 'express'

const ObjectId = mongoose.Types.ObjectId
const jwt_token_secret = config.get('jwt_token_secret')

export const userJWT = async (req: Request, res: Response, next) => {
    let { authorization, userType } = req.headers,
        result: any
    if (authorization) {
        try {
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
            result = await userModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
            if (result?.isBlock == true) return res.status(403).json(new apiResponse(403, 'Your account han been blocked.', {}));
            if (result?.isActive == true) {
                req.headers.user = result
                return next()
            } else {
                return res.status(401).json(new apiResponse(401, "Invalid-Token", {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, `Don't try different one token`, {}))
            console.log(err)
            return res.status(401).json(new apiResponse(401, "Invalid Token", {}))
        }
    } else {
        return res.status(401).json(new apiResponse(401, "Token not found in header", {}))
    }
}

export const partial_userJWT = async (req: Request, res: Response, next) => {
    let { authorization, userType } = req.headers,
        result: any
    if (!authorization) {
        next()
    } else {
        try {
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
            result = await userModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
            if (result.isActive == true) {
                // Set in Header Decode Token Information
                req.headers.user = isVerifyToken
                return next()
            } else {
                return res.status(401).json(new apiResponse(401, "Invalid-Token", {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, `Don't try different one token`, {}))
            if (err.message === "jwt must be provided") return res.status(403).json(new apiResponse(403, `Token not found in header`, {}))

            console.log(err)
            return res.status(401).json(new apiResponse(401, "Invalid Token", {}))
        }
    }
}