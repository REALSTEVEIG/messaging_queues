"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_bus_1 = require("@azure/service-bus");
const services_ts_1 = require("../services/services.ts");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING || "";
const queueName = process.env.QUEUE_NAME || "";
async function processMessages() {
    const sbClient = new service_bus_1.ServiceBusClient(connectionString);
    const receiver = sbClient.createReceiver(queueName);
    try {
        const messageHandler = async (messageReceived) => {
            console.log('Message Received:', messageReceived.body);
            // Process the message here
            await (0, services_ts_1.greetingService)(messageReceived.body);
            // Complete the message after processing
            await receiver.completeMessage(messageReceived);
        };
        const errorHandler = async (error) => {
            console.log('Error receiving message:', error);
            // Handle error, maybe log it or retry logic
        };
        // Subscribe to the queue to start receiving messages
        receiver.subscribe({
            processMessage: messageHandler,
            processError: errorHandler,
        });
    }
    catch (error) {
        console.log('Error in message processing:', error);
    }
}
processMessages().catch((err) => {
    console.log('Error running message receiver: ', err);
});
