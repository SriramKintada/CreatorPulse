import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Get all sources for the authenticated user
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: sources, error } = await supabase
      .from('sources')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sources }, { status: 200 })
  } catch (error) {
    console.error('Sources fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new source
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, url, config } = body

    // Validate required fields
    if (!name || !type || !url) {
      return NextResponse.json(
        { error: 'Name, type, and URL are required' },
        { status: 400 }
      )
    }

    // Validate source type
    const validTypes = ['twitter', 'youtube', 'reddit', 'newsletter_rss', 'custom_url']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid source type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Clean up URL based on type
    let cleanUrl = url.trim()
    if (type === 'twitter') {
      // Remove @ symbol if present
      cleanUrl = cleanUrl.replace('@', '')
    } else if (type === 'reddit') {
      // Remove r/ if present
      cleanUrl = cleanUrl.replace(/^r\//, '')
    }

    // Check for duplicates
    const { data: existing } = await supabase
      .from('sources')
      .select('id')
      .eq('user_id', user.id)
      .eq('url', cleanUrl)
      .eq('type', type)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'This source already exists in your library' },
        { status: 400 }
      )
    }

    // Create source
    const { data: source, error } = await supabase
      .from('sources')
      .insert({
        user_id: user.id,
        name,
        type,
        url: cleanUrl,
        config: config || {},
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add activity feed entry
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      activity_type: 'source_added',
      title: 'New source added',
      description: `Added ${name} to your sources`,
      metadata: {
        source_id: source.id,
        type,
      },
    })

    // Increment user usage
    await supabase.rpc('increment_user_usage', {
      user_id_param: user.id,
      field_name: 'sources_connected',
      increment_by: 1,
    })

    return NextResponse.json(
      {
        message: 'Source added successfully',
        source,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Source creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
