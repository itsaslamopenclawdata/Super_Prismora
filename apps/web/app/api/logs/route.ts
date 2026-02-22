/**
 * API route to receive logs from frontend and forward to Logstash
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json();
    
    // Forward to Logstash
    const logstashUrl = process.env.LOGSTASH_URL || 'http://localhost:5000';
    
    await fetch(logstashUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to forward log to Logstash:', error);
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}
