import re
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src/app/properties/[slug]/page.tsx"
text = path.read_text(encoding="utf-8")

replacement = """        <motionless className="rounded-card border border-border bg-surface p-3">
          <p className="text-xs text-text-secondary">KrrishJazz helpline</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Phone size={14} className="text-primary" />
            <a href={`tel:${normalizePlatformPhoneForTel(platformPhone)}`} className="hover:text-primary">
              {platformPhone}
            </a>
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Call or WhatsApp KrrishJazz for visits, pricing, and closure support. Owner/broker numbers stay private.
          </p>
        </motionless>

        <a href={`tel:${normalizePlatformPhoneForTel(platformPhone)}`}>
          <Button variant="outline" className="w-full">
            <Phone size={15} className="mr-2" />
            Call KrrishJazz
          </Button>
        </a>""".replace("motionless", "div")

pattern = re.compile(
    r"\{canShowBrokerPhone \? \([\s\S]*?\{canShowBrokerPhone && showPhone && \([\s\S]*?</a>\s*\)\}",
    re.MULTILINE,
)

if not pattern.search(text):
    raise SystemExit("ContactCard phone block not found")

text = pattern.sub(replacement, text, count=1)
path.write_text(text, encoding="utf-8")
print("Updated ContactCard phone block")
