# VoyageCloset 👜✈️

VoyageCloset is a luxury, interactive React Native (Expo) application powered by **Google Gemini AI** (`gemini-2.5-flash`) that curates wardrobe outfits and visualizes travel packing checklists inside a custom hardshell trolley suitcase.

---

## Key Features

### 1. Smart AI Stylist (Outfits Tab)
- Curates stylish outfits combining your actual wardrobe items.
- Leverages Google Gemini AI to analyze colors, categories, patterns, and seasons to suggest fits with rationales.
- Refreshes suggestions in real-time when new items are added to your closet.

### 2. AI Travel Packer (Travel Pack Tab)
- **Trip configuration**: Enter destinations (e.g. Oman, Dubai, Mumbai, New York) and choose trip duration and style (Vacation, Business, Adventure, Beach).
- **Expanded Autocomplete**: Autocomplete matches major cities in popular travel countries.
- **Trip Style Dropdown Picker**: Select your trip style using a smooth custom dropdown menu.
- **Celsius Weather & AI Advice**: Computes real-time weather expectations and AI recommendations.
- **Interactive Trolley Suitcase Visualizer**:
  - Displays a gorgeous hardshell trolley suitcase with telescoping handles and spinner wheels.
  - **Left Side (Mesh compartment)**: Displays packed accessories, shoes, and a realistic **Travel Wallet**.
  - **Right Side (Clothing bay)**: Stacks checked wardrobe clothes under elastic cross-straps.

### 3. Realistic Document Wallet & 3D Flip Modal
- Displays a realistic black leather passport pouch cover (`passport_bag.jpg`) with a gold airplane emblem and vertical elastic band inside the suitcase.
- **Spring Popup**: Tapping the wallet triggers a tactile scale-down response and springs the wallet modal container into view.
- **3D Card Flip**: Tapping the closed cover flips the wallet in 3D to reveal inner slots:
  1. **Passport**: Indian Passport cover photo (`indian_passport.jpg`).
  2. **E-Visa**: High-tech visa graphic (`travel_document.jpg`).
  3. **Insurance**: Travel Insurance tag card (`insurance.jpg`).
- Checking off documents in the checklist mounts them inside the wallet slots in real-time. Tapping slots shows document identification toasts.

### 4. Custom App Icon & Splash Screen
- **App Icon**: Sleek gold minimalist hanger merging into the outline of a modern travel suitcase with a neon blue airplane orbit.
- **Splash Screen**: Centered VoyageCloset logo on a solid black background, configured to display for a minimum of 2 seconds on launch before fading out.

---

## App Structure & Tabs

The app uses `navigation/MainTabNavigator.tsx` for core layout:

- **Wardrobe** – Welcome dashboard and custom cabinet viewer to add and customize wardrobe items.
- **Outfits** – Features the **AI Stylist** suggestion board for curating outfits.
- **Travel Pack** – Trip planner, weather card, suitcase visualizer, wallet, and smart checklist.
- **Profile** – Reset wardrobe options, clean backgrounds, and view VoyageCloset info.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your Google Gemini API key:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Development Server
```bash
npx expo start
```
Open in an iOS simulator, Android emulator, or scan the QR code via Expo Go on your mobile device.

---

## Asset Guidelines

All assets are located in the organized `assets/images/` directory:
- `icon.png` – Gold-navy VoyageCloset App Icon.
- `splash-icon.png` – Matching brand Splash Screen logo.
- `passport_bag.jpg` – Realistic Travel Wallet cover.
- `indian_passport.jpg` – Indian Passport cover.
- `travel_document.jpg` – E-Visa card image.
- `insurance.jpg` – Travel Insurance tag.
- `smartphone.jpg` – Packed smartphone.
- `powerbank.jpg` – Packed powerbank.
- `charger.jpg` – Packed charger plug.
- `sunscreen.jpg` – Cetaphil sunscreen tube.
- `moisturizer.jpg` – Neutrogena moisturizer tub.
