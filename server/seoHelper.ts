import { db } from './db';
import { JobNotification } from '../src/types/job';

const SITE_ORIGIN = 'https://sarkariportal.ai.studio';

/**
 * Generates dynamic XML Sitemap containing all canonical public URLs and active jobs
 */
export function generateSitemapXml(): string {
  const jobs: JobNotification[] = db.getJobs();
  const today = new Date().toISOString().split('T')[0];

  const coreRoutes = [
    { url: `${SITE_ORIGIN}/`, changefreq: 'daily', priority: '1.0', lastmod: today },
    { url: `${SITE_ORIGIN}/latest-jobs`, changefreq: 'hourly', priority: '0.9', lastmod: today },
    { url: `${SITE_ORIGIN}/results`, changefreq: 'hourly', priority: '0.9', lastmod: today },
    { url: `${SITE_ORIGIN}/admit-card`, changefreq: 'hourly', priority: '0.9', lastmod: today },
    { url: `${SITE_ORIGIN}/answer-key`, changefreq: 'daily', priority: '0.8', lastmod: today },
    { url: `${SITE_ORIGIN}/syllabus`, changefreq: 'weekly', priority: '0.7', lastmod: today },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Core public routes
  for (const route of coreRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${route.url}</loc>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Individual Job Detail Pages
  for (const job of jobs) {
    // Only index valid jobs
    if (!job.id) continue;
    const lastmod = job.datePosted ? job.datePosted.split('T')[0] : today;
    const priority = job.isHot || job.isUrgent ? '0.85' : '0.8';

    xml += `  <url>\n`;
    xml += `    <loc>${SITE_ORIGIN}/job/${encodeURIComponent(job.id)}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Injects page-specific SEO meta tags and JSON-LD structured data into index.html
 */
export function injectSeoIntoHtml(html: string, pathname: string): string {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const jobs: JobNotification[] = db.getJobs();

  // Match /job/:id
  const jobMatch = cleanPath.match(/^\/job\/([^/]+)/);
  let job: JobNotification | undefined;
  if (jobMatch) {
    const jobId = decodeURIComponent(jobMatch[1]);
    job = jobs.find((j) => j.id === jobId);
  }

  let title = 'SarkariPortal - Latest Government Jobs, Results & Admit Cards';
  let description = 'Find government job notifications, eligibility details, exam results, admit cards, answer keys, and official application links on SarkariPortal.';
  let canonicalUrl = `${SITE_ORIGIN}/`;
  let ogType = 'website';
  const schemas: Record<string, any>[] = [];

  if (job) {
    const isClosed = (job.status as string) === 'Closed';
    const isResult = job.categoryType === 'results' || job.status === 'Result Declared';
    const isAdmit = job.categoryType === 'admit-card' || job.status === 'Admit Card Available';
    const isAnswerKey = job.categoryType === 'answer-key';

    const categoryLabels: Record<string, string> = {
      'latest-jobs': 'Latest Jobs',
      'results': 'Results',
      'admit-card': 'Admit Card',
      'answer-key': 'Answer Key',
      'syllabus': 'Syllabus',
    };
    const catLabel = categoryLabels[job.categoryType] || 'Jobs';

    if (isResult) {
      title = `${job.title} Result & Cut-Off Out — Check Scorecard | SarkariPortal`;
      description = `Official result and merit list declared for ${job.title} (${job.organization}). Check cut-off marks, scorecards, and next selection stages.`;
    } else if (isAdmit) {
      title = `${job.title} Admit Card 2026 — Download Hall Ticket | SarkariPortal`;
      description = `Download official admit card and hall ticket for ${job.title} (${job.organization}). Exam Date: ${job.importantDates.examDate || 'Announced'}. Direct verified download link.`;
    } else if (isAnswerKey) {
      title = `${job.title} Answer Key 2026 — Question Paper & Key | SarkariPortal`;
      description = `Official answer key and objection link for ${job.title} (${job.organization}). Check provisional keys and calculate exam scores.`;
    } else {
      title = `${job.title} — Recruitment, Vacancies & Apply Online | SarkariPortal`;
      description = `Apply online for ${job.title} (${job.organization}). ${job.vacancies > 0 ? `${job.vacancies.toLocaleString()} vacancies announced.` : ''} Eligibility: ${job.qualification}. Last Date: ${job.importantDates.lastDate}. Verified official details.`;
    }

    canonicalUrl = `${SITE_ORIGIN}/job/${job.id}`;
    ogType = 'article';

    // Breadcrumbs
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: catLabel, item: `${SITE_ORIGIN}/${job.categoryType}` },
        { '@type': 'ListItem', position: 3, name: job.title, item: canonicalUrl },
      ],
    });

    // JobPosting Schema ONLY for active non-closed non-result recruitment postings
    if (!isClosed && !isResult && !isAnswerKey) {
      const validThrough = job.importantDates?.lastDate && !job.importantDates.lastDate.toLowerCase().includes('not')
        ? new Date(job.importantDates.lastDate).toISOString().split('T')[0]
        : undefined;
      const datePosted = job.importantDates?.startDate && !job.importantDates.startDate.toLowerCase().includes('not')
        ? new Date(job.importantDates.startDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: `<p><strong>${job.organization}</strong> recruitment notification for <strong>${job.postName}</strong> (Advt: ${job.advtNo}). Total Vacancies: ${job.vacancies}. Educational Qualification: ${job.qualification}.</p>`,
        datePosted,
        ...(validThrough ? { validThrough } : {}),
        employmentType: 'FULL_TIME',
        hiringOrganization: {
          '@type': 'Organization',
          name: job.organization,
          sameAs: job.officialWebsite || undefined,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressRegion: job.state === 'All India' ? 'India' : job.state,
            addressCountry: 'IN',
          },
        },
        directApply: Boolean(job.applyUrl),
        educationRequirements: job.qualification,
        industry: job.sectorName,
      });
    }
  } else if (cleanPath === '/latest-jobs') {
    title = 'Latest Sarkari Jobs 2026 — Central & State Govt Recruitment Notifications';
    description = 'Explore verified latest government jobs, vacancies, application deadlines, and direct apply links across UPSC, SSC, Railways, Banking, and Defence.';
    canonicalUrl = `${SITE_ORIGIN}/latest-jobs`;
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Latest Jobs', item: `${SITE_ORIGIN}/latest-jobs` },
      ],
    });
  } else if (cleanPath === '/results') {
    title = 'Sarkari Results 2026 — Latest Government Exam Cut-Offs & Scorecards';
    description = 'Check latest Sarkari exam results, merit lists, scorecards, and category-wise cut-off marks for UPSC, SSC, Railways, Banking, and State PSC recruitments.';
    canonicalUrl = `${SITE_ORIGIN}/results`;
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Results', item: `${SITE_ORIGIN}/results` },
      ],
    });
  } else if (cleanPath === '/admit-card') {
    title = 'Sarkari Admit Card 2026 — Download Hall Tickets & Exam Dates';
    description = 'Download official admit cards, exam city slips, and call letters for Central and State government recruitment examinations in India.';
    canonicalUrl = `${SITE_ORIGIN}/admit-card`;
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Admit Card', item: `${SITE_ORIGIN}/admit-card` },
      ],
    });
  } else if (cleanPath === '/answer-key') {
    title = 'Sarkari Answer Key 2026 — Official Question Papers & Answer Keys';
    description = 'Download provisional and final answer keys, raise online objections, and calculate official scores for government examinations.';
    canonicalUrl = `${SITE_ORIGIN}/answer-key`;
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Answer Key', item: `${SITE_ORIGIN}/answer-key` },
      ],
    });
  } else if (cleanPath === '/syllabus') {
    title = 'Sarkari Syllabus 2026 — Exam Pattern, Topics & Selection Process';
    description = 'Complete syllabus and exam pattern PDFs for UPSC, SSC, Banking, Railway, and State government recruitment examinations.';
    canonicalUrl = `${SITE_ORIGIN}/syllabus`;
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Syllabus', item: `${SITE_ORIGIN}/syllabus` },
      ],
    });
  } else {
    // Default Homepage schemas
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SarkariPortal',
      url: `${SITE_ORIGIN}/`,
      description,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_ORIGIN}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    });
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SarkariPortal',
      url: `${SITE_ORIGIN}/`,
      description: "India's premier public recruitment notification engine for Central and State Government examinations.",
      sameAs: ['https://t.me', 'https://whatsapp.com/channel'],
    });
  }

  // Replace Title
  let modified = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  // Replace or inject Meta Description
  if (modified.includes('name="description"')) {
    modified = modified.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${description}" />`);
  } else {
    modified = modified.replace('</head>', `  <meta name="description" content="${description}" />\n  </head>`);
  }

  // Canonical tag
  if (modified.includes('rel="canonical"')) {
    modified = modified.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    modified = modified.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
  }

  // Open Graph and Twitter
  modified = modified
    .replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`)
    .replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="${ogType}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${description}" />`);

  // Replace schemas
  const schemaScripts = schemas.map(s => `  <script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n  </script>`).join('\n');
  
  // Strip existing ld+json from raw HTML template and insert our page-specific schemas
  modified = modified.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
  modified = modified.replace('</head>', `${schemaScripts}\n  </head>`);

  return modified;
}
