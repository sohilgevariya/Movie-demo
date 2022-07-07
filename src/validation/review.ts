"use strict"
import * as Joi from 'joi'
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add_review = async (req: Request, res: Response, next) => {
    const schema = Joi.object({
        movieId: Joi.string().required().error(new Error('movieId is required!')),
        rating: Joi.number().error(new Error('rating is required!')),
        comment: Joi.string().error(new Error('comment is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const update_review = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        movieId: Joi.string().required().error(new Error('movieId is required!')),
        rating: Joi.number().error(new Error('rating is a number')),
        comment: Joi.string().error(new Error('comment is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, "Invalid id", {}));
    next()
}