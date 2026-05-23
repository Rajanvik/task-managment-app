import { getApiDocs } from '@/lib/swagger';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent stale cached API docs

export const GET = async () => {
    try {
        const spec = await getApiDocs();
        return NextResponse.json(spec);
    } catch {
        return NextResponse.json({ error: 'Failed to generate API docs' }, { status: 500 });
    }
};
