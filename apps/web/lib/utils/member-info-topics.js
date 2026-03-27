import {
    AlertTriangle,
    Banknote,
    BookOpen,
    Briefcase,
    Building2,
    Car,
    DollarSign,
    Feather,
    Flag,
    Gavel,
    Globe,
    GraduationCap,
    HandHeart,
    HeartPulse,
    Landmark,
    Leaf,
    Megaphone,
    PawPrint,
    Scale,
    Shield,
    Sprout,
    Tractor,
    Trees,
    Users,
    Waves,
} from "lucide-react";

export const TOPIC_PALETTE = [
    "#6366F1",
    "#22C55E",
    "#F59E0B",
    "#06B6D4",
    "#F43F5E",
    "#10B981",
    "#A78BFA",
    "#FB7185",
];

export const TOPIC_META = {
    "Agriculture and Food": { short: "Ag & food", icon: Tractor },
    Animals: { short: "Animals", icon: PawPrint },
    "Armed Forces and National Security": { short: "Defense", icon: Shield },
    "Arts, Culture, Religion": { short: "Arts & culture", icon: Feather },
    "Civil Rights and Liberties, Minority Issues": { short: "Civil rights", icon: Scale },
    Commerce: { short: "Commerce", icon: Briefcase },
    Congress: { short: "Congress", icon: Landmark },
    "Crime and Law Enforcement": { short: "Crime", icon: Gavel },
    "Economics and Public Finance": { short: "Econ & finance", icon: DollarSign },
    Education: { short: "Education", icon: GraduationCap },
    Energy: { short: "Energy", icon: AlertTriangle },
    "Environmental Protection": { short: "Environment", icon: Leaf },
    Families: { short: "Families", icon: Users },
    "Finance and Financial Sector": { short: "Finance", icon: Banknote },
    "Foreign Trade and International Finance": { short: "Trade", icon: Globe },
    "Government Operations and Politics": { short: "Gov ops", icon: Building2 },
    Health: { short: "Health", icon: HeartPulse },
    Immigration: { short: "Immigration", icon: Flag },
    "International Affairs": { short: "Intl affairs", icon: Globe },
    "Labor and Employment": { short: "Labor", icon: Briefcase },
    "Native Americans": { short: "Native affairs", icon: Sprout },
    "Public Lands and Natural Resources": { short: "Public lands", icon: Trees },
    "Science, Technology, Communications": { short: "Sci / tech", icon: Megaphone },
    "Social Welfare": { short: "Social welfare", icon: HandHeart },
    Taxation: { short: "Taxation", icon: BookOpen },
    "Transportation and Public Works": { short: "Transport", icon: Car },
    Uncategorized: { short: "Other", icon: Waves },
};

export function normalizeTopicLabel(value) {
    if (typeof value === "string") return value;

    if (value && typeof value === "object") {
        return value.name || value.title || value.subject || "Uncategorized";
    }

    return "Uncategorized";
}

export function getTopicMeta(label) {
    return (
        TOPIC_META[label] || {
            short: label || "Other",
            icon: BookOpen,
        }
    );
}

export function getTopicColor(index) {
    return TOPIC_PALETTE[index % TOPIC_PALETTE.length];
}