/* eslint-disable prettier/prettier */
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  const data = await request.json();

  const { error } = await supabase
    .from('reports')
    .insert([
      {
        agent_count: data.agentCount,
        activities: data.activities,
        other_activity: data.otherActivity,
        location: data.location,
        clothing: data.clothing,
        other_clothing: data.otherClothing,
        time: data.time,
        equipment: data.equipment,
        other_equipment: data.otherEquipment,
        details: data.details,
        latitude: data.latitude,
        longitude: data.longitude,
        over_votes: [], // Initialize with empty array
      }
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minLat = searchParams.get('minLat');
    const maxLat = searchParams.get('maxLat');
    const minLng = searchParams.get('minLng');
    const maxLng = searchParams.get('maxLng');
    
    console.log('Searching in bounds:', { minLat, maxLat, minLng, maxLng });
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    let query = supabase
      .from('reports')
      .select('*, over_votes') // Explicitly select over_votes
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    if (minLat && maxLat && minLng && maxLng) {
      query = query
        .gte('latitude', Number(minLat))
        .lte('latitude', Number(maxLat))
        .gte('longitude', Number(minLng))
        .lte('longitude', Number(maxLng));
    }

    const { data, error } = await query;
    
    console.log('Found reports:', data?.length || 0);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
