/**
 * ONE-TIME SEED — Unit Folder Initialization for Year 1 and Year 2
 *
 * For every existing subject under Year 1 ("1st Year") and Year 2 ("2nd Year"),
 * creates Unit 1 through Unit 5 if they do not already exist.
 *
 * Idempotent: safe to run multiple times. Skips existing units.
 * Does NOT touch Year 3 ("3rd Year") or Year 4 ("4th Year").
 * Does NOT modify subject creation logic or any other data.
 */

exports.seed = async function (knex) {
  const TARGET_YEAR_LABELS = ["Year 1", "Year 2"];
  const UNIT_NAMES = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"];

  // Find all subjects belonging to Year 1 or Year 2 via semesters join
  const subjects = await knex("subjects")
    .join("semesters", "semesters.id", "subjects.semester_id")
    .join("years", "years.id", "semesters.year_id")
    .select("subjects.id as subject_id")
    .whereIn("years.label", TARGET_YEAR_LABELS);

  if (subjects.length === 0) {
    console.log("[seed:002] No subjects found under Year 1 or Year 2. Skipping.");
    return;
  }

  const subjectIds = subjects.map(function (s) {
    return s.subject_id;
  });

  // Find which units already exist for these subjects
  const existingUnits = await knex("units")
    .whereIn("subject_id", subjectIds)
    .select("subject_id", "name");

  // Build a lookup set: "subjectId|Unit Name" → exists
  const existingSet = new Set();
  existingUnits.forEach(function (u) {
    existingSet.add(u.subject_id + "|" + u.name);
  });

  // Build insert array, skipping existing units
  const unitsToInsert = [];
  for (let i = 0; i < subjects.length; i++) {
    const subjectId = subjects[i].subject_id;

    for (let j = 0; j < UNIT_NAMES.length; j++) {
      const unitName = UNIT_NAMES[j];
      const key = subjectId + "|" + unitName;

      if (!existingSet.has(key)) {
        unitsToInsert.push({
          subject_id: subjectId,
          name: unitName,
          order_index: j + 1,
        });
      }
    }
  }

  if (unitsToInsert.length === 0) {
    console.log("[seed:002] All units already exist for Year 1 and Year 2 subjects. Nothing to insert.");
    return;
  }

  // Insert in batches to avoid overly large queries
  const BATCH_SIZE = 500;
  for (let i = 0; i < unitsToInsert.length; i += BATCH_SIZE) {
    const batch = unitsToInsert.slice(i, i + BATCH_SIZE);
    await knex("units").insert(batch);
  }

  console.log(
    "[seed:002] Inserted " +
      unitsToInsert.length +
      " unit(s) across " +
      subjects.length +
      " subject(s) for Year 1 and Year 2."
  );
};
