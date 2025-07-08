"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthContext } from "../../contexts/AuthContext";
import EmailVerification from "../../components/auth/EmailVerification";
import React, { Suspense } from "react";

function VerificarEmailPageContent() {
  const searchParams = useSearchParams();
  const { verificarEmail } = useAuthContext();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado");
      return;
    }

    const verificar = async () => {
      hasVerified.current = true;
      try {
        const result = await verificarEmail(token);
        if (result.success) {
          setStatus("success");
          setMessage(result.message);
          setTimeout(() => router.push("/clientes"), 2000);
        } else {
          setStatus("error");
          setMessage(result.message);
        }
      } catch {
        setStatus("error");
        setMessage("Error de conexión");
      }
    };

    verificar();
  }, [searchParams, verificarEmail, router]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <EmailVerification status={status} message={message} />
        </div>
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerificarEmailPageContent />
    </Suspense>
  );
}