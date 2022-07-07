"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { movieModel } from '../../database'
import { apiResponse, } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'

const ObjectId = mongoose.Types.ObjectId

export const add_movie = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        search = new RegExp(`^${body.name}$`, "ig")
    try {
        let isExist = await movieModel.findOne({ name: { $regex: search }, isActive: true })
        if (isExist) {
            return res.status(409).json(new apiResponse(409, 'Movie data already exist!', {}))
        }
        let response = await new movieModel(body).save()
        if (response) return res.status(200).json(new apiResponse(200, 'Movie successfully added!', response))
        else return res.status(400).json(new apiResponse(400, 'Oops! Something went wrong!', {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', error))
    }
}

export const update_movie = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        movieId = body?.movieId
    try {
        delete body?.movieId
        let response = await movieModel.findOneAndUpdate({ _id: ObjectId(movieId), isActive: true }, body)
        if (response) {
            return res.status(200).json(new apiResponse(200, 'Movie successfully updated!', {}))
        }
        else return res.status(400).json(new apiResponse(400, 'Movie data not found!', {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', error))
    }
}

export const movie_by_id = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params
    try {
        let response = await movieModel.findOne({ _id: ObjectId(id), isActive: true }, { name: 1, genre: 1, details: 1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Movie successfully retrieved!', response))
        else return res.status(400).json(new apiResponse(400, 'Movie not found!', {},))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal server error', error))
    }
}

export const get_movie = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await movieModel.find({ isActive: true }, { name: 1, genre: 1, details: 1 }).sort({ createdAt: -1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Movies successfully retrieved!', response))
        else return res.status(400).json(new apiResponse(400, 'Movies not found!', {},))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', error))
    }
}

export const delete_movie = async (req: Request, res: Response) => {
    reqInfo(req)
    let id = req.params.id
    try {
        let response = await movieModel.findByIdAndDelete({ _id: ObjectId(id) })
        if (response) {
            return res.status(200).json(new apiResponse(200, 'Movie has been successfully deleted!', response))
        }
        else return res.status(400).json(new apiResponse(400, 'Movies not found!', {},))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, 'Internal server error', error))
    }
}