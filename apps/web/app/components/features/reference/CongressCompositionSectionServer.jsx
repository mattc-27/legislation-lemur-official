import {getCongressCompositionReferenceData} from "@/lib/server/view/congressComposition";
import CongressCompositionSection from "./CongressCompositionSection";

export default async function CongressCompositionSectionServer({ congress = 119 }) {
    const data = await getCongressCompositionReferenceData(congress);

    return <CongressCompositionSection data={data} />;
}