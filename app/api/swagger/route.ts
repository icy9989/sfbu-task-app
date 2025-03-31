import { NextResponse } from 'next/server';

export async function GET() {
  const swaggerJson = {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      description: 'API documentation',
      version: '1.0.0'
    },
    paths: {
      '/api/example': {
        get: {
          summary: 'Example endpoint',
          responses: {
            '200': {
              description: 'Successful response'
            }
          }
        }
      }
    }
  };

  return NextResponse.json(swaggerJson);
}
