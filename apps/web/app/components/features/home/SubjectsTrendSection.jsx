// components/home/SubjectsTrendSection.jsx
import { getSubjectsTrend } from "@/lib/server/routes/views";
import SubjectsTrendPanel from "./SubjectsTrendPanel";
//import "../../../lib/stylesheets/refactored/subject-trend.refactored.css";
import '@/app/styles/active/subject-trend.ll3.css';

export default async function SubjectsTrendSection({
  congress,
  chamber = null,
  activityAsOfText,
}) {
  const { subjects, rows } = await getSubjectsTrend(congress, { chamber });

  if (!subjects.length || !rows.length) {
    return null;
  }

  return (
    <div className="ll3-control__header">
      <div>
        <h2 className="ll3-h2">Recent activity</h2>
        <p className="ll3-muted">Introduced vs actions (last 12 weeks).</p>
        {activityAsOfText && (
          <p className="ll3-muted ll3-freshness--sub">
            Activity updated through <strong className="ll3-strong">{activityAsOfText}</strong>
          </p>
        )}
      </div>
      <div className="section-subjects-trend__body">
        <SubjectsTrendPanel subjects={subjects} rows={rows} />
      </div>
    </div>
    /*   <section className="section-subjects-trend">
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
      </section>*/
  );
}
