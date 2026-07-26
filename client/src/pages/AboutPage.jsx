import React from "react";

const reasons = [
  {
    icon: "bolt",
    title: "Free access",
    description:
      "Students can reach useful study material without hidden charges.",
  },
  {
    icon: "account_tree",
    title: "Organized resources",
    description: "Everything is grouped in a simple structure that saves time.",
  },
  {
    icon: "verified",
    title: "Reliable notes",
    description:
      "Resources are selected to support better learning and revision.",
  },
  {
    icon: "web_asset",
    title: "Simple experience",
    description: "A clean layout keeps the focus on learning, not confusion.",
  },
  {
    icon: "smartphone",
    title: "Works anywhere",
    description: "Use StudyKarle smoothly on phones, tablets, and laptops.",
  },
  {
    icon: "shield",
    title: "Trusted access",
    description:
      "Login-based access helps keep the platform safe and controlled.",
  },
];

const values = [
  {
    icon: "groups",
    title: "Students First",
    description:
      "Every decision is made to support students and make learning easier for them.",
  },
  {
    icon: "workspace_premium",
    title: "Shared Knowledge",
    description:
      "Quality study resources are made available to help more students learn without barriers.",
  },
  {
    icon: "rocket_launch",
    title: "Growth for All",
    description:
      "StudyKarle is built to help students move forward with confidence and consistency.",
  },
  {
    icon: "autorenew",
    title: "Continuous Support",
    description:
      "The platform keeps improving so students get a better learning experience over time.",
  },
];

function Icon({ name, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined leading-none ${className}`}
    >
      {name}
    </span>
  );
}

function SectionHeading({ eyebrow, title, description, className = "" }) {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-label-md uppercase tracking-[0.18em] text-text-secondary">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-headline-lg text-headline-lg text-text-primary">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-3xl text-body-md leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <article
      className={`rounded-[1.5rem] border border-border-subtle bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${className}`}
    >
      {children}
    </article>
  );
}

export default function AboutPage() {
  return (
    <main id="top" className="bg-background text-text-primary">
      <section className="relative overflow-hidden py-20 lg:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-10 -z-10 h-56 w-56 rounded-full bg-primary/5 blur-3xl"
        />
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="About StudyKarle"
            title="Built to make learning accessible for every student."
            description="StudyKarle is designed for students who should not have to pay extra to access quality notes, study materials, and academic support. The goal is simple: make useful resources easier to find, easier to use, and free from unnecessary barriers."
            className="mx-auto max-w-4xl"
          />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center">
            {[
              "Free study notes",
              "Previous year papers",
              "Assignments",
              "Lab files",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-border-subtle bg-white px-4 py-2 text-label-sm text-text-secondary shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 lg:pb-24">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-8 lg:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon name="target" className="text-[24px]" />
              </div>
              <h2 className="mt-6 font-headline-lg text-headline-lg text-text-primary">
                Our Mission
              </h2>
              <p className="mt-4 text-body-md leading-relaxed text-text-secondary">
                Our mission is to give every student free access to useful
                academic resources so learning does not depend on money,
                connections, or searching through scattered links. StudyKarle
                exists to support real student well-being by making study
                material easier to reach.
              </p>
            </Card>

            <Card className="p-8 lg:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon name="visibility" className="text-[24px]" />
              </div>
              <h2 className="mt-6 font-headline-lg text-headline-lg text-text-primary">
                Our Vision
              </h2>
              <p className="mt-4 text-body-md leading-relaxed text-text-secondary">
                Our vision is a student-friendly platform where quality notes
                and study resources are available to everyone without any
                charge. We want to create a space where students can learn
                better, save time, and grow with confidence throughout their
                academic journey.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why StudyKarle"
            title="A better way to access what students actually need."
            description="The platform is built to reduce stress, remove clutter, and give students a simpler path to the resources that matter most."
            className="mx-auto max-w-4xl"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {reasons.map((reason) => (
              <Card key={reason.title} className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon name={reason.icon} className="text-[24px]" />
                </div>
                <h3 className="mt-5 font-headline-md text-headline-md text-text-primary">
                  {reason.title}
                </h3>
                <p className="mt-2 text-body-sm leading-relaxed text-text-secondary">
                  {reason.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Stand For"
            title="Values shaped around student well-being."
            description="These principles guide how StudyKarle is built: simple, useful, fair, and focused on helping students grow."
            className="mx-auto max-w-4xl"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {values.map((value) => (
              <Card key={value.title} className="flex gap-5 p-7">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon name={value.icon} className="text-[24px]" />
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-text-primary">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-body-sm leading-relaxed text-text-secondary">
                    {value.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
