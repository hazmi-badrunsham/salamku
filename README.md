# 💌 SalamKu

A simple anonymous message-sharing web app built with **React + Appwrite**.  
Send and receive heartfelt letters in a cozy, minimalist chat-style interface — complete with typewriter effects and a chill Spotify playlist in the background.

---

## 🌟 Features

- 💬 Real-time message exchange (powered by Appwrite)  
- ⌨️ Typewriter animation for received letters  
- 💾 Local progress saving using `localStorage`  
- 📬 Inbox to revisit your revealed letters  
- 🎧 Embedded Spotify playlist for background ambiance  

---

## ⚙️ Setup Instructions

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/salamku.git
cd salamku
npm install
```

### 2. Configure Appwrite

Create an `appwrite.js` file in the `src` folder with your Appwrite credentials:
```js
import { Client, Databases } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1") // Your Appwrite endpoint
  .setProject("YOUR_PROJECT_ID"); // Your project ID

export const databases = new Databases(client);
export const DATABASE_ID = "YOUR_DATABASE_ID";
export const COLLECTION_ID = "YOUR_COLLECTION_ID";
```

---

## 🗄️ Appwrite Database Management

### 1. Create a Database

In your Appwrite Console, go to:
```
Databases → Create Database
```

Give it a name (e.g., `salamku_db`).

### 2. Create a Collection

Inside your database, create a new collection (e.g., `letters`).

Then add the following attributes:

| Attribute | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| sender    | string | ✅ Yes   | The name or alias of sender    |
| message   | string | ✅ Yes   | The message content            |

### 3. Set Permissions

Under **Permissions**, enable:

- ✅ Create: Any
- ✅ Read: Any
- ✅ Update: Any
- ✅ Delete: Any

(You can later restrict these based on your desired anonymity rules.)

---

## 🚀 Run the App
```bash
npm run dev
```

---