import {
  getMembersDirectory,
  getMemberRecentChanges,
} from "@/lib/server/routes/search";
import {
  getViewsFreshness,
  formatAsOfMMDDYYYY,
} from "@/lib/server/routes/viewStatus";
import {
  ExplorerPageShell,
  ExplorerPageHeader,
} from "@/app/components/shared/explorer";

import MemberDirectoryClient from "../../components/features/members/MemberDirectoryClient.updated";
import MemberUpdatesPanel from "../../components/features/members/MemberUpdatesPanel.updated";

import "@/app/styles/active/core/ll3.tokens.css";
import "@/app/styles/active/core/ll3.type.css";
import "@/app/styles/active/core/ll3.buttons.css";
import "@/app/styles/active/core/ll3.forms.css";
import "@/app/styles/active/core/ll3.tables.css";
import "@/app/styles/active/core/ll3.filters.css";
import "@/app/styles/active/core/ll3.explorer-shell.css";
import "@/app/styles/active/members/ll3.members.page.css";
import "@/app/styles/active/members/ll3.members.updates.css";
// import "@/app/styles/active/members/ll3.members.updates.additions.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MemberDirectoryPage() {
  const [directory, changes, freshness] = await Promise.all([
    getMembersDirectory(),
    getMemberRecentChanges({ limit: 12 }),
    getViewsFreshness([
      "mv_member_directory_v2",
      "v_house_seats_current_v1",
      "v_member_recent_changes_v4",
    ]),
  ]);

  const asOfText = formatAsOfMMDDYYYY(freshness?.asOf);

  return (
    <ExplorerPageShell variant="members" className="ll3-members">
      <ExplorerPageHeader
        eyebrow="Representation explorer"
        title="Member Directory"
        activeTool="member"
        asOfText={asOfText}
        description="Browse Congress by state delegation, chamber, and vacant House seats. Use Smart Search for name or cross-entity searches."
      />
      <MemberUpdatesPanel changes={changes} />
      <MemberDirectoryClient initialData={directory} />
    </ExplorerPageShell>
  );
}
