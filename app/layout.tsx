import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teste Educacional",
  description: "Aplicacao web para realizacao de testes educacionais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
