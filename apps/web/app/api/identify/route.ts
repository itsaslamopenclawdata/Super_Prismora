import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const type = formData.get('type') as string;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // In a real implementation, this would call the AI gateway service
    // For now, we'll return a mock response

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return mock identification result
    let result;

    if (type === 'coin') {
      result = {
        id: `coin-${Date.now()}`,
        name: '1992 Lincoln Cent',
        type: 'coin',
        confidence: 87.5,
        details: {
          year: '1992',
          mintMark: 'P',
          composition: 'Copper-plated Zinc',
          weight: '2.5g',
          diameter: '19.05mm',
          description: 'The Lincoln Cent is a one-cent coin that has been struck by the United States Mint since 1909.',
          estimatedValue: '$0.05 - $2.00'
        },
        alternativeMatches: [
          { name: '1992 Lincoln Cent (Close AM)', confidence: 8.2 },
          { name: '1992-S Proof Lincoln Cent', confidence: 3.1 },
        ]
      };
    } else if (type === 'vinyl') {
      result = {
        id: `vinyl-${Date.now()}`,
        name: 'Pink Floyd - Dark Side of the Moon',
        type: 'vinyl',
        confidence: 94.2,
        details: {
          artist: 'Pink Floyd',
          album: 'The Dark Side of the Moon',
          year: '1973',
          label: 'Harvest',
          catalogNumber: 'SHVL 804',
          condition: 'Near Mint',
          description: 'One of the most iconic and best-selling albums of all time.',
          estimatedValue: '$30 - $150'
        },
        alternativeMatches: [
          { name: 'Pink Floyd - The Wall', confidence: 3.5 },
        ]
      };
    } else if (type === 'card') {
      result = {
        id: `card-${Date.now()}`,
        name: '1986-87 Fleer Michael Jordan #57',
        type: 'card',
        confidence: 91.8,
        details: {
          player: 'Michael Jordan',
          team: 'Chicago Bulls',
          year: '1986-87',
          set: 'Fleer',
          cardNumber: '57',
          condition: 'Near Mint',
          description: 'The iconic rookie card of basketball legend Michael Jordan.',
          estimatedValue: '$500 - $2,500'
        },
        alternativeMatches: [
          { name: '1985-86 Star Michael Jordan #101', confidence: 5.2 },
        ]
      };
    } else if (type === 'note') {
      result = {
        id: `note-${Date.now()}`,
        name: '1935 Series $1 Silver Certificate',
        type: 'note',
        confidence: 88.3,
        details: {
          denomination: '$1',
          series: '1935',
          type: 'Silver Certificate',
          condition: 'Very Fine',
          sealColor: 'Blue',
          description: 'Silver Certificate featuring the portrait of George Washington.',
          estimatedValue: '$10 - $75'
        },
        alternativeMatches: [
          { name: '1935 Series $1 Federal Reserve Note', confidence: 8.7 },
        ]
      };
    } else {
      result = {
        id: `unknown-${Date.now()}`,
        name: 'Unknown Item',
        type: type || 'unknown',
        confidence: 0,
        details: {},
        alternativeMatches: []
      };
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Identification error:', error);
    return NextResponse.json(
      { error: 'Identification failed' },
      { status: 500 }
    );
  }
}
