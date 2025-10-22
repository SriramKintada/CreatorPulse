import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { NewsletterTemplate } from '@/components/email/newsletter-template'

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_Hjk4xgKw_PE7iP2dAEBS88dWudRLT5CUN'
const resend = new Resend(RESEND_API_KEY)

/**
 * AUTO-SEND CRON JOB
 * Runs hourly to send scheduled newsletter drafts
 * Vercel Cron: 0 * * * * (every hour at :00)
 */
export async function GET(request: Request) {
  try {
    // Verify this is coming from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📧 AUTO-SEND CRON JOB STARTED')
    const startTime = Date.now()

    const supabase = await createClient()

    // Get current day and hour
    const now = new Date()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' })
    const currentHour = now.getHours()

    console.log(`📅 Current: ${currentDay}, ${currentHour}:00`)

    // Get all users with their recent drafts
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*, drafts!inner(*)')
      .eq('status', 'active')
      .eq('drafts.status', 'draft')
      .order('drafts.created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    console.log(`👥 Found ${users?.length || 0} users with unsent drafts`)

    let newslettersSent = 0
    const errors: Array<{ userId: string; error: string }> = []

    // Process each user
    for (const user of users || []) {
      try {
        const preferences = user.preferences || {}
        const deliveryFrequency = preferences.deliveryFrequency || 'weekly'
        const deliveryTime = preferences.deliveryTime || '08:00'
        const deliveryDay = preferences.deliveryDay || 'monday'

        // Parse delivery time
        const [deliveryHour] = deliveryTime.split(':').map(Number)

        // Check if we should send for this user
        let shouldSend = false

        if (deliveryFrequency === 'daily') {
          shouldSend = currentHour === deliveryHour
        } else if (deliveryFrequency === 'weekly') {
          shouldSend = currentDay === deliveryDay && currentHour === deliveryHour
        } else if (deliveryFrequency === 'biweekly') {
          const weekNumber = Math.ceil(now.getDate() / 7)
          shouldSend = currentDay === deliveryDay && currentHour === deliveryHour && weekNumber % 2 === 0
        } else if (deliveryFrequency === 'monthly') {
          shouldSend = now.getDate() === 1 && currentHour === deliveryHour
        }

        if (!shouldSend) {
          console.log(`⏭️  Skipping ${user.email} (${deliveryFrequency} on ${deliveryDay} at ${deliveryTime})`)
          continue
        }

        // Get the most recent draft for this user
        const { data: drafts } = await supabase
          .from('drafts')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .limit(1)

        if (!drafts || drafts.length === 0) {
          console.log(`   ⚠️  No draft available for ${user.email}`)
          continue
        }

        const draft = drafts[0]

        console.log(`\n✅ Sending newsletter for ${user.email}...`)

        // Fetch all subscribers with email notifications enabled
        const { data: subscribers } = await supabase
          .from('users')
          .select('email, display_name, preferences, newsletter_delivery_email')
          .eq('status', 'active')

        // Filter users who have email notifications enabled
        const recipients = (subscribers || [])
          .filter((sub) => {
            const prefs = sub.preferences || {}
            return prefs.emailNotifications !== false
          })
          .map((sub) => sub.newsletter_delivery_email || sub.email)

        if (recipients.length === 0) {
          console.log(`   ⚠️  No subscribers with email notifications enabled`)
          continue
        }

        console.log(`   📧 Sending to ${recipients.length} subscriber(s)...`)

        const senderName = user.display_name || 'CreatorPulse Newsletter'
        const senderEmail = 'onboarding@resend.dev'
        const newsletterContent = draft.user_edited_body || draft.ai_body
        const newsletterTitle = draft.ai_title || 'Your Newsletter'
        const curatedItems = draft.ai_curated_items || []

        // Send emails
        const results = []

        for (const recipient of recipients) {
          try {
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
              console.error(`   ❌ Failed to send to ${recipient}:`, error)
              results.push({ recipient, success: false, error: error.message })
            } else {
              console.log(`   ✅ Sent to ${recipient}`)
              results.push({ recipient, success: true, emailId: data?.id })
            }
          } catch (sendError: any) {
            console.error(`   ❌ Error sending to ${recipient}:`, sendError)
            results.push({ recipient, success: false, error: sendError.message })
          }
        }

        const successCount = results.filter((r) => r.success).length
        const failCount = results.filter((r) => !r.success).length

        console.log(`   📊 Results: ${successCount} sent, ${failCount} failed`)

        // Update draft status to 'sent' if all emails succeeded
        if (failCount === 0) {
          await supabase
            .from('drafts')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              performance_delivered: successCount,
            })
            .eq('id', draft.id)

          // Add activity feed entry
          await supabase.from('activity_feed').insert({
            user_id: user.id,
            activity_type: 'newsletter_sent',
            title: 'Newsletter Auto-Sent',
            description: `Auto-sent "${newsletterTitle}" to ${successCount} subscribers`,
            metadata: {
              draft_id: draft.id,
              recipients_count: successCount,
              automated: true,
            },
          })

          // Increment usage counter
          await supabase.rpc('increment_user_usage', {
            user_id_param: user.id,
            field_name: 'drafts_sent',
            increment_by: 1,
          })

          newslettersSent++
        }
      } catch (error: any) {
        console.error(`❌ Error sending for user ${user.id}:`, error.message)
        errors.push({ userId: user.id, error: error.message })
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log(`\n✅ AUTO-SEND COMPLETED`)
    console.log(`   Duration: ${duration}s`)
    console.log(`   Users processed: ${users?.length || 0}`)
    console.log(`   Newsletters sent: ${newslettersSent}`)
    console.log(`   Errors: ${errors.length}`)

    return NextResponse.json(
      {
        success: true,
        message: `Auto-send completed in ${duration}s`,
        usersProcessed: users?.length || 0,
        newslettersSent,
        errors: errors.length,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Auto-send cron job error:', error)
    return NextResponse.json({ error: error.message || 'Auto-send failed' }, { status: 500 })
  }
}
