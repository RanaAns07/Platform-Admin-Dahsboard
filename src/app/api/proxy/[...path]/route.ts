import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://3.147.66.56';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'GET');
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'POST');
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'DELETE');
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'PATCH');
}

async function proxyRequest(
    request: NextRequest,
    path: string[],
    method: string
) {
    // Get the full path and preserve trailing slashes
    const fullPath = request.nextUrl.pathname;
    const targetPath = fullPath.replace('/api/proxy', '/api');
    const targetUrl = `${BACKEND_URL}${targetPath}`;

    console.log('Proxying to:', targetUrl);

    // Build headers, excluding host
    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host') {
            headers.set(key, value);
        }
    });

    // Add backend host
    headers.set('Host', '3.147.66.56');

    try {
        // Get body for POST/PUT/PATCH
        let body: string | undefined = undefined;
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            body = await request.text();
        }

        const response = await fetch(targetUrl, {
            method,
            headers,
            body,
            redirect: 'manual', // Don't follow redirects
        });

        // Get response body
        const responseBody = await response.text();

        // Return the proxied response
        return new NextResponse(responseBody, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to connect to backend server' },
            { status: 502 }
        );
    }
}
