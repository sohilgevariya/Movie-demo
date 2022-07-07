"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_1 = require("./user");
const admin_1 = require("./admin");
const router = (0, express_1.Router)();
exports.router = router;
router.use('/user', user_1.userRouter);
router.use('/admin', admin_1.adminRouter);
//# sourceMappingURL=index.js.map