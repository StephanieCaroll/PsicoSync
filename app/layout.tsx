// src/app/layout.tsx
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PsicoSync | Dra. Tatiane de Oliveira",
  description: "Sistema de Gestão Clínica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body style={{ backgroundColor: '#f4f7f6' }}>
        {children}
      </body>
    </html>
  );
}