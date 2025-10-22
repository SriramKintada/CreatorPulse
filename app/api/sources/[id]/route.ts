import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Update a source
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceId } = await params
    const { name, status, config, frequency } = await request.json()

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if source exists and belongs to user
    const { data: existingSource, error: fetchError } = await supabase
      .from('sources')
      .select('*')
      .eq('id', sourceId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingSource) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    const updates: any = {}

    if (name) updates.name = name
    if (status && ['active', 'inactive'].includes(status))
      updates.status = status
    if (config) updates.config = config
    if (frequency) updates.scrape_frequency = frequency

    const { error: updateError } = await supabase
      .from('sources')
      .update(updates)
      .eq('id', sourceId)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Source updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Source update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete a source
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceId } = await params

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if source exists
    const { data: existingSource, error: fetchError } = await supabase
      .from('sources')
      .select('id')
      .eq('id', sourceId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingSource) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    // Delete source (cascade will handle scraped_content)
    const { error: deleteError } = await supabase
      .from('sources')
      .delete()
      .eq('id', sourceId)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Decrement user usage counter
    const { error: updateError } = await supabase.rpc('increment_user_usage', {
      user_id_param: user.id,
      field_name: 'sources_connected',
      increment_by: -1,
    })

    if (updateError) {
      console.error('Error updating usage:', updateError)
    }

    return NextResponse.json(
      { message: 'Source deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Source deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
