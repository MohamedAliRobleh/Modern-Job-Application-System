import '@testing-library/jest-dom'

// jsdom does not implement IntersectionObserver (used by framer-motion whileInView)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
