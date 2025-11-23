# AI Vocabulary Coach 📚

A modern, AI-powered vocabulary learning application designed to help Bengali speakers master English vocabulary, specifically tailored for IELTS Band 7+ preparation.

## 🚀 Features

### 🤖 AI-Powered Content Generation
- **One-Click Auto-fill**: Enter an English word, and our AI (powered by GPT-4o) automatically generates:
  - Bangla Meaning
  - English Definition
  - Part of Speech
  - Bangla Phonetic Pronunciation
  - Detailed Explanation
  - Synonyms & Antonyms (Band 7+ level)
  - Example Sentences (English with Bangla translation)

### 📖 Vocabulary Management
- **Interactive Cards**: Beautifully designed vocabulary cards with flip/expand interactions.
- **Smart Search & Filtering**: Filter words by Part of Speech, Favorites, or search by text.
- **Audio Pronunciation**: Built-in Text-to-Speech to hear the correct pronunciation.
- **Favorites & PDF Export**: Save difficult words and export your favorites list to PDF for offline study.

### 🖼️ Grammar Gallery
- **Visual Learning**: Access a curated gallery of grammar rules and cheat sheets.
- **Admin Management**: Admins can easily upload and manage grammar reference images.

### 🔐 User System
- **Google Authentication**: Secure and fast sign-in using Google.
- **Role-Based Access**:
  - **Admins**: Full control to add/edit vocabulary, manage users, and upload grammar content.
  - **Users**: Browse, search, favorite words, and view grammar resources.
  - **Guest Mode**: Explore the app with limited features without signing in.

### 🎨 Modern UI/UX
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
- **Smooth Animations**: Powered by Framer Motion for a premium feel.
- **PWA Support**: Installable as a native-like app on your device.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI Integration**: OpenAI API (GPT-4o)
- **State Management**: TanStack Query (React Query)
- **PDF Generation**: jsPDF

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Firebase project
- An OpenAI API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jakir-hossen-4928/AI-Vocabulary-Web-App.git
   cd AI-Vocabulary-Web-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your credentials:

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # OpenAI Configuration
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
