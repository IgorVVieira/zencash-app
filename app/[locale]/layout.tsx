import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Outfit, DM_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import '../globals.css';
import LocaleLayoutClient from './layout-client';
import ServiceWorkerRegister from '../components/ServiceWorkerRegister';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
});

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: 'hsl(164, 62%, 44%)',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common.metadata' });

  const keywords =
    locale === 'pt-br'
      ? [
          'zencash',
          'zen cash',
          'zencash app',
          'controle de receitas e despesas',
          'app de finanças pessoais',
          'planilha financeira online',
          'categorizar gastos pessoais',
          'importar extrato bancário',
          'aplicativo de controle financeiro',
        ]
      : [
          'zencash',
          'zen cash',
          'zencash app',
          'personal finance app',
          'income and expense tracker',
          'bank statement import',
          'expense categorization',
          'financial management app',
        ];

  return {
    title: `💲 ${t('title')}`,
    description: t('description'),
    keywords,
    verification: {
      google: 'JxzhWCi7TXJKnlFoAeSctJ-8i_M9yVGTeXKer0-SsMY',
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'ZenCash',
    },
    icons: {
      icon: [
        { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'pt-br' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${plusJakartaSans.variable} ${outfit.variable} ${dmMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <LocaleLayoutClient>{children}</LocaleLayoutClient>
          <ServiceWorkerRegister />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
