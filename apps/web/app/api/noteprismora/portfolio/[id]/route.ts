import { NextRequest, NextResponse } from 'next/server';

let portfolio: any[] = [];

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const index = portfolio.findIndex(item => item.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    portfolio.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Item deleted from portfolio',
    });
  } catch (error) {
    console.error('Portfolio delete error:', error);
    return NextResponse.json({ error: 'Failed to delete item from portfolio' }, { status: 500 });
  }
}
