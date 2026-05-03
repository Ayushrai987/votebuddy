import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfill TextEncoder and TextDecoder for Firebase performance module in jsdom
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'mock-api-key';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'mock-project-id';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'mock-auth-domain';

// Mock IntersectionObserver
if (typeof window !== 'undefined') {
  class IntersectionObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver,
  });
}


// Mock Google Maps
global.google = {
  maps: {
    LatLngBounds: jest.fn().mockImplementation(() => ({
      extend: jest.fn(),
    })),
    Map: jest.fn(),
    Marker: jest.fn(),
    InfoWindow: jest.fn(),
    Size: jest.fn(),
    Point: jest.fn(),
  },
};

// Mock localStorage
if (typeof window !== 'undefined') {
  const localStorageMock = (function() {
    let store = {};
    return {
      getItem: function(key) {
        return store[key] || null;
      },
      setItem: function(key, value) {
        store[key] = value.toString();
      },
      clear: function() {
        store = {};
      }
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
}
