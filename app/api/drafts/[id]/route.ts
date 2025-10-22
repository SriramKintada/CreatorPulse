import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Update draft
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const draftId = params.id

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if draft exists
    const { data: existingDraft, error: fetchError } = await supabase
      .from('drafts')
      .select('id')
      .eq('id', draftId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingDraft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    const allowedFields = [
      'status',
      'scheduled_at',
      'user_edited_body',
      'user_feedback_items',
      'user_total_edit_time',
      'ai_acceptance_rate',
    ]

    const updates: any = {}
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates[key] = value
      }
    }

    const { error: updateError } = await supabase
      .from('drafts')
      .update(updates)
      .eq('id', draftId)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Draft updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Draft update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete draft
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const draftId = params.id

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', draftId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Draft deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Draft deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
