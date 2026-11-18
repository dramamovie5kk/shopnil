import { Env } from '../core';
import { serviceDatabase } from '../service';

const corsHeaders = { 'Cache-Control': 'no-store' };

interface BDCourierResponse {
  status: number;
  message: string;
  data?: {
    phone: string;
    total: number;
    success: number;
    cancel: number;
    success_ratio: number;
    cancel_ratio: number;
    couriers?: Array<{
      name: string;
      total: number;
      success: number;
      cancel: number;
    }>;
  };
}

export async function handle(req: Request, env: Env): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from site_settings
    const database = serviceDatabase(env);

    const { data: settingData } = await database
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'bdcourier_api_key')
      .single();

    const BDCOURIER_API_KEY = settingData?.setting_value;
    
    if (!BDCOURIER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'BD Courier API key not configured. Please add it in Settings > Courier.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { phone } = await req.json<{phone?:string}>();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean phone number - remove spaces, dashes, and +880 prefix
    let cleanPhone = phone.replace(/[\s\-\+]/g, '');
    if (cleanPhone.startsWith('880')) {
      cleanPhone = '0' + cleanPhone.slice(3);
    }
    if (!cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone;
    }


    // Call BD Courier API with correct endpoint
    const response = await fetch('https://api.bdcourier.com/courier-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BDCOURIER_API_KEY}`,
      },
      body: JSON.stringify({ phone: cleanPhone }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      
      return new Response(JSON.stringify({ error: 'Courier lookup failed; retry later' }), {status:502,headers:{...corsHeaders,'Content-Type':'application/json'}});
    }

    const result: BDCourierResponse = await response.json();


    return new Response(
      JSON.stringify({ success: true, data: result.data || result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({ error: 'Courier request failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
