// apps/web/app/components/features/insights/InsightsStoryPage.jsx
// Server component wrapper (keeps the page.jsx clean)
import InsightsShellClient from "./client/InsightsShellClient";

export default function InsightsStoryPage({ briefing }) {
    return <InsightsShellClient briefing={briefing} />;
}
