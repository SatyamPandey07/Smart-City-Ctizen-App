# 🏙️ Smart City Citizen Hub

A comprehensive, state-of-the-art mobile citizen engagement and utility management application for smart cities. Built with React 19, TypeScript, Tailwind CSS v4, and Framer Motion, this app provides high-fidelity simulations of modern municipal services, utility auditing, smart payments, and civic reporting.

🚀 Live Interactive Demo: https://smart-city-citizen-hub-705565459967.asia-southeast1.run.app/

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind--CSS-v4.0-38B2AC?logo=tailwindcss)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer--Motion-v12.0-F50057?logo=framer)](https://motion.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📱 Live Experience Overview

The **Smart City Citizen Hub** is designed as a responsive, device-emulated application that mimics high-end mobile operating systems (**iOS** and **Android**) directly in your web browser. It features rich utility analytics, interactive maps, card scan integrations, and high-performance graphic components.

---

## ✨ Key Features

### 🇮🇳 Rupee Currency System (`₹`)
* **All-Indian Localization**: The financial system across the entire application has been fully localized to the **Rupee (`₹`)** currency standard, ensuring accurate citizen pay workflows, bills, receipts, transit cards, and transaction ledger representation.

### 💳 Citizen Pay & Express Top-Up Wallet
* **Virtual Transit & Utility Pass**: Manage citizen balances, pay upcoming bills instantly with one-tap confirmation modals, and load instant funds via the newly styled **Express Top-Up** utility.
* **Integrated Receipt Tracking**: Settling bills automatically fires digital wallet events, tracks past payments in the real-time activity ledger, and issues cryptographically styled municipal receipts.

### 📈 Smart Grid & Energy Pattern Analytics
* **Interactive Utility Graphs**: Detailed, interactive visual charts tracking Electricity (kWh), Water (Liters), and Gas ($m^3$) consumption.
* **AI Grid Pattern Insights**: Advanced consumption peak heuristics analyzing simultaneous high demands (e.g., peak summer cooling cycles) and providing actionable eco-efficiency recommendations (like *Smart-Eco Shading*).

### 🤖 Multi-OS Emulation Framework
* **iOS / Android Live Skins**: Toggle dynamically between high-fidelity Apple iOS and Google Android device framing. It updates physical status bars, system battery readouts, softkey navigations, time indicators, and tactile screen designs in real-time.

### ⚙️ Micro-Service Panels & Citizens Portal
* **🚇 Smart Transit Track**: Real-time dispatch schedules for Metro, Rail, and Bus fleets, featuring status updates (*On Time*, *Delayed*).
* **🅿️ Smart Parking Reservation**: Search available public parking plazas, view hourly rate tables in ₹, and book parking slots instantly.
* **🚨 Dispatch & Civil Reports**: Voice-dictation (Web Speech API) simulation paired with GPS sector tagging for civic reports like Waste Management or Emergency Services.

### 🧬 Immersive Framer Motion Interactions
* **Dynamic Tab Transitions**: Integrated Framer Motion `AnimatePresence` for all primary hub view transitions (Home, Stats, Activities, Profile).
* **Liquid Sheet Modals**: Smooth slide-up drawers, bottom-sheet payment approvals, and fade-in notifications ensuring a premium, native feel.

---

## 🛠️ Tech Stack & Architecture

- **Core Library**: [React 19](https://react.dev/) (Hooks-driven, functional modularity)
- **Bundler**: [Vite 6](https://vitejs.dev/) (Rapid hot development and static asset pipelining)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Next-generation utility CSS engine)
- **Animations**: [Framer Motion 12](https://motion.dev/) (Hardware-accelerated fluid motion pipelines)
- **Icons**: [Lucide React](https://lucide.dev/) (Clean vector iconography)
- **Analytics**: [Recharts](https://recharts.org/) & Custom SVG graphics for complex data visualizations

---

## 📁 Repository Structure

```bash
├── src/
│   ├── App.tsx                    # Main entry point, layout frame, state manager, and bottom navigation
│   ├── main.tsx                   # React virtual DOM mounting logic
│   ├── index.css                  # Global CSS importing next-generation Tailwind v4
│   ├── components/
│   │   ├── HomeTab.tsx            # Welcome deck, Citizen Pay overview, QR Scanner simulation, and services launcher
│   │   ├── DashboardTab.tsx       # Smart Grid Pattern Analytics and Recharts utility graphs
│   │   ├── ActivityTab.tsx        # Track filed complaints, transit rides, paid bills, and cancellation flows
│   │   ├── ProfileTab.tsx         # Citizen information card, personal profile metadata, and wallet actions
│   │   ├── ServicePanels.tsx      # Comprehensive overlays for Transit, Parking, Waste, and Safety services
│   │   └── LoginScreen.tsx        # Secure digital pass identifier unlock/lock gate
│   └── types.ts                   # Unified TypeScript schemas, interfaces, and shared state structures
├── public/                        # Static assets & public resources
├── package.json                   # Project scripts and dependency tree manifest
└── README.md                      # Detailed project documentation and layout manual
```

---

## 🚀 Local Installation & Setup

Get the project up and running locally on your computer in just a few steps:

### Prerequisite
Ensure you have [Node.js](https://nodejs.org/) (v18.0 or higher) and [npm](https://www.npmjs.com/) installed.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-city-citizen-hub.git
cd smart-city-citizen-hub
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Once started, open your browser and navigate to **`http://localhost:3000`** to experience the dashboard.

### 4. Production Build
Compile the application to highly optimized static assets inside the `/dist` directory:
```bash
npm run build
```

---

## 🔄 Synchronizing to your GitHub Account

To push your latest workspace changes directly to your GitHub repository:

1. Open the **Settings Menu** in the **Google AI Studio** top panel.
2. Select **Export to GitHub** (or **Export ZIP**).
3. Connect your GitHub account and select your repository to finalize the export.

All your local workspace edits, including this comprehensive `README.md`, will instantly reflect on your repository main branch!

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
