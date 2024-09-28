import { ServiceBusClient, ServiceBusMessage } from "@azure/service-bus";
import dotenv from "dotenv";

dotenv.config();

const connectionString: string = process.env.SERVICE_BUS_CONNECTION_STRING!;
const queueName: string = process.env.QUEUE_NAME!;

export async function sendMessageToQueue(messageBody: any) {
    const sbClient = new ServiceBusClient(connectionString);
    const sender = sbClient.createSender(queueName);

    try {
        const message: ServiceBusMessage = {
            body: messageBody,
            contentType: "application/json",
        };

        await sender.sendMessages(message);
        console.log('Message sent to the Queue:', messageBody);
    } catch (error) {
        console.error('Error sending message:', error);
    } finally {
        await sender.close();
        await sbClient.close();
    }
}
