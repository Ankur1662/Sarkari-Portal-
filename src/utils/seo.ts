import { JobNotification } from '../types/job';

export const SITE_ORIGIN = 'https://sarkariportal.ai.studio';

export interface SEOData {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  schema?: Record<string, any>[];
  noIndex?: boolean;
}

/**
 * Returns clean ISO string or undefined
 */
function parseValidThrough(dateStr?: string): string | undefined {
  if (!dateStr || dateStr.toLowerCase().includes('not') || dateStr.toLowerCase().includes('see')) {
    return undefined;
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      // Set to 23:59:59 of that date
      d.setHours(23, 59, 59, 999);
      return d.toISOString();
    }
  } catch {
    // fallback
  }
  return undefined;
}

/**
 * Generates SEO metadata for any route or individual job detail page
 */
export function getRouteSEO(pathname: string, job?: JobNotification | null): SEOData {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  // 1. Job Detail Page
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

    let pageTitle = `${job.title} — Recruitment, Vacancies & Apply Online | SarkariPortal`;
    let pageDesc = `Apply online for ${job.title} (${job.organization}). ${job.vacancies > 0 ? `${job.vacancies.toLocaleString()} vacancies announced.` : ''} Eligibility: ${job.qualification}. Last Date: ${job.importantDates.lastDate}. Verified official details.`;

    if (isResult) {
      pageTitle = `${job.title} Result & Cut-Off Out — Check Scorecard | SarkariPortal`;
      pageDesc = `Official result and merit list declared for ${job.title} (${job.organization}). Check cut-off marks, scorecards, and next selection stages.`;
    } else if (isAdmit) {
      pageTitle = `${job.title} Admit Card 2026 — Download Hall Ticket | SarkariPortal`;
      pageDesc = `Download official admit card and hall ticket for ${job.title} (${job.organization}). Exam Date: ${job.importantDates.examDate || 'Announced'}. Direct verified download link.`;
    } else if (isAnswerKey) {
      pageTitle = `${job.title} Answer Key 2026 — Question Paper & Key | SarkariPortal`;
      pageDesc = `Official answer key and objection link for ${job.title} (${job.organization}). Check provisional keys and calculate exam scores.`;
    }

    const canonicalUrl = `${SITE_ORIGIN}/job/${job.id}`;

    // Schema structures:
    const schemas: Record<string, any>[] = [
      // Breadcrumbs
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_ORIGIN}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: catLabel,
            item: `${SITE_ORIGIN}/${job.categoryType}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: job.title,
            item: canonicalUrl,
          },
        ],
      },
    ];

    // JobPosting Schema ONLY for active recruitment jobs (Never for closed or results)
    if (!isClosed && !isResult && !isAnswerKey) {
      const validThrough = parseValidThrough(job.importantDates?.lastDate);
      const datePosted = parseValidThrough(job.importantDates?.startDate) || new Date().toISOString();

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: `<p><strong>${job.organization} (${job.shortOrg})</strong> has released the official recruitment notification for <strong>${job.postName}</strong> (Advt No: ${job.advtNo}).</p><p><strong>Total Vacancies:</strong> ${job.vacancies > 0 ? job.vacancies.toLocaleString() : 'As per official notification'}.</p><p><strong>Educational Qualification:</strong> ${job.qualification}.</p><p><strong>Age Limit:</strong> ${job.ageLimit.min} to ${job.ageLimit.max} years.</p><p><strong>Pay Scale:</strong> ${job.payScale}.</p><p><strong>Selection Process:</strong> ${job.selectionProcess.join(', ')}.</p>`,
        datePosted: datePosted.split('T')[0],
        ...(validThrough ? { validThrough: validThrough.split('T')[0] } : {}),
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
        experienceRequirements: 'Freshers and Experienced as per gazette rules',
        industry: job.sectorName,
      });
    }

    return {
      title: pageTitle,
      description: pageDesc,
      canonicalUrl,
      ogType: 'article',
      schema: schemas,
    };
  }

  // 2. Category Pages
  if (cleanPath === '/latest-jobs') {
    return {
      title: 'Latest Sarkari Jobs 2026 — Central & State Govt Recruitment Notifications',
      description: 'Explore verified latest government jobs, vacancies, application deadlines, and direct apply links across UPSC, SSC, Railways, Banking, and Defence.',
      canonicalUrl: `${SITE_ORIGIN}/latest-jobs`,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Latest Jobs', item: `${SITE_ORIGIN}/latest-jobs` },
          ],
        },
      ],
    };
  }

  if (cleanPath === '/results') {
    return {
      title: 'Sarkari Results 2026 — Latest Government Exam Cut-Offs & Scorecards',
      description: 'Check latest Sarkari exam results, merit lists, scorecards, and category-wise cut-off marks for UPSC, SSC, Railways, Banking, and State PSC recruitments.',
      canonicalUrl: `${SITE_ORIGIN}/results`,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Results', item: `${SITE_ORIGIN}/results` },
          ],
        },
      ],
    };
  }

  if (cleanPath === '/admit-card') {
    return {
      title: 'Sarkari Admit Card 2026 — Download Hall Tickets & Exam Dates',
      description: 'Download official admit cards, exam city slips, and call letters for Central and State government recruitment examinations in India.',
      canonicalUrl: `${SITE_ORIGIN}/admit-card`,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Admit Card', item: `${SITE_ORIGIN}/admit-card` },
          ],
        },
      ],
    };
  }

  if (cleanPath === '/answer-key') {
    return {
      title: 'Sarkari Answer Key 2026 — Official Question Papers & Answer Keys',
      description: 'Download provisional and final answer keys, raise online objections, and calculate official scores for government examinations.',
      canonicalUrl: `${SITE_ORIGIN}/answer-key`,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Answer Key', item: `${SITE_ORIGIN}/answer-key` },
          ],
        },
      ],
    };
  }

  if (cleanPath === '/syllabus') {
    return {
      title: 'Sarkari Syllabus 2026 — Exam Pattern, Topics & Selection Process',
      description: 'Complete syllabus and exam pattern PDFs for UPSC, SSC, Banking, Railway, and State government recruitment examinations.',
      canonicalUrl: `${SITE_ORIGIN}/syllabus`,
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Syllabus', item: `${SITE_ORIGIN}/syllabus` },
          ],
        },
      ],
    };
  }

  // 3. Homepage Default
  return {
    title: 'SarkariPortal — Latest Government Jobs, Results & Admit Cards',
    description: 'Find government job notifications, eligibility details, exam results, admit cards, answer keys, and official application links on SarkariPortal.',
    canonicalUrl: `${SITE_ORIGIN}/`,
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'SarkariPortal',
        url: `${SITE_ORIGIN}/`,
        description: 'Find government job notifications, eligibility details, exam results, admit cards, answer keys, and official application links on SarkariPortal.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_ORIGIN}/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SarkariPortal',
        url: `${SITE_ORIGIN}/`,
        description: "India's premier public recruitment notification engine for Central and State Government examinations.",
        sameAs: ['https://t.me', 'https://whatsapp.com/channel'],
      },
    ],
  };
}

/**
 * Updates DOM head tags dynamically in the browser
 */
export function updateDOMHead(seo: SEOData): void {
  if (typeof document === 'undefined') return;

  // Title
  document.title = seo.title;

  // Helper to get or create tag
  const setMetaTag = (attrName: string, attrVal: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard Meta
  setMetaTag('name', 'description', seo.description);
  setMetaTag('name', 'robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow');

  // Open Graph
  setMetaTag('property', 'og:title', seo.title);
  setMetaTag('property', 'og:description', seo.description);
  setMetaTag('property', 'og:url', seo.canonicalUrl);
  setMetaTag('property', 'og:type', seo.ogType || 'website');
  setMetaTag('property', 'og:site_name', 'SarkariPortal');

  // Twitter Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', seo.title);
  setMetaTag('name', 'twitter:description', seo.description);

  // Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', seo.canonicalUrl);

  // JSON-LD Structured Data
  const existingScripts = document.querySelectorAll('script[data-seo-jsonld="true"]');
  existingScripts.forEach((s) => s.remove());

  if (seo.schema && seo.schema.length > 0) {
    seo.schema.forEach((schemaObj, idx) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.setAttribute('data-seo-idx', String(idx));
      script.textContent = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    });
  }
}
