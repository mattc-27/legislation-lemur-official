"use client";

import { useId } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";

function ordinal(value) {
    const n = Number(value);
    if (!Number.isInteger(n)) return String(value ?? "");
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    if (n % 10 === 1) return `${n}st`;
    if (n % 10 === 2) return `${n}nd`;
    if (n % 10 === 3) return `${n}rd`;
    return `${n}th`;
}

export default function MemberCongressSelector({
    availableCongresses = [],
    selectedCongress,
}) {
    const selectId = useId();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const options = Array.from(new Set(availableCongresses.map(Number).filter(Number.isInteger)))
        .sort((a, b) => b - a);

    if (options.length <= 1) return null;

    function onChange(event) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("congress", event.target.value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    return (
        <div className="llmp3-congressSelector" role="group" aria-label="Profile Congress">
            <CalendarRange size={16} aria-hidden="true" />
            <label htmlFor={selectId}>Congress</label>
            <select
                id={selectId}
                className="field llmp3-congressSelector__select"
                value={selectedCongress ?? ""}
                onChange={onChange}
            >
                {options.map((congress) => (
                    <option key={congress} value={congress}>
                        {ordinal(congress)} Congress
                    </option>
                ))}
            </select>
        </div>
    );
}
