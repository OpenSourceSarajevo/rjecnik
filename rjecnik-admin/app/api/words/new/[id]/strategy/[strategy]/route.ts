import { createClient } from "@/utils/supabase/server";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import { handleStrategy } from "./strategies/strategyHandler";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; strategy: string }> }) {
  const supabase = await createClient();

  const session = await supabase.auth.getSession(); 

  if (session.error || !session.data.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } 

  const access_token = session.data.session.access_token;
  const jwt = jwtDecode<{ user_permission?: string; email?: string }>(access_token);
  const user_permission = jwt.user_permission;
  const user_email = session.data.session.user.email || jwt.email;

  if (user_permission !== "Dictionary.ReadWrite") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, strategy } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const isClearing = strategy === "null";

  const updateData = isClearing
		? { strategy: null, assigned_to: null }
		: { strategy: strategy, assigned_to: user_email };

  const { data, error: dbError } = await supabase
    .from("words_new")
    .update(updateData)
    .eq("id", id)
    .select();

	if (dbError) {
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
	}
  
  return NextResponse.json(data[0], { status: 200 });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; strategy: string }> }) {
  const supabase = await createClient();

  const session = await supabase.auth.getSession(); 

  if (session.error || !session.data.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } 

  const access_token = session.data.session.access_token;
  const jwt = jwtDecode<{ user_permission?: string; email?: string }>(access_token);
  const user_permission = jwt.user_permission;
  const user_email = session.data.session.user.email || jwt.email;

  if (user_permission !== "Dictionary.ReadWrite") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, strategy } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (!strategy) {
    return NextResponse.json({ error: "Missing strategy" }, { status: 400 });
  }

  try {
    const raw = await request.text();
    const body = raw ? JSON.parse(raw) : null;

    if (!body || typeof body !== "object") {
      console.log("No body");
      const result = await handleStrategy(+id, strategy, { user_email });
      return NextResponse.json(result);
    }
    console.log("body");
    const result = await handleStrategy(+id, strategy, { user_email, ...body });
    return NextResponse.json(result);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

