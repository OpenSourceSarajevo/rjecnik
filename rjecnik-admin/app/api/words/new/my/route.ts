import { createClient } from "@/utils/supabase/server";
import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

import { NewWord } from "../../contracts";

export async function GET() {
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

    const { data, error } = await supabase
        .from('words_new')
        .select('*')
        .order('created_at', { ascending: false })
        .order('headword', { ascending: true })
        .eq("assigned_to", user_email)
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json<NewWord[]>(data);
}