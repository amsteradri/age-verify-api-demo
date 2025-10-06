import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Telefónica Open Gateway - Demo de Verificación de Edad',
  description: 'Demostración de la API de verificación de edad usando Telefónica Open Gateway',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#FFFFFF',
              color: '#374151',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            success: {
              duration: 2500,
              iconTheme: {
                primary: '#00A650',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#E60000',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}