"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../controllers/controller");
const router = (0, express_1.Router)();
router.get('/example', controller_1.exampleController);
router.get('/greetings', controller_1.greetingsController);
exports.default = router;
