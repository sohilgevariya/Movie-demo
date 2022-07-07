"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { userModel } from '../../database'
import { apiResponse, } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'

export const add_user = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        let isExist = await userModel.findOne({ email: body.email, isActive: true })
        if (isExist) {
            return res.status(409).json(new apiResponse(409, 'user data already exist!', {}))
        }
        let response = await new userModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'User successfully added!', response))
        else return res.status(400).json(new apiResponse(400, 'Oops! Something went wrong!', {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', error))
    }
}