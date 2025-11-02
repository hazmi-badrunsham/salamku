# SalamKu

A simple  message-sharing web app built with **React + Appwrite**.  
Send and receive  letters in a retro pixel minimalist chat-style interface.

---

## 🌟 Features

- 💬 Real-time message exchange (powered by Appwrite)  
- ⌨️ Typewriter animation for received letters  
- 💾 Local progress saving using `localStorage`  
- 📬 Inbox to revisit your revealed letters
  
---

## ⚙️ Setup Instructions

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/salamku.git
cd salamku
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with your Appwrite credentials:
```properties
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_PROJECT_NAME=salamku
```

**Note:** Replace `your_project_id_here` with your actual Appwrite project ID.

### 3. Configure Appwrite

Create an `appwrite.js` file in the `src` folder:
```js
import { Client, Databases } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const DATABASE_ID = "YOUR_DATABASE_ID";
export const COLLECTION_ID = "YOUR_COLLECTION_ID";
```

**Note:** Replace `YOUR_DATABASE_ID` and `YOUR_COLLECTION_ID` with your actual IDs from Appwrite Console.

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
## 📸 Screenshot

![SalamKu Demo](https://imgur.com/a/UYlPw6R)
---
