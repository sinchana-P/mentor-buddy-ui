import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from 'next-themes';

function ThemeProviderWrapper() {
  const [theme, setTheme] = useState('dark'); // Default to dark theme

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <App theme={theme} setTheme={setTheme} />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProviderWrapper />
  </Provider>
);
