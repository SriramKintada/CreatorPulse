import * as React from 'react';

interface NewsletterTemplateProps {
  title: string;
  content: string;
  curatedItems?: Array<{
    title: string;
    url?: string;
    description?: string;
    source_type?: string;
  }>;
  recipientName?: string;
}

export function NewsletterTemplate({
  title,
  content,
  curatedItems = [],
  recipientName = 'there',
}: NewsletterTemplateProps) {
  // Convert markdown-style content to basic HTML
  const formatContent = (text: string) => {
    return text
      .split('\n\n')
      .map((paragraph) => {
        // Handle headers
        if (paragraph.startsWith('### ')) {
          return `<h3 style="font-size: 18px; font-weight: 600; margin: 24px 0 12px; color: #111827;">${paragraph.replace('### ', '')}</h3>`;
        }
        if (paragraph.startsWith('## ')) {
          return `<h2 style="font-size: 22px; font-weight: 700; margin: 32px 0 16px; color: #111827;">${paragraph.replace('## ', '')}</h2>`;
        }
        if (paragraph.startsWith('# ')) {
          return `<h1 style="font-size: 26px; font-weight: 800; margin-bottom: 20px; color: #111827;">${paragraph.replace('# ', '')}</h1>`;
        }

        // Handle bold text
        let formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Handle italic text
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Handle links
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #6366f1; text-decoration: underline;">$1</a>');

        return `<p style="margin-bottom: 16px; line-height: 1.7; color: #374151; font-size: 16px;">${formatted}</p>`;
      })
      .join('');
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{
        backgroundColor: '#f9fafb',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        margin: 0,
        padding: 0,
      }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f9fafb', padding: '40px 20px' }}>
          <tr>
            <td align="center">
              {/* Main Container */}
              <table width="600" cellPadding="0" cellSpacing="0" style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
              }}>
                {/* Header */}
                <tr>
                  <td style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    padding: '40px 40px 30px',
                    textAlign: 'center',
                  }}>
                    <h1 style={{
                      margin: 0,
                      fontSize: '28px',
                      fontWeight: '800',
                      color: '#ffffff',
                      letterSpacing: '-0.5px',
                    }}>
                      {title}
                    </h1>
                    <p style={{
                      margin: '12px 0 0',
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}>
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </td>
                </tr>

                {/* Greeting */}
                <tr>
                  <td style={{ padding: '30px 40px 20px' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '16px',
                      color: '#374151',
                      lineHeight: '1.6',
                    }}>
                      Hi {recipientName} 👋
                    </p>
                  </td>
                </tr>

                {/* Main Content */}
                <tr>
                  <td style={{ padding: '0 40px 30px' }}>
                    <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
                  </td>
                </tr>

                {/* Curated Items Section */}
                {curatedItems.length > 0 && (
                  <tr>
                    <td style={{ padding: '0 40px 30px' }}>
                      <div style={{
                        borderTop: '2px solid #e5e7eb',
                        paddingTop: '30px',
                      }}>
                        <h2 style={{
                          margin: '0 0 20px',
                          fontSize: '22px',
                          fontWeight: '700',
                          color: '#111827',
                        }}>
                          📚 Curated For You
                        </h2>

                        <table width="100%" cellPadding="0" cellSpacing="0">
                          {curatedItems.map((item, index) => (
                            <tr key={index}>
                              <td style={{ paddingBottom: '20px' }}>
                                <table width="100%" cellPadding="0" cellSpacing="0" style={{
                                  backgroundColor: '#f9fafb',
                                  borderRadius: '8px',
                                  padding: '16px',
                                  borderLeft: '4px solid #6366f1',
                                }}>
                                  <tr>
                                    <td>
                                      {item.url ? (
                                        <a href={item.url} style={{
                                          fontSize: '17px',
                                          fontWeight: '600',
                                          color: '#111827',
                                          textDecoration: 'none',
                                          display: 'block',
                                          marginBottom: '8px',
                                        }}>
                                          {item.title}
                                        </a>
                                      ) : (
                                        <div style={{
                                          fontSize: '17px',
                                          fontWeight: '600',
                                          color: '#111827',
                                          marginBottom: '8px',
                                        }}>
                                          {item.title}
                                        </div>
                                      )}

                                      {item.description && (
                                        <p style={{
                                          margin: 0,
                                          fontSize: '14px',
                                          color: '#6b7280',
                                          lineHeight: '1.6',
                                        }}>
                                          {item.description}
                                        </p>
                                      )}

                                      {item.source_type && (
                                        <div style={{
                                          marginTop: '8px',
                                          fontSize: '12px',
                                          color: '#9ca3af',
                                          textTransform: 'uppercase',
                                          fontWeight: '500',
                                          letterSpacing: '0.5px',
                                        }}>
                                          {item.source_type}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          ))}
                        </table>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Footer */}
                <tr>
                  <td style={{
                    backgroundColor: '#f9fafb',
                    padding: '30px 40px',
                    borderTop: '1px solid #e5e7eb',
                  }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td align="center">
                          <p style={{
                            margin: '0 0 12px',
                            fontSize: '14px',
                            color: '#6b7280',
                            lineHeight: '1.6',
                          }}>
                            This newsletter was curated and generated by{' '}
                            <a href="https://creatorpulse.com" style={{
                              color: '#6366f1',
                              textDecoration: 'none',
                              fontWeight: '600',
                            }}>
                              CreatorPulse
                            </a>
                          </p>

                          <p style={{
                            margin: '0 0 16px',
                            fontSize: '12px',
                            color: '#9ca3af',
                          }}>
                            AI-powered newsletter automation for creators
                          </p>

                          <div style={{ marginTop: '20px' }}>
                            <a href="{{{unsubscribe}}}" style={{
                              color: '#9ca3af',
                              fontSize: '12px',
                              textDecoration: 'underline',
                            }}>
                              Unsubscribe
                            </a>
                            {' • '}
                            <a href="https://creatorpulse.com/settings" style={{
                              color: '#9ca3af',
                              fontSize: '12px',
                              textDecoration: 'underline',
                            }}>
                              Preferences
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Branding Bar */}
                <tr>
                  <td style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    padding: '12px',
                    textAlign: 'center',
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      letterSpacing: '0.5px',
                    }}>
                      ✨ POWERED BY CREATORPULSE
                    </p>
                  </td>
                </tr>
              </table>

              {/* Footer Text */}
              <table width="600" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={{ padding: '20px 0', textAlign: 'center' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#9ca3af',
                    }}>
                      © {new Date().getFullYear()} CreatorPulse. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
