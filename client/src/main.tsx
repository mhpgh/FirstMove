import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  console.error('Promise that was rejected:', event.promise);
  
  // Check if it's a network or fetch related error
  if (event.reason instanceof TypeError && event.reason.message.includes('fetch')) {
    console.log('Network error caught and handled');
  }
  
  // Prevent the default browser error handling
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

createRoot(document.getElementById("root")!).render(<App />);
