const ITINERARY_TIMEOUT_MS = 45000;

function timeoutSignal(ms) {
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

function cleanString(value, max = 1200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function cleanList(value, maxItems = 12) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').map((item) => cleanString(item, 160)).filter(Boolean).slice(0, maxItems)
    : [];
}

function normalisePlan(value) {
  if (!value || typeof value !== 'object') return null;
  const days = Array.isArray(value.daily_itinerary)
    ? value.daily_itinerary.map((item) => ({
        day: cleanString(item?.day, 30),
        city: cleanString(item?.city, 80),
        morning: cleanString(item?.morning, 300),
        afternoon: cleanString(item?.afternoon, 300),
        evening: cleanString(item?.evening, 300),
        transport: cleanString(item?.transport, 300),
        food: cleanString(item?.food, 240),
        notes: cleanString(item?.notes, 300),
      })).filter((item) => item.day || item.city || item.morning || item.afternoon || item.evening).slice(0, 21)
    : [];
  if (!days.length) return null;
  return {
    title: cleanString(value.title, 160) || 'Your China trip plan',
    summary: cleanString(value.summary, 900),
    daily_itinerary: days,
    transport: cleanList(value.transport, 8),
    preparation: cleanList(value.preparation, 12),
    personalised_notes: cleanList(value.personalised_notes, 12),
    verify_before_booking: cleanList(value.verify_before_booking, 8),
  };
}

function parsePlanContent(content) {
  if (typeof content !== 'string' || !content.trim()) return null;
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  try {
    return normalisePlan(JSON.parse(cleaned));
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return normalisePlan(JSON.parse(cleaned.slice(start, end + 1)));
    } catch {
      return null;
    }
  }
}

async function callDeepSeekDirect(env, messages) {
  if (!env.DEEPSEEK_API_KEY) return { ok: false, errorCode: 'missing_config' };
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.DEEPSEEK_ITINERARY_MODEL || 'deepseek-chat',
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 5000,
        stream: false,
      }),
      signal: timeoutSignal(ITINERARY_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, errorCode: response.status >= 500 ? 'provider_error' : 'provider_rejected' };
    const data = await response.json();
    const plan = parsePlanContent(data?.choices?.[0]?.message?.content);
    return plan ? { ok: true, plan } : { ok: false, errorCode: 'invalid_plan' };
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') return { ok: false, errorCode: 'provider_timeout' };
    return { ok: false, errorCode: 'unknown_error' };
  }
}

async function callExistingBuddyProxy(env, systemPrompt, userPrompt, requestId) {
  if (!env.COZE_WORKER_URL) return { ok: false, errorCode: 'missing_config' };
  const workerBase = env.COZE_WORKER_URL.replace(/\/+$/, '');
  const endpoint = workerBase.endsWith('/coze') ? workerBase : `${workerBase}/coze`;
  const headers = { 'Content-Type': 'application/json' };
  if (env.COZE_INTERNAL_SECRET) headers['X-ChinaEase-Internal-Token'] = env.COZE_INTERNAL_SECRET;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: `${systemPrompt}\n\n${userPrompt}`,
        context: [],
        userId: requestId || crypto.randomUUID(),
        botId: env.COZE_BOT_ID || 'chinaease-trip-planner',
        stream: false,
        timeoutMs: 40000,
      }),
      signal: timeoutSignal(ITINERARY_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, errorCode: response.status >= 500 ? 'provider_error' : 'provider_rejected' };
    const data = await response.json();
    const plan = parsePlanContent(data?.reply);
    return plan ? { ok: true, plan } : { ok: false, errorCode: 'invalid_plan' };
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') return { ok: false, errorCode: 'provider_timeout' };
    return { ok: false, errorCode: 'unknown_error' };
  }
}

export async function generateTripPlan(env, lead) {
  const input = {
    travel_date: lead.travelDate || null,
    travelers: lead.travelers || null,
    trip_length_days: lead.tripLength || null,
    departure_country: lead.departureCountry || null,
    first_arrival_city: lead.arrivalCity || null,
    cities_considered: lead.destinationCities || [],
    priorities: lead.priorities || [],
    concerns: lead.concerns || [],
    additional_help: lead.helpWith || null,
  };
  const systemPrompt = `You are ChinaEase Buddy's travel planning assistant. Create a practical first-draft China itinerary for a foreign visitor. Use only the information supplied by the user. Do not invent visa eligibility, live prices, opening hours, ticket availability, medical advice, or bookings; put anything that must be checked in verify_before_booking. Return JSON only, matching this exact shape:
{"title":"...","summary":"...","daily_itinerary":[{"day":"Day 1","city":"...","morning":"...","afternoon":"...","evening":"...","transport":"...","food":"...","notes":"..."}],"transport":["..."],"preparation":["..."],"personalised_notes":["..."],"verify_before_booking":["..."]}
Make each day specific and useful. If the user has not chosen enough cities, build a sensible route around the arrival city and clearly label assumptions. Use concise English suitable for an email. Keep every morning, afternoon, evening, transport, food, and notes value under 140 characters so the complete JSON response is not truncated.`;
  const userPrompt = `Create the JSON trip plan for this traveller:\n${JSON.stringify(input)}`;
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  // Prefer a dedicated key when configured. If the website does not have one,
  // reuse the already-configured DeepSeek proxy that powers Ask Buddy.
  const directResult = await callDeepSeekDirect(env, messages);
  if (directResult.ok) return directResult;
  const proxyResult = await callExistingBuddyProxy(env, systemPrompt, userPrompt, lead.requestId);
  return proxyResult.ok ? proxyResult : { ok: false, errorCode: proxyResult.errorCode || directResult.errorCode };
}
