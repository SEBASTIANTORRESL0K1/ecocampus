import '@testing-library/jest-dom';

// React Router v7 requires TextEncoder/TextDecoder which older jsdom doesn't provide
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
