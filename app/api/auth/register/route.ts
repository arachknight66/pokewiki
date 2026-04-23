import { NextRequest, NextResponse } from 'next/server';
import { RegisterSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = RegisterSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors,
          },
        },
        { status: 422 }
      );
    }

    const { email, username, password } = validation.data;

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email already in use' },
        },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'USERNAME_EXISTS', message: 'Username already taken' },
        },
        { status: 409 }
      );
    }

    // Hash password & create user
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        password_hash: passwordHash,
      }
    });

    // Create response (do not return JWT, client will use next-auth to sign in)
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'REGISTRATION_ERROR', message: 'Registration failed: ' + ((error as any).message || 'Unknown error') },
      },
      { status: 500 }
    );
  }
}
