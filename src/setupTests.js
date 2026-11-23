import '@testing-library/jest-dom'

// Default base URL for unit tests
import.meta.env.VITE_API_BASE_URL = 'http://localhost:8081/api'

// Polyfill JSDOM untuk Toast UI Editor (matchMedia, canvas, selection/range)
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

HTMLCanvasElement.prototype.getContext = () => null

Range.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 })
Range.prototype.getClientRects = () => ({ item: () => null, length: 0, [Symbol.iterator]: [][Symbol.iterator] })
