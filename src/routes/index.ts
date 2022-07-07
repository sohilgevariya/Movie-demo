import { Request, Router, Response } from 'express'
import { userRouter } from './user'
import { adminRouter } from './admin'

const router = Router()

router.use('/user', userRouter)
router.use('/admin', adminRouter)

export { router }