"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_bus_1 = require("@azure/service-bus");
const services_1 = require("../services/services");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING || "";
const queueName = process.env.QUEUE_NAME || "";
function processMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        const sbClient = new service_bus_1.ServiceBusClient(connectionString);
        const receiver = sbClient.createReceiver(queueName);
        try {
            const messageHandler = (messageReceived) => __awaiter(this, void 0, void 0, function* () {
                console.log('Message Received:', messageReceived.body);
                // Process the message here
                yield (0, services_1.greetingService)(messageReceived.body);
                // Complete the message after processing
                yield receiver.completeMessage(messageReceived);
            });
            const errorHandler = (error) => __awaiter(this, void 0, void 0, function* () {
                console.log('Error receiving message:', error);
                // Handle error, maybe log it or retry logic
            });
            // Subscribe to the queue to start receiving messages
            receiver.subscribe({
                processMessage: messageHandler,
                processError: errorHandler,
            });
        }
        catch (error) {
            console.log('Error in message processing:', error);
        }
    });
}
processMessages().catch((err) => {
    console.log('Error running message receiver: ', err);
});
