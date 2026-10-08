import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // We simulate hitting the local Python backend we created
    // Hardcoded target and start weights for the test
    const payload = {
      user_id: userId,
      target_value: 70.0,
      start_value: 85.0
    };

    const pyUrl = process.env.PYTHON_ANALYTICS_URL;
    const pythonRes = await fetch(`${pyUrl}/api/python/analytics/goal-projection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer internal-python-secret-key-123'
      },
      body: JSON.stringify(payload)
    });

    if (!pythonRes.ok) {
      const err = await pythonRes.text();
      throw new Error(`Python API Error: ${pythonRes.status} - ${err}`);
    }

    const data = await pythonRes.json();
    return NextResponse.json({ success: true, analytics: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
