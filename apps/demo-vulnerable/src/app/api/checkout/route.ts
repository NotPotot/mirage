import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    success: true,
    orderId: `ORD-${Date.now()}`,
    message: 'Order placed successfully',
  });
}
