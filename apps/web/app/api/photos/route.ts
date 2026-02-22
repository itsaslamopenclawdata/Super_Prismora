import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: [],
    success: true,
    message: 'No photos yet',
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    data: null,
    success: false,
    message: 'Photo upload not implemented yet',
  });
}
