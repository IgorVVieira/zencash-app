import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LandingPage from './landing-page';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zencash.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isPtBr = locale === 'pt-br';

  const title = isPtBr
    ? 'ZenCash – Controle Financeiro com IA | Importe seu Extrato OFX'
    : 'ZenCash – AI-Powered Personal Finance | Import your OFX Statement';

  const description = isPtBr
    ? 'Importe seu extrato bancário OFX, categorize transações automaticamente com IA e veja para onde vai cada centavo. Plano Pro por R$19,90/mês via PIX.'
    : 'Import your OFX bank statement, auto-categorize transactions with AI and see where every penny goes. Pro plan for R$19.90/month via PIX.';

  const url = `${SITE_URL}/${locale}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    keywords: isPtBr
      ? ['controle financeiro', 'importar extrato OFX', 'categorização automática IA', 'finanças pessoais', 'gestão financeira', 'app financeiro']
      : ['personal finance', 'import OFX statement', 'AI auto-categorization', 'financial management', 'expense tracker'],
    alternates: {
      canonical: url,
      languages: {
        'pt-BR': `${SITE_URL}/pt-br`,
        en: `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'ZenCash',
      locale: isPtBr ? 'pt_BR' : 'en_US',
      alternateLocale: isPtBr ? 'en_US' : 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isPtBr = locale === 'pt-br';
  const t = await getTranslations({ locale, namespace: 'landing' });

  const faqItems = t.raw('faq.items') as { q: string; a: string }[];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ZenCash',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description: isPtBr
      ? 'Aplicativo de controle financeiro com importação de extrato OFX e categorização automática por IA.'
      : 'Personal finance app with OFX statement import and AI auto-categorization.',
    offers: {
      '@type': 'Offer',
      price: '19.90',
      priceCurrency: 'BRL',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '19.90',
        priceCurrency: 'BRL',
        unitCode: 'MON',
      },
    },
    inLanguage: isPtBr ? 'pt-BR' : 'en',
    url: `${SITE_URL}/${locale}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <LandingPage />
    </>
  );
}
