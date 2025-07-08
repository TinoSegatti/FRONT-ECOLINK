import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { AuthProvider } from "../contexts/AuthContext"
import Navbar from "../components/Navbar"
import AuthErrorHandler from "../components/auth/AuthErrorHandler"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gestión de Clientes - ECOLINK",
  description: "Sistema de gestión de clientes con autenticación por roles",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="d-flex flex-column min-vh-100">
          <AuthProvider>
            <AuthErrorHandler />
            <Navbar />
            <main className="flex-grow-1">{children}</main>
            <footer className="mt-auto py-4 bg-dark text-white">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-6">
                    <h6 style={{ color: "#7ac943" }}>ECOLINK</h6>
                    <p className="mb-0 opacity-75">Sistema de gestión de clientes moderno y eficiente</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <small className="opacity-75">© 2024 ECOLINK. Todos los derechos reservados.</small>
                  </div>
                </div>
              </div>
            </footer>
          </AuthProvider>
        </div>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" />
      </body>
    </html>
  )
}
