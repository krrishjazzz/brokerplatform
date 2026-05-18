from pathlib import Path

path = Path("src/components/dashboard/post-property-section.tsx")
text = path.read_text(encoding="utf-8")

# Remove local UploadFocusChecklist (keep import)
start = text.index("function UploadFocusChecklist")
end = text.index("export function PostPropertySection")
text = text[:start] + text[end:]

# Remove local ListingLivePreview + formatRelativeTime at end
marker = "// â”€â”€â”€ Leads"
if marker in text:
    text = text[: text.index(marker)].rstrip() + "\n"

# Replace progress bar block
old_progress = """      {/* Progress bar */}
      <div className="bg-white rounded-card shadow-card border border-border p-6 mb-6">
        <motionless className="flex items-center justify-between mb-2">"""

# fix if motionless not present
old_progress = old_progress.replace("motionless", "div")

if old_progress.replace("motionless", "motionless") in text:
    pass

progress_start = text.index("      {/* Progress bar */}")
progress_end = text.index("      <div className=\"grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]\">")
text = text[:progress_start] + "      <WizardProgress step={step} />\n\n" + text[progress_end:]

path.write_text(text, encoding="utf-8")
print("cleaned", path, "lines", text.count("\n"))
