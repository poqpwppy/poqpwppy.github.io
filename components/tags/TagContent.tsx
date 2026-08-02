
import { WriteupCard } from "@/components/writeup/WriteupCard";
import { ResearchCard } from "@/components/research/ResearchCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Container } from "@/components/ui/Container";

type Writeup = import("@/.content-collections/generated").Writeup;
type Research = import("@/.content-collections/generated").Research;

interface TagContentProps {
  writeups: Writeup[];
  research: Research[];
  locale: string;
  writeupsHeading: string;
  researchHeading: string;
}

export function TagContent({ writeups, research, locale, writeupsHeading, researchHeading }: TagContentProps) {
  return (
    <Container>
      {writeups.length > 0 && (
        <AnimatedSection className="mb-12">
          <p className="eyebrow mb-5 flex items-center gap-2.5">
            <span aria-hidden className="h-px w-5 bg-accent/60" />
            {writeupsHeading}
          </p>
          <div className="flex flex-col gap-4">
            {writeups.map((w, i) => (
              <WriteupCard key={w._meta.path} writeup={w} locale={locale} index={i + 1} />
            ))}
          </div>
        </AnimatedSection>
      )}

      {research.length > 0 && (
        <AnimatedSection className="pb-24">
          <p className="eyebrow mb-5 flex items-center gap-2.5">
            <span aria-hidden className="h-px w-5 bg-accent/60" />
            {researchHeading}
          </p>
          <div className="flex flex-col gap-4">
            {research.map((r, i) => (
              <ResearchCard key={r._meta.path} research={r} locale={locale} index={i + 1} />
            ))}
          </div>
        </AnimatedSection>
      )}
    </Container>
  );
}
