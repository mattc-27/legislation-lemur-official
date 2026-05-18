// /app/(app)/bills/layout.jsx - for interceptiong rout + parallel panel slot pattern

export default function BillsLayout({ children, panel }) {
    return (
        <>
            {children}
            {panel}
        </>
    );
}