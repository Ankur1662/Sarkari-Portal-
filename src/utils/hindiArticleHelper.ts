import { JobNotification } from '../types/job';
import { HindiRecruitmentArticle } from '../types/automation';

export function generatePublicHindiArticle(job: JobNotification): HindiRecruitmentArticle {
  const title = `${job.organization} (${job.shortOrg}) भर्ती अधिसूचना: ${job.vacancies > 0 ? `${job.vacancies.toLocaleString()} पदों पर अवसर, ` : ''}जानें योग्यता, अंतिम तिथि व चयन प्रक्रिया`;
  const slug = `${job.shortOrg.toLowerCase()}-${job.id}-hindi-notification`;

  const importantDatesHindi = [
    { label: 'आवेदन प्रारंभ तिथि', date: job.importantDates.startDate },
    { label: 'आवेदन की अंतिम तिथि (Deadline)', date: job.importantDates.lastDate },
    { label: 'शुल्क भुगतान की अंतिम तिथि', date: job.importantDates.feeLastDate },
    { label: 'परीक्षा तिथि (Exam Date)', date: job.importantDates.examDate },
  ];

  if (job.importantDates.admitCardDate) {
    importantDatesHindi.push({ label: 'प्रवेश पत्र जारी होने की तिथि', date: job.importantDates.admitCardDate });
  }

  const breakdown = job.categoryBreakdown;
  const vacancyDetailsHindi = job.vacancies > 0 
    ? `कुल विज्ञापित पद: ${job.vacancies.toLocaleString()} पद। वर्गवार आरक्षण: अनारक्षित (UR): ${breakdown.ur || 0}, अन्य पिछड़ा वर्ग (OBC): ${breakdown.obc || 0}, ईडब्ल्यूएस (EWS): ${breakdown.ews || 0}, अनुसूचित जाति (SC): ${breakdown.sc || 0}, अनुसूचित जनजाति (ST): ${breakdown.st || 0}।`
    : 'पदों की संख्या एवं आरक्षण आधिकारिक अधिसूचना के अनुसार निर्धारित हैं।';

  const fullMarkdown = `# ${title}

## 1. भर्ती सारांश (Overview)
${job.organization} द्वारा आधिकारिक विज्ञापन संख्या ${job.advtNo} के तहत ${job.title} हेतु अधिसूचना जारी की गई है। इच्छुक एवं योग्य परीक्षार्थी आधिकारिक पोर्टल के माध्यम से अंतिम तिथि ${job.importantDates.lastDate} तक आवेदन कर सकते हैं।

## 2. महत्वपूर्ण तिथियां (Important Dates)
${importantDatesHindi.map(d => `- **${d.label}:** ${d.date}`).join('\n')}

## 3. पदों का विवरण एवं रिक्तियां (Vacancy Details)
${vacancyDetailsHindi}

## 4. शैक्षणिक योग्यता (Eligibility Criteria)
${job.qualification}

## 5. आयु सीमा एवं छूट (Age Limit & Relaxations)
न्यूनतम आयु ${job.ageLimit.min} वर्ष तथा अधिकतम आयु ${job.ageLimit.max} वर्ष (कट-ऑफ तिथि: ${job.ageLimit.asOfDate})। नियमानुसार आरक्षित वर्गों को आयु सीमा में छूट अनुमन्य है: ${job.ageLimit.relaxation}।

## 6. आवेदन शुल्क विवरण (Application Fee)
- सामान्य / ओबीसी / ईडब्ल्यूएस: ₹${job.applicationFee.genObcEws}
- एससी / एसटी / दिव्यांग: ₹${job.applicationFee.scStPh}
- महिला उम्मीदवार: ₹${job.applicationFee.female}
- भुगतान माध्यम: ${job.applicationFee.paymentModes}

## 7. चयन प्रक्रिया (Selection Process)
${job.selectionProcess.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

## 8. वेतनमान (Pay Scale)
${job.payScale}

## 9. आवेदन कैसे करें (How to Apply)
1. आधिकारिक वेबसाइट (${job.officialWebsite}) पर जाएं।
2. आधिकारिक भर्ती विज्ञापन (PDF) डाउनलोड कर ध्यानपूर्वक पढ़ें।
3. ऑनलाइन आवेदन लिंक पर क्लिक कर अपना पंजीकरण पूर्ण करें।
4. व्यक्तिगत व शैक्षणिक विवरण सही-सही भरें।
5. निर्धारित आवेदन शुल्क का ऑनलाइन भुगतान कर पावती प्रिंट करें।

## 10. अस्वीकरण (Disclaimer)
यह भर्ती विवरण परीक्षार्थियों की सुविधा हेतु तैयार किया गया है। नियम, पात्रता व शर्तों की पूर्ण सत्यता के लिए आधिकारिक अधिसूचना अवश्य पढ़ें।`;

  return {
    id: `art-job-${job.id}`,
    title,
    slug,
    metaDescription: `${job.organization} में ${job.title} भर्ती। कुल पद: ${job.vacancies}। आवेदन की अंतिम तिथि: ${job.importantDates.lastDate}। पूरी जानकारी हिंदी में पढ़ें।`,
    overview: `${job.organization} द्वारा आधिकारिक विज्ञापन संख्या ${job.advtNo} के तहत ${job.title} हेतु अधिसूचना जारी की गई है। इच्छुक एवं योग्य परीक्षार्थी आधिकारिक पोर्टल के माध्यम से अंतिम तिथि ${job.importantDates.lastDate} तक आवेदन कर सकते हैं।`,
    importantDatesHindi,
    vacancyDetailsHindi,
    eligibilityCriteriaHindi: job.qualification,
    ageLimitHindi: `न्यूनतम ${job.ageLimit.min} वर्ष एवं अधिकतम ${job.ageLimit.max} वर्ष (कट-ऑफ: ${job.ageLimit.asOfDate})। छूट: ${job.ageLimit.relaxation}`,
    applicationFeeHindi: `सामान्य/ओबीसी/ईडब्ल्यूएस: ₹${job.applicationFee.genObcEws}, एससी/एसटी/दिव्यांग: ₹${job.applicationFee.scStPh}`,
    selectionProcessHindi: job.selectionProcess.join(' → '),
    salaryHindi: job.payScale,
    howToApplyHindi: [
      `सर्वप्रथम आधिकारिक पोर्टल (${job.officialWebsite}) पर जाएं।`,
      'नवीनतम भर्ती विज्ञापन (PDF) डाउनलोड कर पात्रता व नियम पढ़ें।',
      'ऑनलाइन आवेदन पत्र में व्यक्तिगत व शैक्षणिक जानकारी दर्ज करें।',
      'फोटो, हस्ताक्षर एवं आवश्यक प्रमाण पत्र अपलोड करें।',
      'निर्धारित परीक्षा शुल्क का भुगतान कर अंतिम आवेदन पत्र का प्रिंटआउट सुरक्षित रखें।'
    ],
    importantDocumentsHindi: [
      '10वीं / 12वीं की अंकतालिका एवं प्रमाण पत्र',
      'स्नातक / संबंधित योग्यता की डिग्री',
      'वैध फोटो पहचान पत्र (आधार कार्ड/पैन कार्ड)',
      'आरक्षण श्रेणी प्रमाण पत्र (जाति / ईडब्ल्यूएस / दिव्यांगता)'
    ],
    importantLinks: [
      { title: 'आधिकारिक भर्ती अधिसूचना (Official PDF)', url: job.notificationPdfUrl || job.officialWebsite, isOfficial: true },
      { title: 'ऑनलाइन आवेदन पोर्टल (Apply Online)', url: job.applyUrl || job.officialWebsite, isOfficial: true },
      { title: 'आधिकारिक विभाग वेबसाइट', url: job.officialWebsite, isOfficial: true }
    ],
    officialNoticeSource: `Advt No. ${job.advtNo} published by ${job.organization}`,
    faqs: [
      { question: 'आवेदन की अंतिम तिथि क्या है?', answer: `आवेदन की अंतिम तिथि ${job.importantDates.lastDate} है।` },
      { question: 'कुल पदों की संख्या कितनी है?', answer: `कुल ${job.vacancies.toLocaleString()} रिक्त पदों पर भर्ती हो रही है।` },
      { question: 'चयन प्रक्रिया में कौन से चरण शामिल हैं?', answer: job.selectionProcess.join(', ') }
    ],
    disclaimer: 'यह भर्ती विवरण केवल परीक्षार्थियों के मार्गदर्शन हेतु प्रस्तुत किया गया है। किसी भी संशय की स्थिति में आधिकारिक अधिसूचना ही अंतिम रूप से मान्य होगी।',
    fullArticleMarkdown: fullMarkdown,
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
