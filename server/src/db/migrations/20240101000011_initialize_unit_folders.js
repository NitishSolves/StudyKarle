/**
 * ONE-TIME MIGRATION
 * For every existing subject in Year 1 and Year 2, create Unit 1-5 folders.
 * Skips subjects that already have these units.
 * Does NOT touch Year 3+.
 * Does NOT modify any existing notes or PDFs.
 */
exports.up = async function (knex) {
  // Find all subjects belonging to Year 1 or Year 2
  const subjects = await knex("subjects")
    .join("semesters", "semesters.id", "subjects.semester_id")
    .join("years", "years.id", "semesters.year_id")
    .select("subjects.id as subject_id", "years.label as year_label")
    .whereIn("years.label", [
      "Year 1",
      "Year 2",
      "1",
      "2",
      "First Year",
      "Second Year",
    ]);

  const unitNames = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"];

  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];

    // Check which units already exist for this subject
    const existingUnits = await knex("units")
      .where("subject_id", subject.subject_id)
      .select("name");

    const existingNames = new Set(
      existingUnits.map(function (u) {
        return u.name;
      })
    );

    const unitsToCreate = [];
    for (let j = 0; j < unitNames.length; j++) {
      if (!existingNames.has(unitNames[j])) {
        unitsToCreate.push({
          subject_id: subject.subject_id,
          name: unitNames[j],
          order_index: j + 1,
        });
      }
    }

    if (unitsToCreate.length > 0) {
      await knex("units").insert(unitsToCreate);
    }
  }
};

exports.down = async function (knex) {
  // Reversible: remove Unit 1-5 from Year 1 and Year 2 subjects
  const subjects = await knex("subjects")
    .join("semesters", "semesters.id", "subjects.semester_id")
    .join("years", "years.id", "semesters.year_id")
    .select("subjects.id as subject_id")
    .whereIn("years.label", [
      "Year 1",
      "Year 2",
      "1",
      "2",
      "First Year",
      "Second Year",
    ]);

  const subjectIds = subjects.map(function (s) {
    return s.subject_id;
  });

  if (subjectIds.length > 0) {
    await knex("units")
      .whereIn("subject_id", subjectIds)
      .whereIn("name", ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"])
      .del();
  }
};
