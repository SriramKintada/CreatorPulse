export interface CuratedSource {
  name: string
  url: string
  type: 'newsletter_rss' | 'youtube' | 'twitter' | 'reddit' | 'custom_url'
  description: string
}

export interface DomainCategory {
  id: string
  name: string
  icon: string
  description: string
  sources: CuratedSource[]
}

export const CURATED_SOURCES: DomainCategory[] = [
  {
    id: 'tech-dev',
    name: 'Tech & Development',
    icon: '💻',
    description: 'Latest in software development, web technologies, and programming',
    sources: [
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        type: 'newsletter_rss',
        description: 'Breaking tech news and startup coverage'
      },
      {
        name: 'Hacker News',
        url: 'https://hnrss.org/frontpage',
        type: 'newsletter_rss',
        description: 'Tech community discussions and news'
      },
      {
        name: 'Dev.to',
        url: 'https://dev.to/feed',
        type: 'newsletter_rss',
        description: 'Developer community articles'
      },
      {
        name: 'The Verge',
        url: 'https://www.theverge.com/rss/index.xml',
        type: 'newsletter_rss',
        description: 'Tech, science, and culture news'
      },
      {
        name: 'Ars Technica',
        url: 'https://feeds.arstechnica.com/arstechnica/index',
        type: 'newsletter_rss',
        description: 'In-depth tech journalism'
      },
      {
        name: 'CSS Tricks',
        url: 'https://css-tricks.com/feed/',
        type: 'newsletter_rss',
        description: 'Web design and development tips'
      },
      {
        name: 'Smashing Magazine',
        url: 'https://www.smashingmagazine.com/feed/',
        type: 'newsletter_rss',
        description: 'Web design and UX articles'
      },
      {
        name: 'Fireship',
        url: 'https://www.youtube.com/@Fireship',
        type: 'youtube',
        description: 'High-intensity code tutorials'
      },
      {
        name: 'Theo - t3.gg',
        url: 'https://www.youtube.com/@t3dotgg',
        type: 'youtube',
        description: 'Full-stack development insights'
      },
      {
        name: 'Web Dev Simplified',
        url: 'https://www.youtube.com/@WebDevSimplified',
        type: 'youtube',
        description: 'Simple web dev tutorials'
      },
      {
        name: 'Vercel',
        url: 'https://www.youtube.com/@VercelHQ',
        type: 'youtube',
        description: 'Next.js and web platform updates'
      },
      {
        name: 'r/programming',
        url: 'https://reddit.com/r/programming',
        type: 'reddit',
        description: 'Programming discussions'
      },
      {
        name: 'r/webdev',
        url: 'https://reddit.com/r/webdev',
        type: 'reddit',
        description: 'Web development community'
      },
      {
        name: 'r/reactjs',
        url: 'https://reddit.com/r/reactjs',
        type: 'reddit',
        description: 'React.js discussions'
      },
      {
        name: 'r/nextjs',
        url: 'https://reddit.com/r/nextjs',
        type: 'reddit',
        description: 'Next.js community'
      },
      {
        name: 'r/typescript',
        url: 'https://reddit.com/r/typescript',
        type: 'reddit',
        description: 'TypeScript discussions'
      },
      {
        name: 'Better Programming',
        url: 'https://medium.com/feed/better-programming',
        type: 'newsletter_rss',
        description: 'Programming best practices'
      }
    ]
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    icon: '🤖',
    description: 'Artificial intelligence, machine learning, and data science',
    sources: [
      {
        name: 'OpenAI Blog',
        url: 'https://openai.com/blog/rss.xml',
        type: 'newsletter_rss',
        description: 'Latest from OpenAI research'
      },
      {
        name: 'Google AI Blog',
        url: 'https://blog.google/technology/ai/rss/',
        type: 'newsletter_rss',
        description: 'Google AI research and updates'
      },
      {
        name: 'Towards Data Science',
        url: 'https://towardsdatascience.com/feed',
        type: 'newsletter_rss',
        description: 'Data science and ML articles'
      },
      {
        name: 'Google for Developers',
        url: 'https://www.youtube.com/@GoogleDevelopers',
        type: 'youtube',
        description: 'Google developer tools and AI'
      },
      {
        name: 'r/MachineLearning',
        url: 'https://reddit.com/r/MachineLearning',
        type: 'reddit',
        description: 'ML research and discussions'
      },
      {
        name: 'Anthropic AI',
        url: 'https://twitter.com/AnthropicAI',
        type: 'twitter',
        description: 'Claude AI updates'
      },
      {
        name: 'OpenAI',
        url: 'https://twitter.com/OpenAI',
        type: 'twitter',
        description: 'ChatGPT and GPT updates'
      }
    ]
  },
  {
    id: 'business-startups',
    name: 'Business & Startups',
    icon: '🚀',
    description: 'Entrepreneurship, startups, and business insights',
    sources: [
      {
        name: 'Product Hunt',
        url: 'https://www.producthunt.com/feed',
        type: 'newsletter_rss',
        description: 'New product launches daily'
      },
      {
        name: 'Y Combinator',
        url: 'https://news.ycombinator.com/rss',
        type: 'newsletter_rss',
        description: 'Startup news and discussions'
      },
      {
        name: 'First Round Review',
        url: 'https://review.firstround.com/rss',
        type: 'newsletter_rss',
        description: 'Startup advice and insights'
      },
      {
        name: 'r/startups',
        url: 'https://reddit.com/r/startups',
        type: 'reddit',
        description: 'Startup community discussions'
      },
      {
        name: 'The Startup',
        url: 'https://medium.com/feed/swlh',
        type: 'newsletter_rss',
        description: 'Entrepreneurship articles'
      }
    ]
  },
  {
    id: 'web3-crypto',
    name: 'Web3 & Crypto',
    icon: '₿',
    description: 'Blockchain, cryptocurrency, and decentralized technologies',
    sources: [
      {
        name: 'CoinDesk',
        url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
        type: 'newsletter_rss',
        description: 'Crypto news and analysis'
      },
      {
        name: 'The Block',
        url: 'https://www.theblock.co/rss.xml',
        type: 'newsletter_rss',
        description: 'Blockchain industry news'
      },
      {
        name: 'r/cryptocurrency',
        url: 'https://reddit.com/r/cryptocurrency',
        type: 'reddit',
        description: 'Crypto community discussions'
      },
      {
        name: 'r/ethereum',
        url: 'https://reddit.com/r/ethereum',
        type: 'reddit',
        description: 'Ethereum ecosystem'
      }
    ]
  },
  {
    id: 'design-ux',
    name: 'Design & UX',
    icon: '🎨',
    description: 'UI/UX design, product design, and creative inspiration',
    sources: [
      {
        name: 'UX Collective',
        url: 'https://medium.com/feed/uxdesigncollective',
        type: 'newsletter_rss',
        description: 'UX design articles'
      },
      {
        name: 'Smashing Magazine',
        url: 'https://www.smashingmagazine.com/feed/',
        type: 'newsletter_rss',
        description: 'Web design and UX'
      },
      {
        name: 'r/web_design',
        url: 'https://reddit.com/r/web_design',
        type: 'reddit',
        description: 'Web design community'
      },
      {
        name: 'r/UI_Design',
        url: 'https://reddit.com/r/UI_Design',
        type: 'reddit',
        description: 'UI design discussions'
      }
    ]
  },
  {
    id: 'devtools',
    name: 'Developer Tools',
    icon: '🛠️',
    description: 'Frameworks, libraries, and developer platforms',
    sources: [
      {
        name: 'Vercel',
        url: 'https://twitter.com/vercel',
        type: 'twitter',
        description: 'Next.js and Vercel updates'
      },
      {
        name: 'Next.js',
        url: 'https://twitter.com/nextjs',
        type: 'twitter',
        description: 'Next.js framework updates'
      },
      {
        name: 'Supabase',
        url: 'https://twitter.com/supabase',
        type: 'twitter',
        description: 'Supabase platform updates'
      },
      {
        name: 'Tailwind CSS',
        url: 'https://twitter.com/tailwindcss',
        type: 'twitter',
        description: 'Tailwind CSS updates'
      }
    ]
  },
  {
    id: 'finance',
    name: 'Finance & Markets',
    icon: '💰',
    description: 'Financial news, investing, and market analysis',
    sources: [
      {
        name: 'Bloomberg',
        url: 'https://feeds.bloomberg.com/markets/news.rss',
        type: 'newsletter_rss',
        description: 'Financial markets news'
      },
      {
        name: 'Financial Times',
        url: 'https://www.ft.com/?format=rss',
        type: 'newsletter_rss',
        description: 'Global business news'
      },
      {
        name: 'r/investing',
        url: 'https://reddit.com/r/investing',
        type: 'reddit',
        description: 'Investment discussions'
      },
      {
        name: 'r/personalfinance',
        url: 'https://reddit.com/r/personalfinance',
        type: 'reddit',
        description: 'Personal finance advice'
      }
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medicine',
    icon: '⚕️',
    description: 'Medical research, healthcare innovation, and wellness',
    sources: [
      {
        name: 'STAT News',
        url: 'https://www.statnews.com/feed/',
        type: 'newsletter_rss',
        description: 'Health and medicine news'
      },
      {
        name: 'Nature Medicine',
        url: 'https://www.nature.com/nm.rss',
        type: 'newsletter_rss',
        description: 'Medical research'
      },
      {
        name: 'r/medicine',
        url: 'https://reddit.com/r/medicine',
        type: 'reddit',
        description: 'Medical professionals community'
      },
      {
        name: 'r/health',
        url: 'https://reddit.com/r/health',
        type: 'reddit',
        description: 'Health discussions'
      }
    ]
  },
  {
    id: 'science',
    name: 'Science & Research',
    icon: '🔬',
    description: 'Scientific discoveries, research, and innovation',
    sources: [
      {
        name: 'Science Daily',
        url: 'https://www.sciencedaily.com/rss/all.xml',
        type: 'newsletter_rss',
        description: 'Latest science news'
      },
      {
        name: 'Nature',
        url: 'https://www.nature.com/nature.rss',
        type: 'newsletter_rss',
        description: 'Scientific research'
      },
      {
        name: 'r/science',
        url: 'https://reddit.com/r/science',
        type: 'reddit',
        description: 'Science discussions'
      },
      {
        name: 'r/Futurology',
        url: 'https://reddit.com/r/Futurology',
        type: 'reddit',
        description: 'Future technologies'
      }
    ]
  },
  {
    id: 'productivity',
    name: 'Productivity & Work',
    icon: '⚡',
    description: 'Productivity tips, remote work, and career advice',
    sources: [
      {
        name: 'r/productivity',
        url: 'https://reddit.com/r/productivity',
        type: 'reddit',
        description: 'Productivity tips and tools'
      },
      {
        name: 'r/GetMotivated',
        url: 'https://reddit.com/r/GetMotivated',
        type: 'reddit',
        description: 'Motivation and inspiration'
      },
      {
        name: 'r/careerguidance',
        url: 'https://reddit.com/r/careerguidance',
        type: 'reddit',
        description: 'Career advice'
      }
    ]
  }
]
