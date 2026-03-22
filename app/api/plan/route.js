let plans = [];

export async function POST(req) {
  const body = await req.json();

  const newPlan = {
    id: Date.now(),
    ...body,
    createdAt: new Date(),
  };

  plans.push(newPlan);

  return Response.json({ success: true, plan: newPlan });
}

export async function GET() {
  return Response.json(plans);
}
