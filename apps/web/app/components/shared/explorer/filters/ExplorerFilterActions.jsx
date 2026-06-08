import LLButton from "@/app/components/shared/ui/LLButton";
import LLLinkButton from "@/app/components/shared/ui/LLLinkButton";
export default function ExplorerFilterActions({ applyLabel = "Apply filters", clearHref, clearLabel = "Clear filters" }) {
  return <div className="ll3-filterActions"><LLButton as="button" type="submit" variant="primary" full>{applyLabel}</LLButton>{clearHref ? <LLLinkButton href={clearHref} variant="clear" full>{clearLabel}</LLLinkButton> : null}</div>;
}
