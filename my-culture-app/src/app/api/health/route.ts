// Health check endpoint
// GET /api/health - Check API and database status

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      successResponse({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: process.env.npm_package_version || '0.1.0',
      })
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      errorResponse('Health check failed', 'Database connection error'),
      { status: 503 }
    );
  }
}
