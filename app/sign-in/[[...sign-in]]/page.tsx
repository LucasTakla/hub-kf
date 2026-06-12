import { SignIn } from "@clerk/nextjs";

import { BrandLogo } from "@/components/hub/brand-logo";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-app)" }}>
      <div
        className="hidden w-1/2 flex-col justify-between border-r p-12 lg:flex"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <BrandLogo variant="primary" className="h-9 w-auto max-w-[180px] dark:hidden" />
        <BrandLogo variant="white" className="hidden h-9 w-auto max-w-[180px] dark:block" />

        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Financial operations hub
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Centralize leads, ads, marketing, email, growth, and finance — with
            Kapital Funding as the source of truth.
          </p>
        </div>

        <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          Internal team access only
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 lg:hidden">
          <BrandLogo variant="primary" className="h-9 w-auto max-w-[180px] dark:hidden" />
          <BrandLogo variant="white" className="hidden h-9 w-auto max-w-[180px] dark:block" />
        </div>

        <div
          className="w-full max-w-md rounded-lg border p-8"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-default)",
          }}
        >
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/roadmap"
          />
        </div>
      </div>
    </div>
  );
}
