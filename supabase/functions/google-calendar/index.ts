import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getGoogleAccessToken(userId: string, providerToken?: string): Promise<string | null> {
  console.log(`[google-calendar] getGoogleAccessToken: userId=${userId}, hasProviderToken=${!!providerToken}`);
  // 1) If client passed a fresh provider_token (Google access token), use it directly
  if (providerToken) return providerToken;

  // 2) Fall back to stored refresh token in user_data table
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("user_data")
    .select("google_refresh_token")
    .eq("user_id", userId)
    .single();

  console.log(`[google-calendar] Refresh token lookup: hasData=${!!data}, hasToken=${!!data?.google_refresh_token}, error=${error?.message || 'none'}`);

  if (error || !data?.google_refresh_token) return null;

  return await refreshGoogleToken(data.google_refresh_token);
}

async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  console.log(`[google-calendar] Refreshing token, hasClientId=${!!GOOGLE_CLIENT_ID}, hasClientSecret=${!!GOOGLE_CLIENT_SECRET}`);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[google-calendar] Token refresh failed (${res.status}):`, errText);
    return null;
  }
  const data = await res.json();
  console.log(`[google-calendar] Token refresh success, hasAccessToken=${!!data.access_token}`);
  return data.access_token || null;
}

async function listCalendars(accessToken: string) {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error("Failed to fetch calendars");
  const data = await res.json();
  return (data.items || []).map((cal: any) => ({
    id: cal.id,
    summary: cal.summary,
    backgroundColor: cal.backgroundColor,
    primary: cal.primary || false,
  }));
}

async function getEvents(
  accessToken: string,
  date: string,
  calendarIds: string[]
) {
  const timeMin = `${date}T00:00:00Z`;
  const timeMax = `${date}T23:59:59Z`;
  const allEvents: any[] = [];

  for (const calId of calendarIds) {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
    });
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) continue;
    const data = await res.json();
    for (const ev of data.items || []) {
      // Skip all-day events (no dateTime field)
      if (!ev.start?.dateTime || !ev.end?.dateTime) continue;
      allEvents.push({
        id: ev.id,
        summary: ev.summary || "(No title)",
        start: ev.start.dateTime,
        end: ev.end.dateTime,
        calendarId: calId,
        hangoutLink: ev.hangoutLink,
        conferenceData: ev.conferenceData,
      });
    }
  }

  return allEvents;
}

async function createEvent(
  accessToken: string,
  calendarId: string,
  event: { summary: string; start: string; end: string }
) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.summary,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
      }),
    }
  );
  if (!res.ok) throw new Error("Failed to create event");
  return await res.json();
}

async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: { summary?: string; start?: string; end?: string }
) {
  const body: any = {};
  if (event.summary) body.summary = event.summary;
  if (event.start) body.start = { dateTime: event.start };
  if (event.end) body.end = { dateTime: event.end };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error("Failed to update event");
  return await res.json();
}

async function deleteEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok && res.status !== 404) throw new Error("Failed to delete event");
  return { success: true };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the Supabase JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, provider_token, ...params } = body;
    console.log(`[google-calendar] Action: ${action}, userId: ${user.id}, hasProviderToken: ${!!provider_token}`);

    // Get Google access token (use provided token or fall back to stored refresh token)
    const accessToken = await getGoogleAccessToken(user.id, provider_token);
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "No Google token. Please reconnect your calendar." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;
    switch (action) {
      case "list-calendars":
        result = { calendars: await listCalendars(accessToken) };
        break;
      case "get-events":
        result = { events: await getEvents(accessToken, params.date, params.calendarIds) };
        break;
      case "create-event":
        result = await createEvent(accessToken, params.calendarId, params.event);
        break;
      case "update-event":
        result = await updateEvent(accessToken, params.calendarId, params.eventId, params.event);
        break;
      case "delete-event":
        result = await deleteEvent(accessToken, params.calendarId, params.eventId);
        break;
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
