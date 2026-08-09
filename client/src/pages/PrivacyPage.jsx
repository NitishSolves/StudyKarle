import React from "react";

const sections = [
  {
    title: "Information We Collect",
    body: "We collect the information you provide when creating an account, such as your name, email address, and academic details like your course and current year. We also collect basic usage data, including which notes and subjects you view, to help us improve the platform.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is used to provide and maintain your account, personalize your dashboard, respond to support requests, and improve the quality and organization of academic resources on StudyKarle.",
  },
  {
    title: "Data Sharing",
    body: "We do not sell your personal information. Data is only shared with trusted service providers (such as hosting and file storage) strictly to operate the platform, and never for advertising purposes.",
  },
  {
    title: "Cookies & Sessions",
    body: "StudyKarle uses a secure, HTTP-only session cookie to keep you signed in. We do not use third-party tracking cookies.",
  },
  {
    title: "Data Security",
    body: "We take reasonable technical and organizational measures to protect your data, including encrypted password storage and secure connections. No method of transmission over the internet is 100% secure, but we work to protect your information.",
  },
  {
    title: "Your Rights",
    body: "You can view and update your profile information at any time from your account settings. To request deletion of your account or data, please contact us at nikusi099@gmail.com.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Continued use of StudyKarle after changes are posted constitutes acceptance of the updated policy.",
  },
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="text-center mb-12">
      <p className="text-text-secondary uppercase tracking-widest">{eyebrow}</p>
      <h1 className="text-headline-lg font-headline-lg mt-2">{title}</h1>
      {description ? (
        <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary py-20">
      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Legal"
          title="Privacy Policy"
          description="Last updated: July 2026. This page explains what information StudyKarle collects and how it is used."
        />

        <div className="mx-auto max-w-3xl space-y-8">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[1.5rem] border border-border-subtle bg-white p-7 shadow-sm"
            >
              <h2 className="font-headline-md text-headline-md text-text-primary mb-3">
                {section.title}
              </h2>
              <p className="text-body-sm leading-relaxed text-text-secondary">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
