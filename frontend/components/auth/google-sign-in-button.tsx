"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = {
  credential: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: { theme: "outline"; size: "large"; width: number },
          ) => void;
        };
      };
    };
  }
}

type GoogleSignInButtonProps = {
  onCredential: (credential: string) => void;
  disabled?: boolean;
};

export function GoogleSignInButton({
  onCredential,
  disabled = false,
}: GoogleSignInButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const element = buttonRef.current;
    const google = window.google;
    if (!scriptLoaded || !clientId || !element || !google) return;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => onCredential(credential),
    });
    google.accounts.id.renderButton(element, {
      theme: "outline",
      size: "large",
      width: Math.min(element.clientWidth, 400),
    });
  }, [clientId, onCredential, scriptLoaded]);

  if (!clientId) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div
        ref={buttonRef}
        aria-disabled={disabled}
        className={`w-full${disabled ? " pointer-events-none opacity-60" : ""}`}
      />
    </>
  );
}
