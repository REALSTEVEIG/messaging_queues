/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-console */
import '../../loadEnv';
import {
  ServiceBusAdministrationClient,
  ServiceBusClient,
  type ServiceBusMessage,
} from '@azure/service-bus';
// @ts-expect-error no-error
import * as config from '@config/index';

const {
  CONNECTION_STRING,
  CREATE_CALENDAR_TOPIC,
  UPDATE_CALENDAR_TOPIC,
  DELETE_CALENDAR_TOPIC,
  CREATE_EVENT_TOPIC,
  UPDATE_EVENT_TOPIC,
  DELETE_EVENT_TOPIC,
} = config.AZURE.QUEUE;

const sbAdminClient = new ServiceBusAdministrationClient(CONNECTION_STRING);

// Function to ensure the subscription exists
async function ensureSubscriptionExists(
  topic: string,
  subscription: string,
): Promise<void> {
  const subscriptionExists = await sbAdminClient.subscriptionExists(
    topic,
    subscription,
  );
  if (!subscriptionExists) {
    console.log(
      `Subscription ${subscription} does not exist on topic ${topic}, creating it...`,
    );
    await sbAdminClient.createSubscription(topic, subscription);
    console.log(`Subscription ${subscription} created on topic ${topic}.`);
  }
}

export async function sendCalendarMessagesToQueue(
  messageBody: any,
): Promise<any> {
  const { requestType } = messageBody;

  const topicMapping: Record<string, string> = {
    create_local_calendar: CREATE_CALENDAR_TOPIC,
    create_google_calendar: CREATE_CALENDAR_TOPIC,
    create_outlook_calendar: CREATE_CALENDAR_TOPIC,
    update_local_calendar: UPDATE_CALENDAR_TOPIC,
    update_google_calendar: UPDATE_CALENDAR_TOPIC,
    update_outlook_calendar: UPDATE_CALENDAR_TOPIC,
    delete_local_calendar: DELETE_CALENDAR_TOPIC,
    delete_google_calendar: DELETE_CALENDAR_TOPIC,
    delete_outlook_calendar: DELETE_CALENDAR_TOPIC,
    create_local_event: CREATE_EVENT_TOPIC,
    create_google_event: CREATE_EVENT_TOPIC,
    create_outlook_event: CREATE_EVENT_TOPIC,
    update_local_event: UPDATE_EVENT_TOPIC,
    update_google_event: UPDATE_EVENT_TOPIC,
    update_outlook_event: UPDATE_EVENT_TOPIC,
    delete_local_event: DELETE_EVENT_TOPIC,
    delete_google_event: DELETE_EVENT_TOPIC,
    delete_outlook_event: DELETE_EVENT_TOPIC,
  };

  const TOPIC_NAME = topicMapping[requestType];
  if (!TOPIC_NAME) {
    throw new Error(
      `Invalid requestType '${requestType}', no matching topic found.`,
    );
  }

  const action = requestType.split('_')[0];
  const entity = requestType.includes('event') ? 'event' : 'calendar';
  const subscriptionName = `${action}-${entity}-subscription`;

  await ensureSubscriptionExists(TOPIC_NAME, subscriptionName);

  const sbClient = new ServiceBusClient(CONNECTION_STRING);
  const sender = sbClient.createSender(TOPIC_NAME);

  try {
    const message: ServiceBusMessage = {
      body: messageBody,
      contentType: 'application/json',
      sessionId: 'default-session',
      messageId: `${Date.now()}`,
    };

    await sender.sendMessages(message);
    console.log('Message sent to topic:', messageBody);
  } catch (error) {
    console.error('Error sending message to topic:', error);
  } finally {
    await sender.close();
    await sbClient.close();
  }
}
