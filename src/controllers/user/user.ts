"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { userModel } from '../../database'
import { apiResponse } from '../../common'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'
import { Request, response, Response } from 'express'
import async from 'async'
import { isDate } from 'moment'

const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.get('jwt_token_secret')
const refresh_jwt_token_secret = config.get('refresh_jwt_token_secret')

export const signUp = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let body = req.body
        let isAlready: any = await userModel.findOne({ email: body?.email, isActive: true })
        if (isAlready) return res.status(409).json(new apiResponse(409, 'email already registered!', {}))
        const salt = await bcryptjs.genSaltSync(8)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        body.password = hashPassword
        let addUser = await new userModel(body).save()
        const token = jwt.sign({
            _id: addUser._id,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)
        let response = {
            _id: addUser?._id,
            name: addUser?.name,
            email: addUser?.email,
            token
        }
        return res.status(200).json(new apiResponse(200, "signup successfully!", response))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}))
    }
}

export const login = async (req: Request, res: Response) => {
    let body = req.body,
        response: any
    reqInfo(req)
    try {
        response = await userModel.findOne({ email: body.email, isActive: true }).select('-__v -createdAt -updatedAt')
        if (!response) return res.status(400).json(new apiResponse(400, 'invalid email or password', {}))
        const passwordMatch = await bcryptjs.compare(body.password, response.password)
        if (!passwordMatch) return res.status(400).json(new apiResponse(400, 'invalid email or password', {}))
        const token = jwt.sign({
            _id: response._id,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)
        response = {
            _id: response?._id,
            name: response?.name,
            email: response?.email,
            token
        }
        return res.status(200).json(new apiResponse(200, 'Login successfully', response))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}))
    }
}