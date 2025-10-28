// Base URL configuration following your reference pattern

export interface CustomWindow extends Window {
  VITE_API_URL?: string;
  VITE_EXECUTION_INSTANCE?: string;
  VITE_TENANT_ID?: string;
}

// Initially, the base URL comes from the locally available .env file
const PRODUCT_ID = "mentor-buddy-app";
const PRODUCT_NAME = "Mentor-Buddy-Management";

let VITE_API_BACKEND_URL = import.meta.env.VITE_API_URL;

// Default fallback URLs
if (!VITE_API_BACKEND_URL) {
  VITE_API_BACKEND_URL = import.meta.env.PROD 
    ? 'https://mentor-buddy-backend.onrender.com'
    : 'http://localhost:3000';
}

const urlFromWindow = (window as CustomWindow).VITE_API_URL;

// Then, use the window's VITE_API_URL if is set (which will it be in deployed environments)
if (urlFromWindow && urlFromWindow !== "API_URL") {
  VITE_API_BACKEND_URL = urlFromWindow;
}

if (VITE_API_BACKEND_URL === undefined) {
  throw new Error(
    "Unable to find the API URL. If you're running the app locally, please ensure there is a .env file containing VITE_API_URL.",
  );
}

export {
  VITE_API_BACKEND_URL,
  PRODUCT_ID,
  PRODUCT_NAME,
};