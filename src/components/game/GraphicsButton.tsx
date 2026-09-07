import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { GRAPHICS, useGraphics, hydrateGraphics, type GraphicsTier } from "@/hooks/useGraphics";

const ORDER: GraphicsTier[] = ["low", "medium", "high"];

/** Pemilih kualitas grafis (Rendah/Sedang/Tinggi) untuk menjaga frame rate. */
export function GraphicsButton() {
  const tier = useGraphics((s) => s.tier);
  const setTier = useGraphics((s) => s.setTier);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    hydrateGraphics();
  }, []);

  return (
    <div className="pointer-events-auto relative">
      <button
        type="button"
        aria-label="Pengaturan grafis"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-white/25 bg-slate-900/70 px-3 text-xs font-semibold text-slate-50 shadow backdrop-blur transition-colors hover:bg-slate-800/80"
      >
        <Settings2 className="h-4 w-4" />
        {GRAPHICS[tier].label}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 w-40 overflow-hidden rounded-xl border border-white/20 bg-slate-900/90 p-1 text-xs text-slate-50 shadow-lg backdrop-blur">
          <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-slate-400">
            Kualitas grafis
          </p>
          {ORDER.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTier(t);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/10 ${
                t === tier ? "bg-white/10 font-semibold" : ""
              }`}
            >
              {GRAPHICS[t].label}
              {t === tier ? <span aria-hidden>✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
