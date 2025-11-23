// components/home/SubjectsTrendSection.jsx
import { getSubjectsTrend } from "@/lib/server/views";
import SubjectsTrendPanel from "./SubjectsTrendPanel";
import "../../../lib/stylesheets/refactored/subject-trend.refactored.css";

export default async function SubjectsTrendSection({
  congress,
  chamber = null,
}) {
  const { subjects, rows } = await getSubjectsTrend(congress, { chamber });

  if (!subjects.length || !rows.length) {
    return null;
  }

  return (
    <section className="section-subjects-trend">
      <header className="section-subjects-trend__header">
        <h3 className="section-subjects-trend__title">Subjects over time</h3>
        <p className="section-subjects-trend__subtitle">
          Monthly counts of primary bill subjects in the current session.
          {chamber ? ` (${chamber})` : ""}
        </p>
      </header>

      <div className="section-subjects-trend__body">
        <SubjectsTrendPanel subjects={subjects} rows={rows} />
      </div>
    </section>
  );
}
