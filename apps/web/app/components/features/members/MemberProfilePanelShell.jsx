"use client";

import RoutePanelShell from "@/app/components/ui/RoutePanelShell";

export default function MemberProfilePanelShell({ children }) {
  return (
    <RoutePanelShell
      ariaLabel="Member profile"
      closeLabel="Close member profile"
      backLabel="Members"
      fallbackHref="/search"
      entity="member"
      mode="panel"
      className="llmp3-routePanel"
      bodyClassName="ll3-routePanel__body--member"
    >
      {children}
    </RoutePanelShell>
  );
}
