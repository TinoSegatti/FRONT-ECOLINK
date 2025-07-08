"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import { useAuthContext } from "../../contexts/AuthContext";
import React, { Suspense } from "react";


function ResetPasswordPageContent() {
  useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="alert alert-danger">Token inválido</div>
            <div className="text-center">
              <Link href="/login" className="btn btn-link">
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    router.push("/login");
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <ResetPasswordForm token={token} onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}