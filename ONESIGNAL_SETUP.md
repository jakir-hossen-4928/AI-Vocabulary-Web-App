# OneSignal Push Notifications - Implementation Guide

## ✅ What Has Been Implemented

### 1. **OneSignal SDK Integration**
- ✅ Installed `react-onesignal` package
- ✅ Created `src/lib/onesignal.ts` with helper functions
- ✅ Created `public/OneSignalSDKWorker.js` (Critical for web push)
- ✅ Initialized OneSignal in `src/main.tsx` (runs on app load)
- ✅ Added environment variables support

### 2. **Notification Settings UI**
- ✅ Created `NotificationSettings` component
- ✅ Added to Profile page with beautiful UI
- ✅ Shows subscription status
- ✅ Lists notification benefits
- ✅ One-click enable button

### 3. **Features Included**
- ✅ Request notification permission
- ✅ Check subscription status
- ✅ Get user's OneSignal ID
- ✅ Send user tags for segmentation
- ✅ Localhost support for testing

---

## 🔧 Configuration

### Environment Variables (.env)
```env
VITE_ONE_SIGNEL_APP_ID=cd3b60cd-d929-45de-9fdd-b39de29fbee6
VITE_ONE_SIGNEL_API_KEY=os_v2_app_zu5wbtozffc55h65woo6fh564z5lbu3dasgexd42fxetkrx4ssadeqyxv647pmtoanewuhh4rf5pgm3ww65u52brnxtiyhoaoykgoaq
```

---

## 📱 How It Works

### For Users:
1. Go to **Profile page**
2. Scroll to **Notifications section**
3. Click **"Enable Notifications"**
4. Allow browser permission
5. Start receiving daily vocabulary updates!

### For You (Admin):
You can now send notifications in 3 ways:

#### Option 1: OneSignal Dashboard
1. Go to OneSignal dashboard
2. Click **Messages** → **New Push**
3. Write your message
4. Send to **All Users** or specific segments

#### Option 2: REST API (Manual)
```javascript
fetch("https://onesignal.com/api/v1/notifications", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Basic YOUR-REST-API-KEY"
  },
  body: JSON.stringify({
    app_id: "cd3b60cd-d929-45de-9fdd-b39de29fbee6",
    headings: { en: "Word of the Day" },
    contents: { en: "Eloquent → বাকপটু\nExample: He gave an eloquent speech." },
    included_segments: ["All"]
  })
});
```

#### Option 3: n8n Automation (Recommended)
See the n8n workflow section below.

---

## 🤖 n8n Workflow for Automated Daily Notifications

### Workflow Overview:
```
Cron (Daily 9 AM)
    ↓
Firestore: Get Random Vocabulary
    ↓
Function: Format Notification
    ↓
HTTP Request: Send via OneSignal
    ↓
Users receive notification
```

### Step-by-Step n8n Setup:

#### Node 1: Cron Trigger
- **Trigger**: Schedule
- **Mode**: Every day
- **Hour**: 9
- **Minute**: 0

#### Node 2: Firestore (Get Vocabularies)
- **Operation**: Get Many
- **Collection**: `vocabularies`
- **Limit**: 100 (or all)

#### Node 3: Function (Pick Random Word)
```javascript
const items = $input.all();
const randomIndex = Math.floor(Math.random() * items.length);
return [items[randomIndex]];
```

#### Node 4: Function (Format Notification)
```javascript
const word = $json.word;
const meaning = $json.meaning_bn || $json.meaning;
const example = $json.example || "";
const pos = $json.pos || "";

return [{
  json: {
    app_id: "cd3b60cd-d929-45de-9fdd-b39de29fbee6",
    headings: { en: "📚 Word of the Day" },
    contents: {
      en: `${word} (${pos})\n→ ${meaning}\n\nExample: ${example}`
    },
    included_segments: ["All"],
    data: {
      word: word,
      url: `https://your-domain.com/?search=${word}`
    }
  }
}];
```

#### Node 5: HTTP Request (Send to OneSignal)
- **Method**: POST
- **URL**: `https://onesignal.com/api/v1/notifications`
- **Authentication**: None
- **Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Basic os_v2_app_zu5wbtozffc55h65woo6fh564z5lbu3dasgexd42fxetkrx4ssadeqyxv647pmtoanewuhh4rf5pgm3ww65u52brnxtiyhoaoykgoaq"
  }
  ```
- **Body Type**: JSON
- **Body**: `{{ $json }}`

---

## 🎯 Notification Examples

### Word of the Day
```
📚 Word of the Day
Sublime (adjective)
→ মহিমান্বিত

Example: His writing is simply sublime.
```

### Daily Reminder
```
🎯 Time to Learn!
Come learn 5 new vocabulary words today!
```

### Example Sentences
```
💡 Usage Tip
Learn how to use "Benevolent" in real sentences.
```

---

## 🔐 Security Notes

1. **API Key**: Your REST API key is in `.env` (gitignored)
2. **App ID**: Public (safe to expose in frontend)
3. **User Privacy**: OneSignal handles user data securely
4. **HTTPS Required**: For production (localhost OK for dev)

---

## 🧪 Testing

### Test Locally:
1. Run your dev server: `npm run dev`
2. Open `http://localhost:5173`
3. Go to Profile → Enable Notifications
4. Send a test notification from OneSignal dashboard

### Test Notification:
```bash
curl -X POST https://onesignal.com/api/v1/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YOUR-API-KEY" \
  -d '{
    "app_id": "cd3b60cd-d929-45de-9fdd-b39de29fbee6",
    "headings": {"en": "Test"},
    "contents": {"en": "This is a test notification!"},
    "included_segments": ["All"]
  }'
```

---

## 📊 User Segmentation (Advanced)

You can tag users for targeted notifications:

```typescript
import { sendTag, sendTags } from "@/lib/onesignal";

// Single tag
await sendTag("difficulty", "advanced");

// Multiple tags
await sendTags({
  difficulty: "advanced",
  language: "bengali",
  learning_streak: "7_days"
});
```

Then in OneSignal, send to specific segments:
- Users with tag `difficulty = advanced`
- Users with tag `learning_streak = 7_days`

---

## 🚀 Next Steps

### Immediate:
1. ✅ Test notifications on your device
2. ✅ Set up n8n workflow for daily automation
3. ✅ Customize notification messages

### Future Enhancements:
- 📊 Track notification click rates
- 🎯 Personalized notifications based on user level
- 📅 Weekly vocabulary summary
- 🏆 Achievement notifications
- 📈 Learning streak reminders

---

## 📝 Files Modified/Created

### Created:
- `src/lib/onesignal.ts` - OneSignal helper functions
- `src/components/NotificationSettings.tsx` - UI component

### Modified:
- `src/main.tsx` - Initialize OneSignal
- `src/pages/Profile.tsx` - Added notification settings
- `package.json` - Added react-onesignal dependency

---

## 🆘 Troubleshooting

### Notifications not working?
1. Check browser permissions (allow notifications)
2. Verify HTTPS (or localhost)
3. Check OneSignal dashboard for subscribers
4. Test with OneSignal's test notification feature

### Can't see the enable button?
1. Clear browser cache
2. Check if already subscribed
3. Try in incognito mode

### n8n workflow not sending?
1. Verify API key in HTTP request headers
2. Check Firestore connection
3. Test each node individually
4. Check n8n execution logs

---

## 📚 Resources

- [OneSignal Documentation](https://documentation.onesignal.com/docs/web-push-quickstart)
- [OneSignal REST API](https://documentation.onesignal.com/reference/create-notification)
- [n8n Documentation](https://docs.n8n.io/)

---

## ✨ Summary

You now have a complete push notification system that:
- ✅ Allows users to subscribe from Profile page
- ✅ Can send notifications manually or automatically
- ✅ Supports user segmentation
- ✅ Works on Chrome, Edge, Firefox, and PWA
- ✅ Ready for daily vocabulary automation

**Ready to send your first notification!** 🎉
