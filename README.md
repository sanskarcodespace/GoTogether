# GoTogether - Peer-to-Peer Ride-Sharing Platform

GoTogether is a production-ready real-time ride-sharing application built with React Native (Expo) and Node.js (Express).

## Project Structure

- `gotogether-backend`: Node.js Express API with MongoDB, Redis, and Firebase.
- `gotogether-mobile`: React Native Expo application with Zustand and React Navigation.

## Tech Stack

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB (Mongoose)
- **Cache**: Redis
- **Real-time**: Firebase Admin SDK & Socket.io
- **Auth**: JWT (Access + Refresh Tokens)
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

### Mobile
- **Framework**: React Native (Expo Managed Workflow)
- **Navigation**: React Navigation v6
- **State Management**: Zustand
- **API**: Axios with Interceptors
- **Maps**: React Native Maps
- **Real-time**: Firebase Realtime DB
- **UI**: Custom Design System

## Getting Started

### Prerequisites
- Node.js v20+
- MongoDB instance (local or Atlas)
- Redis instance (local or cloud)
- Firebase Project
- Google Maps API Key

### Backend Setup
1. `cd gotogether-backend`
2. `npm install`
3. Configure `.env` file (see template)
4. `npm run dev`

### Mobile Setup
1. `cd gotogether-mobile`
2. `npm install`
3. Configure `.env` file (see template)
4. `npx expo start`

## Environment Configuration

Both projects require `.env` files. Templates are provided in each directory.

## Testing
- Backend: `npm test` (Jest)
- Mobile: `npm test` (Jest)
