"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { movieModel, reviewModel } from '../../database'
import { apiResponse, } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId

export const add_review = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    try {
        let isAlreadyFeedback = await reviewModel.findOne({ createdBy: ObjectId(user._id), movieId: ObjectId(body?.movieId), isActive: true })
        if (isAlreadyFeedback) {
            let movie_data: any = await movieModel.findOne({ _id: ObjectId(body?.movieId), isActive: true })
            if (movie_data) {
                await movieModel.findOneAndUpdate({ _id: ObjectId(movie_data?._id), isActive: true }, {
                    rating: ((((movie_data?.totalRating * movie_data?.rating) - isAlreadyFeedback?.rating) + body?.rating) / movie_data?.totalRating)
                })
            }
            let response = await reviewModel.findOneAndUpdate({ movieId: ObjectId(body?.movieId) }, body, { new: true })
            if (response) return res.status(200).json(new apiResponse(200, "review added successfully!", response));
            else return res.status(200).json(new apiResponse(200, "Data error", {}));
        } else {
            let movie_data: any = await movieModel.findOne({ _id: ObjectId(body?.movieId), isActive: true })
            if (movie_data) {
                await movieModel.findOneAndUpdate({ _id: ObjectId(movie_data?._id), isActive: true }, {
                    $inc: { totalRating: 1 },
                    rating: (((movie_data?.totalRating * movie_data?.rating) + body?.rating) / (movie_data?.totalRating + 1))
                })
            }
            let response = await new reviewModel(body).save()
            if (response) return res.status(200).json(new apiResponse(200, "review added successfully!", response));
            else return res.status(200).json(new apiResponse(200, "Data error", {}));
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}))
    }
}

export const get_review_by_movie = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    try {
        let response: any = await reviewModel.aggregate([
            { $match: { shopId: ObjectId(req.params.id), isActive: true } },
        ])
        if (response) return res.status(200).json(new apiResponse(200, "review data successfully", response));
        else return res.status(400).json(new apiResponse(400, "Data error", {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, "Internal server error", {}))
    }
}