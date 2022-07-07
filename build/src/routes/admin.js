"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const validation_1 = require("../validation");
const router = express_1.default.Router();
//--------- movie Routes --------
router.get('/movie', controllers_1.adminController.get_movie);
router.post('/movie/add', validation_1.movieValidation.add_movie, controllers_1.adminController.add_movie);
router.put('/movie/update', validation_1.movieValidation.update_movie, controllers_1.adminController.update_movie);
router.get('/movie/:id', validation_1.movieValidation.by_id, controllers_1.adminController.movie_by_id);
router.delete('/movie/:id', validation_1.movieValidation.by_id, controllers_1.adminController.delete_movie);
exports.adminRouter = router;
//# sourceMappingURL=admin.js.map