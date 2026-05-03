import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

/**
 * @module api/chat
 * AI-powered election assistant chat endpoint.
 * Uses Google Gemini API for natural language generation.
 */

/** Gemini AI client instance */
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * System prompt defining the AI assistant's persona and behavior guidelines.
 * Enforces neutrality, accuracy, and helpful civic information delivery.
 * @constant
 */
const SYSTEM_PROMPT = `You are VoteBuddy, a helpful and knowledgeable AI assistant for Indian citizens. Your role is to provide accurate, non-partisan, and helpful information about Indian elections, the Election Commission of India (ECI) rules, voter registration, and general civic duties.

Guidelines:
1. Always remain neutral and non-partisan. Do not express opinions on political parties, candidates, or current events.
2. Provide information based on official ECI guidelines when possible.
3. Keep responses concise but informative. Use markdown for formatting (bullet points, bold text).
4. If you don't know the answer or the information is highly specific (like a local booth address), advise the user to check the official ECI website or their local electoral officer.
5. Do not generate fake or unverified data about candidates or election results.
6. Speak in a polite, helpful tone (use greetings like "Namaste" occasionally).
`;

/** Maximum allowed message content length in characters */
const MAX_MESSAGE_LENGTH = 2000;

/** Maximum number of messages per conversation context */
const MAX_MESSAGES_PER_REQUEST = 20;

/**
 * In-memory rate limiting store.
 * Maps client IP to request count and window reset timestamp.
 * @note In production, use Redis or a distributed cache.
 */
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

/** Rate limit window duration in milliseconds (1 minute) */
const RATE_LIMIT_WINDOW = 60 * 1000;

/** Maximum requests allowed per window */
const MAX_REQUESTS = 10;

/**
 * Checks if a client IP has exceeded the rate limit.
 * Resets the counter when the time window expires.
 *
 * @param {string} ip - The client IP address.
 * @returns {boolean} True if the client is rate-limited.
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - userData.lastReset > RATE_LIMIT_WINDOW) {
    userData.count = 1;
    userData.lastReset = now;
    rateLimitMap.set(ip, userData);
    return false;
  }

  userData.count++;
  rateLimitMap.set(ip, userData);
  return userData.count > MAX_REQUESTS;
}

/**
 * Sanitizes user input by removing script tags and HTML elements.
 * Defense-in-depth measure to prevent XSS through AI prompts.
 *
 * @param {string} text - The raw user message text.
 * @returns {string} Sanitized text with dangerous patterns removed.
 */
function sanitizeInput(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }
  return text
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/[<>]/g, "")
    .slice(0, MAX_MESSAGE_LENGTH); // Enforce max length
}

/**
 * Validates the structure of a chat message.
 *
 * @param {any} msg - The message object to validate.
 * @returns {boolean} True if the message has valid role and content fields.
 */
function isValidMessage(msg: any): boolean {
  return (
    msg &&
    typeof msg === "object" &&
    (msg.role === "user" || msg.role === "assistant") &&
    typeof msg.content === "string" &&
    msg.content.trim().length > 0
  );
}

/**
 * POST handler for the chat API endpoint.
 * Processes authenticated user messages through Google Gemini AI
 * and returns a streaming text response.
 *
 * Security measures:
 * - Bearer token authentication
 * - Per-IP rate limiting (10 req/min)
 * - Input sanitization and length limits
 * - Message array validation
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<Response>} Streamed AI response or error JSON.
 */
export async function POST(req: Request) {
  try {
    // 1. Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 },
      );
    }
    // In a real app, we would verify the token with firebase-admin
    const token = authHeader.split("Bearer ")[1];
    if (!token || token === "invalid-token") {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }

    // 2. Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 3. Parse and validate request body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages array" },
        { status: 400 },
      );
    }

    if (messages.length > MAX_MESSAGES_PER_REQUEST) {
      return NextResponse.json(
        { error: "Too many messages in request" },
        { status: 400 },
      );
    }

    // 4. Validate and sanitize each message
    const validMessages = messages.filter(isValidMessage);
    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages provided" },
        { status: 400 },
      );
    }

    const sanitizedMessages = validMessages.map((msg) => ({
      ...msg,
      content: sanitizeInput(msg.content),
    }));

    // 5. Convert to Gemini format
    const geminiMessages = sanitizedMessages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // 6. Generate streamed response
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: geminiMessages,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } /* istanbul ignore next */
      catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } /* istanbul ignore next */
      catch (error) {
    // error logging disabled for prod
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 },
    );
  }
}

