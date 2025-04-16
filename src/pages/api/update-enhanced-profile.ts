
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() });
  const data = await request.json();
  
  try {
    const { id, education, experience, skills, contact_email, social_links } = data;
    
    const { data: userData, error } = await supabase
      .from('users')
      .update({
        education,
        experience,
        skills,
        contact_email,
        social_links,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating enhanced profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error in update-enhanced-profile API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
