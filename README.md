# VoyageCloset 👜✈️

VoyageCloset is a luxury, interactive React Native (Expo SDK 57) web & mobile application powered by **Google Gemini 3.6 Flash AI** that curates personalized wardrobe outfits and visualizes travel packing checklists inside a custom 3D hardshell trolley suitcase.

---

## 🌟 Key Features

### 1. Smart AI Stylist (Outfits Tab)
- **Multimodal AI Analysis**: Analyzes clothing item images, categories, patterns, colors, and seasons using **Google Gemini 3.6 Flash**.
- **Real-Time Outfit Curation**: Automatically generates 3 personalized outfit combinations complete with color coordination rationales.
- **Dynamic Updates**: Instant re-styling when new items are added to your wardrobe.

### 2. AI Travel Packer & Suitcase Visualizer (Travel Pack Tab)
- **Smart Destination Autocomplete**: Type destinations across global travel hotspots with real-time suggestions.
- **Trip Style & Celsius Weather Advice**: Computes real-time weather forecasts (°C) and AI styling recommendations tailored to your destination and trip style (Vacation, Business, Adventure, Beach).
- **Interactive Hardshell Trolley Suitcase**:
  - **Left Bay (Mesh Compartment)**: Displays packed accessories, shoes, and a realistic **Travel Wallet**.
  - **Right Bay (Clothing Bay)**: Stacks checked wardrobe clothes under elastic cross-straps.

### 3. Document Wallet & 3D Flip Modal
- Realistic leather passport pouch cover with a gold airplane emblem inside the suitcase.
- **3D Card Flip**: Tapping the wallet flips it in 3D to reveal inner slots:
  1. **Passport**: Passport cover photo (`indian_passport.jpg`).
  2. **E-Visa**: High-tech visa document graphic (`travel_document.jpg`).
  3. **Insurance**: Travel Insurance tag (`insurance.jpg`).
- Checking off documents mounts them inside the wallet slots in real-time.

### 4. Mobile Web & Vercel Ready
- Optimized for mobile web browsers (iOS Safari, Android Chrome) with dynamic viewport height (`100dvh`), notch safe areas (`viewport-fit=cover`), and input auto-zoom prevention.

---

## 🔑 Environment Variables & API Keys Setup

VoyageCloset uses environment variables to communicate with cloud AI models and background image processing services.

### API Keys Overview

| Variable Name | Required / Optional | Service | Purpose | Where to Get |
|---|---|---|---|---|
| `EXPO_PUBLIC_GEMINI_API_KEY` | **Required (Primary)** | Google Gemini AI | Multi-modal image classification, outfit recommendations, weather styling advice, and packing lists using `gemini-3.6-flash`. | [Google AI Studio](https://aistudio.google.com/) |
| `EXPO_PUBLIC_HF_TOKEN` | **Required (Secondary Backup)** | Hugging Face | Read-only access token for vision model warm-up and secondary classification (`Salesforce/blip-image-captioning-base`). | [Hugging Face Tokens](https://huggingface.co/settings/tokens) |
| `EXPO_PUBLIC_REMOVE_BG_API_KEY` | Optional | Remove.bg | Automatic background removal from uploaded clothing photos (50 free images/month). | [Remove.bg API Keys](https://www.remove.bg/) |
| `EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK` | **Required** | Expo SDK 57 | Set to `true` to bypass Expo Router checks when using React Navigation. | Set to `true` in `.env` |

---

### Setting Up `.env` Locally

Create a `.env` file in the project root directory (`VoyageCloset/.env`):

```env
# Primary Multimodal LLM: Google Gemini API Key (Required)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Backup Multimodal LLM: Hugging Face Access Token (Required)
EXPO_PUBLIC_HF_TOKEN=your_hugging_face_token_here

# Automatic Background Removal API Key (Optional)
EXPO_PUBLIC_REMOVE_BG_API_KEY=your_remove_bg_api_key_here

# Expo SDK 57 Compatibility Flag (Required)
EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK=true
```

---

### Setting Up Environment Variables on Vercel

When deploying to **Vercel**, add these variables in your **Vercel Project Settings**:

1. Go to your project in the [Vercel Dashboard](https://vercel.com).
2. Navigate to **Settings** > **Environment Variables**.
3. Add the following key-value pairs:
   - **Key**: `EXPO_PUBLIC_GEMINI_API_KEY` (Required)  
     **Value**: `your_gemini_api_key_here`
   - **Key**: `EXPO_PUBLIC_HF_TOKEN` (Required)  
     **Value**: `your_hugging_face_token_here`
   - **Key**: `EXPO_PUBLIC_REMOVE_BG_API_KEY` (Optional)  
     **Value**: `your_remove_bg_api_key_here`
   - **Key**: `EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK` (Required)  
     **Value**: `true`
4. Re-deploy your project.

---

## 🛠️ Installation & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure `.env`
Ensure your `.env` file is populated with your API keys as shown above.

### 3. Start Metro Dev Server
```bash
npx expo start --clear
```
- Press **w** to open in Web browser.
- Press **i** to open in iOS Simulator.
- Press **a** to open in Android Emulator.
- Scan the QR code using the **Expo Go** app on your phone.

---

## 🚀 Building & Deploying to Vercel

The project includes pre-configured [vercel.json](file:///d:/projects/VoyageCloset/vercel.json) and web build scripts for Vercel deployment.

### Local Production Build Test
```bash
npm run build
```
This exports the static web app to the `dist` directory.

### Deploy via Vercel CLI
```bash
npx vercel --prod
```

### Deploy via GitHub Integration
1. Push your changes to GitHub.
2. Import the repository into Vercel.
3. Vercel will automatically read `vercel.json`, run `npm run build`, and publish your app.

---

## 📱 Tech Stack & Dependencies

- **Framework**: Expo SDK 57 (React Native 0.86, React 19)
- **AI Core**: Google Gemini 3.6 Flash (`generativelanguage.googleapis.com`)
- **Backup AI**: Hugging Face Inference (`api-inference.huggingface.co`)
- **Navigation**: React Navigation 7 (`@react-navigation/native-stack`, `@react-navigation/bottom-tabs`)
- **Animations**: React Native Reanimated & Animated API
- **Deployment**: Vercel SPA (`outputDirectory: "dist"`)

---

## 📂 Project Structure

```
VoyageCloset/
├── app.json                # Expo configuration & plugins
├── App.tsx                 # Root application component & providers
├── assets/                 # App icon, splash, & travel wallet assets
├── components/             # Reusable UI components & modals
├── contexts/               # WardrobeContext state management
├── hooks/                  # Custom theme & color scheme hooks
├── navigation/             # Navigation stacks & tab bar
├── public/                 # Custom mobile-optimized index.html template
├── screens/                # Wardrobe, Outfits, TravelPack, & Profile screens
├── types/                  # TypeScript definitions for items & trips
├── utils/                  # Gemini AI classifier & helper functions
├── vercel.json             # Vercel deployment configuration
└── package.json            # Project dependencies & build scripts
```
