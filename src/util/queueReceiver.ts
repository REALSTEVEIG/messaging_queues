import { ServiceBusClient, ProcessErrorArgs } from "@azure/service-bus";
import { greetingService } from "../services/services";

import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING || "";
const queueName = process.env.QUEUE_NAME || "";

async function processMessages() {
    const sbClient = new ServiceBusClient(connectionString);
    const receiver = sbClient.createReceiver(queueName);

    try {
        const messageHandler = async (messageReceived: any) => {
            console.log('Message Received:', messageReceived.body);

            // Process the message here
            await greetingService(messageReceived.body);

            // Complete the message after processing
            await receiver.completeMessage(messageReceived);
        };

        const errorHandler = async (error: ProcessErrorArgs): Promise<void> => {
            console.log('Error receiving message:', error);
            // Handle error, maybe log it or retry logic
        };

        // Subscribe to the queue to start receiving messages
        receiver.subscribe({
            processMessage: messageHandler,
            processError: errorHandler,
        });

    } catch (error) {
        console.log('Error in message processing:', error);
    }
}

processMessages().catch((err) => {
    console.log('Error running message receiver: ', err);
});
