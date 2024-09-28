"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToQueue = void 0;
const service_bus_1 = require("@azure/service-bus");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
const queueName = process.env.QUEUE_NAME;
async function sendMessageToQueue(messageBody) {
    const sbClient = new service_bus_1.ServiceBusClient(connectionString);
    const sender = sbClient.createSender(queueName);
    try {
        const message = {
            body: messageBody,
            contentType: "application/json",
        };
        await sender.sendMessages(message);
        console.log('Message sent to the Queue:', messageBody);
    }
    catch (error) {
        console.error('Error sending message:', error);
    }
    finally {
        await sender.close();
        await sbClient.close();
    }
}
exports.sendMessageToQueue = sendMessageToQueue;
