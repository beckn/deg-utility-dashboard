import { NextRequest, NextResponse } from 'next/server';
import { setData, getData } from '@/lib/cache';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        setData('grid-load', data);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function GET() {
    try {
        const data = getData('grid-load');
        if (!data) {
            return NextResponse.json({ success: false }, { status: 404 });
        }
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
} 