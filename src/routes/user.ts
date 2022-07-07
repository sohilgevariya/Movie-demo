import express from 'express'
import { userController } from '../controllers'
import { movieValidation, reviewValidation, userValidation } from '../validation'
import { partial_userJWT, userJWT } from '../helpers/jwt'
const router = express.Router()

// ------- User Routes ---------
router.post('/signup', userValidation.signup, userController.signUp)
router.post('/login', userValidation.login, userController.login)

router.use(partial_userJWT)

//--------- movie Routes --------
router.get('/movie', userController.get_movie)
router.get('/movie/:id', movieValidation.by_id, userController.movie_by_id)
router.get('/get_upvote_movie', userController.get_upvote_movie)
router.post('/get_movie_pagination', userController.get_movie_pagination)

router.use(userJWT)

router.post('/upVote_movie', movieValidation?.upVote_movie, userController.upvote_movie)
router.post('/downVote_movie', movieValidation?.downVote_movie, userController.downvote_movie)

// ------------  Feedback Routes -------------
router.post('/review/add', reviewValidation?.add_review, userController.add_review)
router.get('/review/:id', reviewValidation?.by_id, userController.get_review_by_movie)

export const userRouter = router