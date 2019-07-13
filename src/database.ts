import * as firebase from 'firebase-admin';
import { firebase_config } from './preStartConfig';

const app = firebase.initializeApp({
  credential: firebase.credential.cert(firebase_config),
  databaseURL: 'https://sometimes-helpful.firebaseio.com',
});

const db = app.firestore();

export const addEvent = async (args: { message_id: string, channel_id: string, title: string; }) => db
  .collection('events')
  .add({
    message_id: args.message_id,
    channel_id: args.channel_id,
    title: args.title,
  });

export const getEvent = async (args: { message_id: string, channel_id: string }) => db
  .collection('events')
  .where('message_id', '==', args.message_id)
  .where('channel_id', '==', args.channel_id)
  .get().then((snapshot) => {
    if (snapshot.size === 0) {
      throw new Error(`Unable to find event with message_id = ${args.message_id} & channel_id = ${args.channel_id}`);
    }
    return snapshot.docs[0].data() as {
      message_id: string;
      channel_id: string;
      title: string;
    };
});

export const getAllEventInChannel = async (args: { channel_id: string }) => db
  .collection('events')
  .where('channel_id', '==', args.channel_id)
  .get().then((snapshot) => {
    if (snapshot.size === 0) {
      return [];
    }
    return snapshot.docs.map((v) => v.data() as {
      message_id: string;
      channel_id: string;
      title: string;
    });
  });

export const getAllEvents = async () => db
  .collection('events')
  .get().then((snapshot) =>
    snapshot.docs.map((v) => v.data() as {
      message_id: string;
      channel_id: string;
      title: string;
    }),
  );

export const addParticipant = async (args: {
    event_id: string, username: string, attendance: 'yes' | 'no' | 'maybe',
  }) => db.collection('participants').add({
    attendance: args.attendance,
    username: args.username,
    event_id: args.event_id,
  });

export const updateAttendance = async (args: {
  newAttendance: 'yes' | 'no' | 'maybe', event_id: string, username: string,
}) => {
  const docID = await db.collection('participants')
    .where('event_id', '==', args.event_id)
    .where('username', '==', args.username)
    .limit(1).get().then((snapshot) => snapshot.docs[0].id);

  return db.collection('participants').doc(docID).set({
    attendance: args.newAttendance,
    username: args.username,
    event_id: args.event_id,
  });
};

export const getParticipants = async (args: { message_id: string }) => db
  .collection('participants')
  .get().then((snapshot) =>
    snapshot.docs.map((v) => v.data() as {
      attendance: 'yes' | 'no' | 'maybe';
      username: string;
      event_id: string;
    }),
  );