// @ts-nocheck
// supabase/functions/notify-partner/index.ts
// Deploy: supabase functions deploy notify-partner

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

type NotifyPayload = {
  sender_id: string;   // UUID del que envía
  couple_id: string;   // UUID de la pareja
  title: string;       // Título de la notificación
  body: string;        // Cuerpo del mensaje
  data?: Record<string, unknown>; // Datos extras (opcional)
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let payload: NotifyPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
  }

  const { sender_id, couple_id, title, body, data } = payload;
  if (!sender_id || !couple_id || !title || !body) {
    return new Response('Missing fields', { status: 400, headers: corsHeaders });
  }

  // 1) Buscar el profile_id del partner (no del que envía)
  const { data: members, error: membersError } = await supabase
    .from('couple_members')
    .select('profile_id')
    .eq('couple_id', couple_id);

  if (membersError || !members || members.length < 2) {
    return new Response('Couple not found or incomplete', { status: 404, headers: corsHeaders });
  }

  const partnerProfileId = members.find((m: any) => m.profile_id !== sender_id)?.profile_id;
  if (!partnerProfileId) {
    return new Response('Partner not found', { status: 404, headers: corsHeaders });
  }

  // 2) Buscar el push token del partner
  const { data: tokenRow, error: tokenError } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('profile_id', partnerProfileId)
    .maybeSingle();

  if (tokenError || !tokenRow?.token) {
    // El partner no tiene token: no es un error grave, simplemente no se notifica
    return new Response(JSON.stringify({ sent: false, reason: 'no_token' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3) Enviar push via Expo Push API
  const message = {
    to: tokenRow.token,
    sound: 'default',
    title,
    body,
    data: data ?? {},
  };

  const expoRes = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(message),
  });

  const expoJson = await expoRes.json();

  return new Response(JSON.stringify({ sent: true, expo: expoJson }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
