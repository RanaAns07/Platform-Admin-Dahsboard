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
        // Get body for POST/PUT/PATCH/DELETE
        let body: string | undefined = undefined;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
                body = await request.text();
            } catch (e) {
                // Ignore body parsing errors
            }
        }

        console.log(`Proxying ${method} to:`, targetUrl, body ? `with body: ${body.substring(0, 100)}...` : '');

        const response = await fetch(targetUrl, {
            method,
            headers,
            body,
            redirect: 'manual', // Don't follow redirects
        });

        // Get response body
        const responseBody = await response.text();

        // Return the proxied response. NextResponse does not allow a body for 204, 205, and 304.
        return new NextResponse(response.status === 204 || response.status === 205 || response.status === 304 ? null : responseBody, {
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
