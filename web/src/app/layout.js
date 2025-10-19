import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'ChefConnect - Private Chef Platform',
  description: 'Connect with top-rated private chefs in South Africa',
}
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://chefconnect.co.za',
    title: 'ChefConnect - Private Chef Platform',
    description: 'Connect with top-rated private chefs in South Africa',
    siteName: 'ChefConnect',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChefConnect - Private Chef Platform',
    description: 'Connect with top-rated private chefs in South Africa',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ChefConnect" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <PaymentProvider>
            <NotificationProvider>
              <ChatProvider>
                <div className="min-h-screen bg-background">
                  <ResponsiveNavigation />
                  <main className="pt-16 sm:pt-18 lg:pt-20">
                    {children}
                  </main>
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        border: '1px solid hsl(var(--border))',
                      },
                    }}
                  />
                </div>
              </ChatProvider>
            </NotificationProvider>
          </PaymentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}