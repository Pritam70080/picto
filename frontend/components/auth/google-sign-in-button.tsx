"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

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
            options: {
              theme: "outline" | "filled_black";
              size: "large";
              shape: "pill";
              width: number;
            },
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

let activeCredentialHandler: GoogleSignInButtonProps["onCredential"] | undefined;
let initializedClientId: string | undefined;

export function GoogleSignInButton({
  onCredential,
  disabled = false,
}: GoogleSignInButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const { resolvedTheme } = useTheme();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    activeCredentialHandler = onCredential;
    return () => {
      if (activeCredentialHandler === onCredential) {
        activeCredentialHandler = undefined;
      }
    };
  }, [onCredential]);

  useEffect(() => {
    const google = window.google;
    if (!scriptLoaded || !clientId || !google || initializedClientId === clientId) return;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => activeCredentialHandler?.(credential),
    });
    initializedClientId = clientId;
  }, [clientId, scriptLoaded]);

  useEffect(() => {
    const element = buttonRef.current;
    const google = window.google;
    if (!scriptLoaded || !clientId || !element || !google) return;

    let renderedWidth = 0;
    const renderButton = () => {
      const width = Math.floor(element.getBoundingClientRect().width);
      if (!width || width === renderedWidth) return;

      renderedWidth = width;
      element.replaceChildren();
      google.accounts.id.renderButton(element, {
        theme: resolvedTheme === "dark" ? "filled_black" : "outline",
        size: "large",
        shape: "pill",
        width,
      });
    };

    renderButton();
    const observer = new ResizeObserver(renderButton);
    observer.observe(element);
    return () => observer.disconnect();
  }, [clientId, resolvedTheme, scriptLoaded]);

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
