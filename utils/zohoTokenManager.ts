"use server";

import { connectToDatabase } from "@/lib/database";
import Token from "@/lib/database/models/token.model";

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Load tokens from the database
async function loadTokens(): Promise<TokenData | null> {
  await connectToDatabase();
  const tokenDoc = await Token.findOne({ provider: "zoho" });
  if (!tokenDoc) return null;
  return {
    accessToken: tokenDoc.accessToken,
    refreshToken: tokenDoc.refreshToken,
    expiresAt: tokenDoc.expiresAt,
  };
}

// Save tokens to the database
async function saveTokens(tokens: TokenData): Promise<void> {
  await connectToDatabase();
  await Token.findOneAndUpdate(
    { provider: "zoho" },
    {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      updatedAt: new Date(),
    },
    { upsert: true },
  );
}

// Refresh the access token with retry logic
async function refreshAccessToken(
  refreshToken: string,
  retries = 3,
): Promise<TokenData> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: process.env.ZOHO_CLIENT_ID!,
          client_secret: process.env.ZOHO_CLIENT_SECRET!,
          grant_type: "refresh_token",
        }).toString(),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh access token");
      }

      const newTokens: TokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000 - 60000,
      };

      await saveTokens(newTokens);
      return newTokens;
    } catch (error) {
      if (attempt === retries) throw error;
      console.error(`Token refresh attempt ${attempt} failed:`, error);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error("Failed to refresh token after maximum retries");
}

// Get a valid access token, refreshing if necessary
export async function getValidAccessToken(): Promise<string> {
  const tokens = await loadTokens();

  if (!tokens) {
    throw new Error(
      "No tokens found. Please authorize the app to obtain tokens.",
    );
  }

  if (tokens.expiresAt <= Date.now()) {
    const newTokens = await refreshAccessToken(tokens.refreshToken);
    return newTokens.accessToken;
  }

  return tokens.accessToken;
}

export async function initializeTokens(
  accessToken: string,
  refreshToken: string,
) {
  const tokens: TokenData = {
    accessToken,
    refreshToken,
    expiresAt: 0,
  };
  await saveTokens(tokens);
}
