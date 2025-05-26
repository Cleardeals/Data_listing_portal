import type { NextConfig } from 'next';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from the root .env file
const rootEnvPath = path.resolve(process.cwd(), '../../.env');
const envConfig = dotenv.parse(fs.readFileSync(rootEnvPath));

// Set environment variables for Next.js
const env = {
  NEXT_PUBLIC_SUPABASE_URL: envConfig.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  JWT_SECRET: envConfig.JWT_SECRET
};

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  env
};

export default nextConfig;
