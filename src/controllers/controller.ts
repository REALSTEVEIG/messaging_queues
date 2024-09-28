import { Request, Response } from 'express';
import { exampleService } from '../services/services';
import { sendMessageToQueue } from '../util/queueSender';

const exampleController = async (req: Request, res: Response) => {
    try {
        const result = await exampleService();
        res.status(200).json({
            message: 'Success',
            data: result,
        });
    } catch (error) {
        console.error('Error in exampleController:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error,
        });
    }
};

const greetingsController = async (req: Request, res: Response) => {
    try {
        const name = 'Sarah';
        await sendMessageToQueue(name);
        res.status(200).json({
            message: 'Your request is being processed. Thank you for your greeting.',
        });
    } catch (error) {
        console.error('Error in greetingsController:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error,
        });
    }
};

export { exampleController, greetingsController };
