"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { downVoteModel, movieModel, upvoteModel } from '../../database'
import { apiResponse, } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'

const ObjectId = mongoose.Types.ObjectId

export const movie_by_id = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params
    try {
        // let response = await movieModel.findOne({ _id: ObjectId(id), isActive: true }, { name: 1, genre: 1, details: 1, releaseDate: 1, rating: 1 })
        let response = await movieModel.aggregate([
            { $match: { _id: ObjectId(id), isActive: true } },
            {
                $lookup: {
                    from: "reviews",
                    let: { movieId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$movieId", "$$movieId"] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "reviews"
                }
            }
        ])
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
        let response = await movieModel.find({ isActive: true }, { name: 1, genre: 1, details: 1, releaseDate: 1 }).sort({ releaseDate: -1 })
        if (response) return res.status(200).json(new apiResponse(200, 'Movies successfully retrieved!', response))
        else return res.status(400).json(new apiResponse(400, 'Movies not found!', {},))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', error))
    }
}

export const get_movie_pagination = async (req: Request, res: Response) => {
    reqInfo(req)
    let response: any, { page, limit, search, genre, releaseDate } = req.body, match: any = {},
        user: any = req.header('user')
    try {
        if (search) {
            var nameArray: Array<any> = []
            search = search.split(" ")
            search.forEach(data => {
                nameArray.push({ name: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: nameArray }]
        }
        match.isActive = true
        if (genre) match.genre = genre
        response = await movieModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "upvotes",
                    let: { movieId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$movieId", "$$movieId"] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "upvote"
                }
            },
            {
                $lookup: {
                    from: "downvotes",
                    let: { movieId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$movieId", "$$movieId"] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "downvote"
                }
            },
            {
                $facet: {
                    data: [
                        { $sort: { releaseDate: -1 } },
                        { $skip: (((page as number - 1) * limit as number)) },
                        { $limit: limit as number },
                        {
                            $project: {
                                name: 1, genre: 1, details: 1, releaseDate: 1, isActive: 1,
                                isUpvote: { $cond: { if: { $in: [ObjectId(user?._id), "$upvote.userId"] }, then: true, else: false } },
                                isDownVote: { $cond: { if: { $in: [ObjectId(user?._id), "$downvote.userId"] }, then: true, else: false } },
                            }
                        },
                    ],
                    data_count: [{ $count: "count" }]
                }
            },
        ])
        return res.status(200).json(new apiResponse(200, 'Movie successfully retrieved!', {
            movie_data: response[0]?.data,
            state: {
                page: req.body?.page,
                limit: req.body?.limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / (req.body?.limit) as number) || 1
            }
        }))
    } catch (error) {
        console.log(error);

        return res.status(500).json(new apiResponse(500, 'Internal server error', {}))
    }
}

export const upvote_movie = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    try {
        body.userId = user?._id
        let findData: any = await downVoteModel.findOne({ movieId: ObjectId(body.movieId), userId: ObjectId(user._id) })
        if (findData) {
            await downVoteModel.deleteOne({ userId: ObjectId(user._id), movieId: ObjectId(body.movieId) })
            await movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { downVote: -1 } })
        }
        let existData = await upvoteModel.findOne({ movieId: ObjectId(body.movieId), userId: ObjectId(user._id) })
        if (existData != null) {
            await upvoteModel.deleteOne({ userId: ObjectId(user._id), movieId: ObjectId(body.movieId) })
            await movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { upVote: -1 } })
            return res.status(200).json(new apiResponse(200, 'Movie successfully not upVoted!', {}))
        } else {
            let response: any = await new upvoteModel(body).save()
            await movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { upVote: 1 } })
            return res.status(200).json(new apiResponse(200, 'Movie successfully upVoted!', {}))
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', error))
    }
}

export const downvote_movie = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        user: any = req.header('user')
    try {
        body.userId = user?._id
        let findData: any = await upvoteModel.findOne({ movieId: ObjectId(body.movieId), userId: ObjectId(user._id) })
        if (findData) {
            await upvoteModel.deleteOne({ userId: ObjectId(user._id), movieId: ObjectId(body.movieId) })
            await movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { upVote: -1 } })
        }
        let existData = await downVoteModel.findOne({ movieId: ObjectId(body.movieId), userId: ObjectId(user._id) })
        if (existData != null) {
            await downVoteModel.deleteOne({ userId: ObjectId(user._id), movieId: ObjectId(body.movieId) })
            await movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { downVote: -1 } })
            return res.status(200).json(new apiResponse(200, 'Movie successfully not downVoted!', {}))
        } else {
            let response: any = await new downVoteModel(body).save()
            await movieModel.findOneAndUpdate({ _id: ObjectId(body.movieId), isActive: true }, { $inc: { downVote: 1 } })
            return res.status(200).json(new apiResponse(200, 'Movie successfully downVoted!', {}))
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, 'Internal server error', error))
    }
}

export const get_upvote_movie = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response = await movieModel.aggregate([
            { $match: { isActive: true } },
            { $sort: { upVote: -1 } },
            { $limit: 10 }
        ])
        return res.status(200).json(new apiResponse(200, 'Movie successfully fetched!', response))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal server error', {}))
    }
}