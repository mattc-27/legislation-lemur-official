// /app/(app)/member/layout.jsx - for interceptiong rout + parallel panel slot pattern

export default function MemberLayout({ children, panel }) {
    return (
        <>
            {children}
            {panel}
        </>
    );
}