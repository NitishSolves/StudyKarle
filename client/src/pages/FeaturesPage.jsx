import React from "react";

const features = [
  {
    icon: "calendar_month",
    title: "Semester-wise Organization",
    description:
      "Find notes, papers, and files arranged by semester so you reach the right resource faster.",
  },
  {
    icon: "description",
    title: "Previous Year Papers",
    description:
      "Access curated PYQs that help you understand exam patterns, difficulty, and repeated concepts.",
  },
  {
    icon: "menu_book",
    title: "High Quality Notes",
    description:
      "Review clean, readable notes made for revision, clarity, and exam-focused preparation.",
  },
  {
    icon: "assignment",
    title: "Assignments",
    description:
      "Keep your submissions on track with easy access to coursework and assignment materials.",
  },
  {
    icon: "verified_user",
    title: "Secure Login",
    description:
      "Protected access keeps the platform organized and gives students a trusted study environment.",
  },
  {
    icon: "travel_explore",
    title: "Smart Search",
    description:
      "Search across subjects and resource types to find what you need without wasting time.",
  },
];


function Icon({ name }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="text-center mb-12">
      <p className="text-text-secondary uppercase tracking-widest">{eyebrow}</p>

      <h1 className="text-headline-lg font-headline-lg mt-2">{title}</h1>

      <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <>
      {/* <PublicHeader /> */}

      <main className="min-h-screen bg-background text-text-primary py-20">
        <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Platform Features"
            title="Everything students need in one disciplined layout."
            description="StudyKarle removes the clutter and makes important academic resources easy to discover and use."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-[1.75rem] border border-border-subtle bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon name={feature.icon} />
                </div>

                <h3 className="mt-5 font-headline-md text-headline-md">
                  {feature.title}
                </h3>

                <p className="mt-3 text-body-sm text-text-secondary">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
