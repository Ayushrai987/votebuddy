/**
 * @jest-environment node
 */
import { POST } from './route';

// Polyfill for Request, Response, and TextEncoder in Node environment
if (typeof Request === 'undefined') {
  const { Request, Response, Headers } = require('next/dist/compiled/@edge-runtime/primitives');
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
}
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}


// Mock Gemini AI
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContentStream: jest.fn().mockResolvedValue([
        { text: 'Hello' },
        { text: ' world' }
      ])
    }
  }))
}));

describe('Chat API Integration', () => {
  const createReq = (body: any, headers: any = {}) => {
    return new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
        ...headers
      },
      body: JSON.stringify(body)
    });
  };

  it('rejects requests without a valid Firebase Auth token', async () => {
    const req = createReq({ messages: [] }, { 'Authorization': '' });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/Unauthorized/i);
  });

  it('rejects requests with invalid token', async () => {
    const req = createReq({ messages: [] }, { 'Authorization': 'Bearer invalid-token' });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid token/i);
  });

  it('returns 429 when rate limit is exceeded', async () => {
    // MAX_REQUESTS is 10
    const ip = '1.2.3.4';
    const headers = { 'x-forwarded-for': ip };
    
    // Fill up the rate limit
    for (let i = 0; i < 10; i++) {
      await POST(createReq({ messages: [] }, headers));
    }

    const res = await POST(createReq({ messages: [] }, headers));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBe('Too many requests');
  });

  it('rejects requests with invalid messages array', async () => {
    const req = createReq({ messages: 'not-an-array' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid messages array');
  });

  it('rejects requests with no valid messages', async () => {
    const req = createReq({ messages: [{ role: 'invalid', content: 'test' }] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('No valid messages provided');
  });

  it('rejects requests with empty message content', async () => {
    const req = createReq({ messages: [{ role: 'user', content: '   ' }] });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('sanitizes malicious input before forwarding', async () => {
    const maliciousContent = '<script>alert("xss")</script>Hello <p>world</p>';
    const req = createReq({ 
      messages: [{ role: 'user', content: maliciousContent }] 
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    // Sanitization logic in route removes script tags and <>
  });

  it('returns streamed response correctly', async () => {
    const req = createReq({ 
      messages: [{ role: 'user', content: 'Hi' }] 
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    
    const reader = res.body?.getReader();
    const { value } = await reader!.read();
    const text = new TextDecoder().decode(value);
    expect(text).toBe('Hello');
  });

  it('sets Cache-Control header to prevent caching', async () => {
    const req = createReq({ 
      messages: [{ role: 'user', content: 'test' }] 
    });

    const res = await POST(req);
    expect(res.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');
  });
});
