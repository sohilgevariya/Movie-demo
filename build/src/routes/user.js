"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const validation_1 = require("../validation");
const jwt_1 = require("../helpers/jwt");
const router = express_1.default.Router();
// ------- User Routes ---------
router.post('/signup', validation_1.userValidation.signup, controllers_1.userController.signUp);
router.post('/login', validation_1.userValidation.login, controllers_1.userController.login);
router.use(jwt_1.partial_userJWT);
//--------- movie Routes --------
router.get('/movie', controllers_1.userController.get_movie);
router.get('/movie/:id', validation_1.movieValidation.by_id, controllers_1.userController.movie_by_id);
router.get('/get_upvote_movie', controllers_1.userController.get_upvote_movie);
router.post('/get_movie_pagination', controllers_1.userController.get_movie_pagination);
router.use(jwt_1.userJWT);
router.post('/upVote_movie', validation_1.movieValidation?.upVote_movie, controllers_1.userController.upvote_movie);
router.post('/downVote_movie', validation_1.movieValidation?.downVote_movie, controllers_1.userController.downvote_movie);
// ------------  Feedback Routes -------------
router.post('/review/add', validation_1.reviewValidation?.add_review, controllers_1.userController.add_review);
router.get('/review/:id', validation_1.reviewValidation?.by_id, controllers_1.userController.get_review_by_movie);
exports.userRouter = router;
//# sourceMappingURL=user.js.map