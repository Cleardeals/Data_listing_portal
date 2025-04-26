import type { NextConfig } from "next";
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from the root .env file
const rootEnvPath = path.resolve(process.cwd(), '../../.env');
const envConfig = dotenv.parse(fs.readFileSync(rootEnvPath));

// Set environment variables for Next.js
const env = {
  NEXT_PUBLIC_SUPABASE_URL: envConfig.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY
};

const nextConfig: NextConfig = {
  /* config options here */
  env
};

export default nextConfig;
