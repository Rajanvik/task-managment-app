import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - System
 *     summary: Check API health status
 *     description: Returns the current operational status, system uptime, and server time.
 *     responses:
 *       200:
 *         description: Service is operational
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */
export const GET = async () => {
    let dbStatus = 'disconnected';
    try {
        // Ping database using Prisma
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
    } catch {
        dbStatus = 'disconnected';
    }

    return NextResponse.json({
        success: true,
        status: 'ok',
        database: dbStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
};
