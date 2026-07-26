exports.seed = async function (knex) {
  await knex("note_tags").del();
  await knex("tags").del();
  await knex("saved_notes").del();
  await knex("view_history").del();
  await knex("notes").del();
  await knex("subjects").del();
  await knex("semesters").del();
  await knex("years").del();

  const yearRows = await knex("years")
    .insert([
      { label: "1st Year", order_index: 1 },
      { label: "2nd Year", order_index: 2 },
      { label: "3rd Year", order_index: 3 },
      { label: "4th Year", order_index: 4 },
    ])
    .returning(["id", "order_index"]);

  const yearIdByOrder = {};
  yearRows.forEach(function (row) {
    yearIdByOrder[row.order_index] = row.id;
  });

  const semesterData = [];
  for (let year = 1; year <= 4; year++) {
    const sem1 = year * 2 - 1;
    const sem2 = year * 2;

    semesterData.push({
      year_id: yearIdByOrder[year],
      label: "Semester " + sem1,
      order_index: sem1,
    });

    semesterData.push({
      year_id: yearIdByOrder[year],
      label: "Semester " + sem2,
      order_index: sem2,
    });
  }

  const semesterRows = await knex("semesters")
    .insert(semesterData)
    .returning(["id", "order_index"]);

  const semesterIdByOrder = {};
  semesterRows.forEach(function (row) {
    semesterIdByOrder[row.order_index] = row.id;
  });

  const subjectSeeds = {
    1: [
      { name: "Electronics", icon: "memory", color: "primary" },
      { name: "Maths-1", icon: "functions", color: "secondary" },
      { name: "Mechanics", icon: "precision_manufacturing", color: "tertiary" },
      { name: "Physics", icon: "science", color: "primary" },
      { name: "Soft Skills", icon: "groups", color: "secondary" },
    ],
    2: [
      { name: "Chemistry", icon: "science", color: "primary" },
      { name: "Electrical", icon: "bolt", color: "secondary" },
      { name: "EVS", icon: "public", color: "tertiary" },
      { name: "Math-2", icon: "functions", color: "primary" },
      { name: "PPS", icon: "terminal", color: "secondary" },
    ],
    3: [
      { name: "Math-4", icon: "functions", color: "primary" },
      { name: "Data Structure", icon: "account_tree", color: "secondary" },
      { name: "DSTL", icon: "schema", color: "tertiary" },
      { name: "Cybersecurity", icon: "security", color: "primary" },
      { name: "UHVPE", icon: "school", color: "secondary" },
      { name: "COA", icon: "memory", color: "tertiary" },
    ],
    4: [
      { name: "Sensor & Instrumentation", icon: "sensors", color: "primary" },
      { name: "Technical Communication", icon: "chat", color: "secondary" },
      { name: "Data Structure", icon: "account_tree", color: "tertiary" },
      { name: "COA", icon: "memory", color: "primary" },
      { name: "DSTL", icon: "schema", color: "secondary" },
      { name: "Python", icon: "code", color: "tertiary" },
    ],
  };

  for (const semesterOrder of [1, 2, 3, 4]) {
    const semesterId = semesterIdByOrder[semesterOrder];
    const subjects = subjectSeeds[semesterOrder];

    await knex("subjects").insert(
      subjects.map(function (subject) {
        return {
          semester_id: semesterId,
          name: subject.name,
          icon: subject.icon,
          color: subject.color,
        };
      })
    );
  }
};
