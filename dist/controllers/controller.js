"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.greetingsController = exports.exampleController = void 0;
const services_1 = require("../services/services");
const queueSender_1 = require("../util/queueSender");
const exampleController = async (req, res) => {
    try {
        const result = await (0, services_1.exampleService)();
        res.status(200).json({
            message: 'Success',
            data: result,
        });
    }
    catch (error) {
        console.error('Error in exampleController:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error,
        });
    }
};
exports.exampleController = exampleController;
const greetingsController = async (req, res) => {
    try {
        const name = 'Stephen';
        await (0, queueSender_1.sendMessageToQueue)(name);
        res.status(200).json({
            message: 'Your request is being processed. Thank you for your greeting.',
        });
    }
    catch (error) {
        console.error('Error in greetingsController:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error,
        });
    }
};
exports.greetingsController = greetingsController;
