/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-console */
import '../../loadEnv';
import {
  ServiceBusAdministrationClient,
  ServiceBusClient,
  type ProcessErrorArgs,
} from '@azure/service-bus';
// @ts-expect-error no-error
import * as config from '@config/index';
import {
  createCalendar,
  updateCalendar,
  deleteCalendar,
  // @ts-expect-error no-error
} from '@/services/calendars/calendars.service';
import {
  createCalendar as createGoogleCalendar,
  updateCalendar as updateGoogleCalendar,
  deleteCalendarById as deleteGoogleCalendar,
  createEvent as createGoogleEvent,
  updateEvent as updateGoogleEvent,
  deleteEvent as deleteGoogleEvent,
  // @ts-expect-error no-error
} from '@/services/marketplace/apps/google-calendar';
import {
  createCalendarService,
  updateCalendareService,
  deleteSingleCalendarServices,
  createCalendarEventsServices,
  updateSingleCalendarEventsServices,
  deleteSingleCalendarEventsServices,
  // @ts-expect-error no-error
} from '@/services/marketplace/apps/microsoft-outlook';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  // @ts-expect-error no-error
} from '@/services/events/event.service';

const {
  CONNECTION_STRING,
  CREATE_CALENDAR_TOPIC,
  UPDATE_CALENDAR_TOPIC,
  DELETE_CALENDAR_TOPIC,
  CREATE_EVENT_TOPIC,
  UPDATE_EVENT_TOPIC,
  DELETE_EVENT_TOPIC,
} = config.AZURE.QUEUE;

const sbClient = new ServiceBusClient(CONNECTION_STRING);
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

// Function to ensure all subscriptions exist before starting the receiver
async function setupSubscriptions(): Promise<void> {
  const subscriptions = [
    {
      topic: CREATE_CALENDAR_TOPIC,
      subscription: 'create-calendar-subscription',
    },
    {
      topic: UPDATE_CALENDAR_TOPIC,
      subscription: 'update-calendar-subscription',
    },
    {
      topic: DELETE_CALENDAR_TOPIC,
      subscription: 'delete-calendar-subscription',
    },
    { topic: CREATE_EVENT_TOPIC, subscription: 'create-event-subscription' },
    { topic: UPDATE_EVENT_TOPIC, subscription: 'update-event-subscription' },
    { topic: DELETE_EVENT_TOPIC, subscription: 'delete-event-subscription' },
  ];

  // Use Promise.all to ensure all subscriptions are created in parallel
  await Promise.all(
    subscriptions.map(async ({ topic, subscription }) =>
      ensureSubscriptionExists(topic, subscription),
    ),
  );
}

async function processMessages(): Promise<void> {
  console.log('Listening for Calendar and Event messages...');

  // Ensure all subscriptions exist before creating receivers
  await setupSubscriptions();

  const createCalendarReceiver = sbClient.createReceiver(
    CREATE_CALENDAR_TOPIC,
    'create-calendar-subscription',
  );
  const updateCalendarReceiver = sbClient.createReceiver(
    UPDATE_CALENDAR_TOPIC,
    'update-calendar-subscription',
  );
  const deleteCalendarReceiver = sbClient.createReceiver(
    DELETE_CALENDAR_TOPIC,
    'delete-calendar-subscription',
  );

  const createEventReceiver = sbClient.createReceiver(
    CREATE_EVENT_TOPIC,
    'create-event-subscription',
  );
  const updateEventReceiver = sbClient.createReceiver(
    UPDATE_EVENT_TOPIC,
    'update-event-subscription',
  );
  const deleteEventReceiver = sbClient.createReceiver(
    DELETE_EVENT_TOPIC,
    'delete-event-subscription',
  );

  // Message handler for calendar messages
  const handleCalendarMessage = async (messageReceived: any): Promise<void> => {
    try {
      const { requestType, userId } = messageReceived.body;
      switch (requestType) {
        case 'create_local_calendar':
          await createCalendar(messageReceived.body);
          break;
        case 'create_google_calendar':
          await createGoogleCalendar(
            messageReceived.body.email,
            messageReceived.body.data,
            messageReceived.body.user,
            userId,
          );
          break;
        case 'create_outlook_calendar':
          await createCalendarService(
            messageReceived.body.email,
            messageReceived.body.calendarName,
            messageReceived.body.req,
            messageReceived.body.user,
          );
          break;
        case 'update_local_calendar':
          await updateCalendar(
            messageReceived.body.eventPayload,
            messageReceived.body.calendarId,
            userId,
          );
          break;
        case 'update_google_calendar':
          await updateGoogleCalendar(
            messageReceived.body.calendarId,
            messageReceived.body.user,
            messageReceived.body.data,
            userId,
          );
          break;
        case 'update_outlook_calendar':
          await updateCalendareService(
            messageReceived.body.calendarId,
            messageReceived.body.req.body,
            messageReceived.body.req,
            messageReceived.body.user,
          );
          break;
        case 'delete_local_calendar':
          await deleteCalendar(
            messageReceived.body.calendarId,
            messageReceived.body.id,
          );
          break;
        case 'delete_google_calendar':
          await deleteGoogleCalendar(
            messageReceived.body.calendarId,
            messageReceived.body.user,
            userId,
          );
          break;
        case 'delete_outlook_calendar':
          await deleteSingleCalendarServices(
            messageReceived.body.calendarId,
            messageReceived.body.user,
            userId,
          );
          break;
        default:
          console.log('Unknown calendar requestType:', requestType);
      }

      await createCalendarReceiver.completeMessage(messageReceived);
      console.log(`Calendar message processed successfully`);
    } catch (error) {
      console.error(`Error processing calendar message: ${error}`);
    }
  };

  // Message handler for event messages
  const handleEventMessage = async (messageReceived: any): Promise<void> => {
    try {
      const { requestType, userId } = messageReceived.body;
      switch (requestType) {
        case 'create_local_event':
          await createEvent(
            messageReceived.body.calendarId,
            messageReceived.body.event,
            userId,
          );
          break;
        case 'create_google_event':
          await createGoogleEvent(
            messageReceived.body.calendarId,
            messageReceived.body.formattedRequest,
            messageReceived.body.user,
            userId,
          );
          break;
        case 'create_outlook_event':
          await createCalendarEventsServices(
            messageReceived.body.calendarId,
            messageReceived.body.formattedRequest,
            messageReceived.body.user,
            userId,
          );
          break;
        case 'update_local_event':
          await updateEvent(
            messageReceived.body.event,
            messageReceived.body.eventId,
            messageReceived.body.calendarId,
            userId,
            messageReceived.body.exceptionEventDate,
          );
          break;
        case 'update_google_event':
          await updateGoogleEvent(
            messageReceived.body.calendarId,
            messageReceived.body.eventId,
            messageReceived.body.eventUpdateRequest,
            messageReceived.body.user,
            messageReceived.body.recurringUpdateType,
            messageReceived.body.exceptionEventDate,
            userId,
          );
          break;
        case 'update_outlook_event':
          await updateSingleCalendarEventsServices(
            messageReceived.body.calendarId,
            messageReceived.body.eventId,
            messageReceived.body.formattedRequest,
            messageReceived.body.user,
            messageReceived.body.recurringUpdateType,
            messageReceived.body.exceptionEventDate,
            userId,
          );
          break;
        case 'delete_local_event':
          await deleteEvent(
            messageReceived.body.eventId,
            messageReceived.body.calendarId,
            messageReceived.body.deleteTypeString,
            messageReceived.body.exceptionEventDate,
            userId,
          );
          break;
        case 'delete_google_event':
          await deleteGoogleEvent(
            messageReceived.body.calendarId,
            messageReceived.body.eventId,
            messageReceived.body.user,
            messageReceived.body.deleteTypeString,
            messageReceived.body.exceptionEventDate,
            userId,
          );
          break;
        case 'delete_outlook_event':
          await deleteSingleCalendarEventsServices(
            messageReceived.body.calendarId,
            messageReceived.body.eventId,
            messageReceived.body.user,
            messageReceived.body.deleteTypeString,
            messageReceived.body.exceptionEventDate,
          );
          break;
        default:
          console.log('Unknown event requestType:', requestType);
      }

      await createEventReceiver.completeMessage(messageReceived);
      console.log(`Event message processed successfully`);
    } catch (error) {
      console.error(`Error processing event message: ${error}`);
    }
  };

  const errorHandler = async (error: ProcessErrorArgs): Promise<void> => {
    console.log('Error receiving message:', error);
  };

  // Subscribe to calendar topic messages
  createCalendarReceiver.subscribe(
    {
      processMessage: handleCalendarMessage,
      processError: errorHandler,
    },
    { autoCompleteMessages: false },
  );

  updateCalendarReceiver.subscribe(
    {
      processMessage: handleCalendarMessage,
      processError: errorHandler,
    },
    { autoCompleteMessages: false },
  );

  deleteCalendarReceiver.subscribe(
    {
      processMessage: handleCalendarMessage,
      processError: errorHandler,
    },
    { autoCompleteMessages: false },
  );

  // Subscribe to event topic messages
  createEventReceiver.subscribe(
    {
      processMessage: handleEventMessage,
      processError: errorHandler,
    },
    { autoCompleteMessages: false },
  );

  updateEventReceiver.subscribe(
    {
      processMessage: handleEventMessage,
      processError: errorHandler,
    },
    { autoCompleteMessages: false },
  );

  deleteEventReceiver.subscribe(
    {
      processMessage: handleEventMessage,
      processError: errorHandler,
    },
    { autoCompleteMessages: false },
  );
}

processMessages().catch((err) => {
  console.log('Error running message receiver:', err);
});
