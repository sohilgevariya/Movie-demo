import express from 'express'
import { adminController } from '../controllers'
import { movieValidation, userValidation } from '../validation'
const router = express.Router()

//--------- movie Routes --------
router.get('/movie', adminController.get_movie)
router.post('/movie/add', movieValidation.add_movie, adminController.add_movie)
router.put('/movie/update', movieValidation.update_movie, adminController.update_movie)
router.get('/movie/:id', movieValidation.by_id, adminController.movie_by_id)
router.delete('/movie/:id', movieValidation.by_id, adminController.delete_movie)

export const adminRouter = router