import { NextResponse } from 'next/server';
import swaggerSpec from '../../../lib/swagger';  // Import your Swagger JSON spec

export async function GET() {
  return new NextResponse(JSON.stringify(swaggerSpec), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
