import { NextRequest, NextResponse } from 'next/server';

let portfolio: any[] = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    items: portfolio,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item, dateAdded } = body;

    if (!item || !item.id) {
      return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
    }

    const existingIndex = portfolio.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      portfolio[existingIndex] = { ...item, dateAdded: dateAdded || new Date().toISOString() };
    } else {
      portfolio.push({ ...item, dateAdded: dateAdded || new Date().toISOString() });
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to portfolio',
      item: portfolio[portfolio.length - 1],
    });
  } catch (error) {
    console.error('Portfolio add error:', error);
    return NextResponse.json({ error: 'Failed to add item to portfolio' }, { status: 500 });
  }
}
