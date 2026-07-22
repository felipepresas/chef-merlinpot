"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-display text-2xl font-semibold text-ink">Algo se nos quemó</h1>
      <p className="mt-2 text-sm text-ink/60">
        Ha ocurrido un error inesperado. Vuelve a intentarlo.
      </p>
      <Button onClick={reset} className="mt-8">
        <RotateCw className="h-4 w-4" /> Reintentar
      </Button>
    </main>
  );
}
