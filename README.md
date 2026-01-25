# Expo Interview Todo App

A Task Management application built with Expo (React Native) for interview assessment purposes. The app demonstrates a **Service Layer architecture** designed to test code navigation skills.

## Tech Stack

- **Framework**: Expo (Managed Workflow) with React Native
- **Language**: TypeScript
- **Routing**: Expo Router (file-based navigation)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Firebase Firestore
- **Notifications**: Firebase Cloud Messaging (FCM)
- **State**: React Context + Custom Hooks

## Architecture

The app follows a **Service Layer pattern** for clear separation of concerns:

```
UI Component → Custom Hook → Service Layer → Firebase
```

### Key Design Points for Interview

| Question               | Location                                                      |
| ---------------------- | ------------------------------------------------------------- |
| Entry point            | `app/_layout.tsx`                                             |
| Framework recognition  | `app/` directory, `expo-router` imports                       |
| Libraries used         | `package.json`                                                |
| Route mounting         | `app/_layout.tsx` → `app/(tabs)/_layout.tsx`                  |
| Task details           | `app/task/[id].tsx`                                           |
| Data flow trace        | UI → `useTodoDetails` → `TodoService.getTodoById` → Firestore |
| Missing error handling | `src/services/todoService.ts` (no try/catch)                  |
| Exception handling     | `src/hooks/useTodos.ts` (try/catch blocks)                    |

## Project Structure

```
/
├── app/                          # Expo Router (File-based navigation)
│   ├── _layout.tsx               # Root layout - Entry point
│   ├── index.tsx                 # Login screen
│   ├── (tabs)/                   # Tab navigation (protected)
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── home.tsx              # Todo list dashboard
│   │   └── settings.tsx          # Settings/Profile
│   └── task/
│       └── [id].tsx              # Dynamic route - Task details
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── TaskCard.tsx
│   ├── services/                 # Firebase/API logic
│   │   ├── firebaseConfig.ts     # Firebase initialization
│   │   ├── todoService.ts        # Firestore CRUD operations
│   │   └── notificationService.ts # Push notifications
│   ├── hooks/                    # Custom React hooks
│   │   ├── useTodos.ts           # Todo state management
│   │   └── useNotifications.ts   # Push notification handling
│   ├── context/
│   │   └── AuthContext.tsx       # Authentication state
│   └── types/
│       └── index.ts              # TypeScript interfaces
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Create a **Firestore** database
4. Copy the Firebase config values
5. Create a `.env` file from the template:

```bash
cp .env.example .env
```

6. Fill in your Firebase configuration values in `.env`

### 3. Firestore Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{todoId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Run the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## Data Flow Example

When viewing a task detail screen (`app/task/[id].tsx`):

1. **UI Layer** (`app/task/[id].tsx`):

   ```typescript
   const { todo, error } = useTodoDetails(id);
   ```

2. **Hook Layer** (`src/hooks/useTodos.ts`):

   ```typescript
   try {
     const data = await TodoService.getTodoById(id);
     setTodo(data);
   } catch (err) {
     setError("Failed to load task details");
   }
   ```

3. **Service Layer** (`src/services/todoService.ts`):
   ```typescript
   // No try/catch - errors propagate up
   async getTodoById(id: string): Promise<Todo> {
     const docRef = doc(db, "todos", id);
     const docSnap = await getDoc(docRef);
     return { id: docSnap.id, ...docSnap.data() } as Todo;
   }
   ```

## License

MIT
