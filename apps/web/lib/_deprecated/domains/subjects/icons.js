import {
    Tag,
    Globe,
    Shield,
    HeartPulse,
    GraduationCap,
    Landmark,
    Briefcase,
    Gavel,
    Leaf,
    Home,
    Train,
    Cpu,
    Wifi,
    Plane,
    Factory,
    Users,
    PiggyBank,
    Scale,
    Activity,
} from "lucide-react";

/**
 * Keep it simple: match on normalized subject/group name.
 * Expand over time based on your data.
 */
export const SUBJECT_ICON_MAP = {
    "international affairs": Globe,
    "foreign affairs": Globe,
    "national security": Shield,
    "armed forces and national security": Shield,

    "health": HeartPulse,
    "medicare": HeartPulse,

    "education": GraduationCap,

    "government operations and politics": Landmark,
    "congress": Landmark,

    "economics and public finance": PiggyBank,
    "taxation": PiggyBank,
    "finance": PiggyBank,

    "law": Gavel,
    "crime and law enforcement": Gavel,
    "judiciary": Scale,

    "energy": Leaf,
    "environmental protection": Leaf,
    "agriculture and food": Leaf,

    "housing and community development": Home,

    "transportation and public works": Train,
    "science, technology, communications": Cpu,
    "telecommunications": Wifi,
    "broadband": Wifi,

    "aviation": Plane,

    "labor and employment": Briefcase,
    "commerce": Factory,

    "social welfare": Users,

    // fallback-ish buckets
    "public health": Activity,
};

export function getSubjectIcon(subjectName) {
    const key = String(subjectName || "")
        .trim()
        .toLowerCase();

    return SUBJECT_ICON_MAP[key] || Tag;
}
