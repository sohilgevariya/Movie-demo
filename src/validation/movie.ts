"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'

export const add_movie = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        name: Joi.string().required().error(new Error('name is required!')),
        genre: Joi.array().required().error(new Error('genre is required!')),
        details: Joi.string().required().error(new Error('details is required!')),
        releaseDate: Joi.string().required().error(new Error('releaseDate is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const update_movie = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        movieId: Joi.string().required().error(new Error('movieId is required!')),
        name: Joi.string().error(new Error('name is string!')),
        genre: Joi.array().error(new Error('genre is array!')),
        details: Joi.string().error(new Error('details is string!')),
        releaseDate: Joi.string().error(new Error('releaseDate is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result?.movieId)) return res.status(400).json(new apiResponse(400, "movieId invalid !", {}))
        req.body = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, "Invalid id", {}));
    next()
}

export const upVote_movie = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        movieId: Joi.string().required().error(new Error('movieId is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result?.movieId)) return res.status(400).json(new apiResponse(400, "movieId invalid !", {}))
        req.body = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}

export const downVote_movie = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        movieId: Joi.string().required().error(new Error('movieId is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result?.movieId)) return res.status(400).json(new apiResponse(400, "movieId invalid !", {}))
        req.body = result
        return next()
    }).catch(error => { res.status(400).json(new apiResponse(400, error.message, {})) })
}