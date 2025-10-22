import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { NewsletterTemplate } from '@/components/email/newsletter-template'

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_Hjk4xgKw_PE7iP2dAEBS88dWudRLT5CUN'

const resend = new Resend(RESEND_API_KEY)

/**
 * Send newsletter via email using Resend
 * POST /api/send-newsletter
 * Body: { draftId, recipients: string[] }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { draftId, title, content } = await request.json()

    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID required' }, { status: 400 })
    }

    // Fetch all users with email notifications enabled
    const { data: subscribers, error: subscribersError } = await supabase
      .from('users')
      .select('email, display_name, preferences, newsletter_delivery_email')
      .eq('status', 'active')

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError)
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
    }

    // Filter users who have email notifications enabled
    // Use newsletter_delivery_email if set, otherwise use login email
    const recipients = subscribers
      .filter((sub) => {
        const prefs = sub.preferences || {}
        return prefs.emailNotifications !== false // Default to true if not set
      })
      .map((sub) => sub.newsletter_delivery_email || sub.email)

    console.log(`📧 Found ${recipients.length} subscribers with email notifications enabled`)

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No subscribers with email notifications enabled' },
        { status: 400 }
      )
    }

    // Get draft from database
    const { data: draft, error: draftError } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .eq('user_id', user.id)
      .single()

    if (draftError || !draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Get user data for sender info
    const { data: userData } = await supabase
      .from('users')
      .select('display_name, email')
      .eq('id', user.id)
      .single()

    const senderName = userData?.display_name || 'CreatorPulse Newsletter'
    const senderEmail = 'onboarding@resend.dev' // Resend's default development email (no verification needed)

    // Use provided content or fallback to draft content
    const newsletterContent = content || draft.user_edited_body || draft.ai_body
    const newsletterTitle = title || draft.ai_title || 'Your Newsletter'

    // Get curated items from draft
    const curatedItems = draft.ai_curated_items || []

    console.log(`📧 Sending newsletter to ${recipients.length} subscriber(s)...`)
    console.log(`   Subject: ${newsletterTitle}`)
    console.log(`   Curated items: ${curatedItems.length}`)

    // Send emails (Resend supports up to 100 recipients per request)
    const results = []

    for (const recipient of recipients) {
      try {
        // Get recipient's name from email (basic extraction)
        const recipientName = recipient.split('@')[0].replace(/[._-]/g, ' ')

        const { data, error } = await resend.emails.send({
          from: `${senderName} <${senderEmail}>`,
          to: [recipient],
          subject: newsletterTitle,
          react: NewsletterTemplate({
            title: newsletterTitle,
            content: newsletterContent,
            curatedItems: curatedItems.map((item: any) => ({
              title: item.title || 'Untitled',
              url: item.url || item.link,
              description: item.description || item.summary,
              source_type: item.source_type || item.source,
            })),
            recipientName,
          }),
        })

        if (error) {
          console.error(`❌ Failed to send to ${recipient}:`, error)
          results.push({ recipient, success: false, error: error.message })
        } else {
          console.log(`✅ Sent to ${recipient}`)
          results.push({ recipient, success: true, emailId: data?.id })
        }
      } catch (sendError: any) {
        console.error(`❌ Error sending to ${recipient}:`, sendError)
        results.push({ recipient, success: false, error: sendError.message })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    console.log(`📊 Email send results: ${successCount} sent, ${failCount} failed`)

    // Update draft status to 'sent' if all emails succeeded
    if (failCount === 0) {
      await supabase
        .from('drafts')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          performance_delivered: successCount,
        })
        .eq('id', draftId)

      // Add activity feed entry
      await supabase.from('activity_feed').insert({
        user_id: user.id,
        activity_type: 'newsletter_sent',
        title: 'Newsletter Sent',
        description: `Sent "${newsletterTitle}" to ${successCount} subscribers`,
        metadata: {
          draft_id: draftId,
          recipients_count: successCount,
        },
      })

      // Increment usage counter
      await supabase.rpc('increment_user_usage', {
        user_id_param: user.id,
        field_name: 'drafts_sent',
        increment_by: 1,
      })
    }

    return NextResponse.json(
      {
        message: `Newsletter sent to ${successCount} subscriber(s)`,
        sentCount: successCount,
        failCount,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Newsletter send error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send newsletter' },
      { status: 500 }
    )
  }
}

