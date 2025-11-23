const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();

// Send notification when a new vocabulary word is added
exports.sendNewWordNotification = onDocumentCreated("vocabularies/{docId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        return;
    }

    const newWord = snapshot.data();
    const word = newWord.english;
    const meaning = newWord.bangla;

    // Get all user tokens
    // Note: For production with many users, consider using FCM Topics
    const usersSnapshot = await admin.firestore().collection('users').where('fcmToken', '!=', null).get();

    const tokens = [];
    usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.fcmToken) {
            tokens.push(data.fcmToken);
        }
    });

    if (tokens.length === 0) {
        logger.log("No tokens found");
        return;
    }

    const message = {
        notification: {
            title: 'New Word Added! 🆕',
            body: `Learn "${word}" (${meaning}) today!`,
        },
        tokens: tokens,
        webpush: {
            fcmOptions: {
                link: `/vocabularies/${event.params.docId}`
            }
        }
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        logger.log(response.successCount + ' messages were sent successfully');
    } catch (error) {
        logger.error('Error sending message:', error);
    }
});

// Send daily vocabulary reminder at 9:00 AM
exports.dailyVocabulary = onSchedule("every day 09:00", async (event) => {
    // Get a random word or a specific word of the day
    // For simplicity, let's just get the most recent one or a random one
    const vocabSnapshot = await admin.firestore().collection('vocabularies').limit(1).get();

    if (vocabSnapshot.empty) {
        return;
    }

    const vocab = vocabSnapshot.docs[0].data();

    const usersSnapshot = await admin.firestore().collection('users').where('fcmToken', '!=', null).get();
    const tokens = usersSnapshot.docs.map(doc => doc.data().fcmToken).filter(t => t);

    if (tokens.length === 0) return;

    const message = {
        notification: {
            title: 'Daily Vocabulary 📚',
            body: `Time to practice! Review "${vocab.english}" and others.`,
        },
        tokens: tokens,
        webpush: {
            fcmOptions: {
                link: '/vocabularies'
            }
        }
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        logger.log('Daily notifications sent:', response.successCount);
    } catch (error) {
        logger.error('Error sending daily notifications:', error);
    }
});
