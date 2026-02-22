import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({
      data: null,
      success: false,
      errors: [{ code: 'NO_FILE', message: 'No file provided' }],
    }, { status: 400 });
  }

  // TODO: Implement file upload logic
  return NextResponse.json({
    data: {
      id: 'temp-id',
      filename: file.name,
      size: file.size,
    },
    success: true,
    message: 'Upload not implemented yet',
  });
}
