import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user
 *     description: Creates a new user profile with email, password, and optionally name. Returns an access token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "example@example.com" }
 *               password: { type: string, example: "secret123" }
 *               name: { type: string, example: "John Doe" }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Input validation errors
 *       500:
 *         description: Server error
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
      },
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred' },
      { status: 500 }
    );
  }
}
