import { useState } from "react";

const SYSTEM_PROMPT = `You are an empathetic and deeply wise decision-making coach. When a user shares a life decision, you analyze it with emotional intelligence and practical wisdom.

Respond ONLY in valid JSON (no markdown, no backticks) with this exact structure:
{
  "emotionalState": "Brief insight into the emotional core of this decision (1-2 sentences)",
  "clarityScore": 7,
  "clarityLabel": "Alta claridad",
  "riskLevel": "Medio",
  "riskColor": "yellow",
  "shortTerm": "What happens in the next 3-6 months if they act",
  "longTerm": "What happens in 1-5 years if they act",
  "bestCase": "The best realistic outcome",
  "worstCase": "The worst realistic outcome",
  "mostLikely": "The most probable outcome",
  "keyQuestion": "The ONE most important question they should ask themselves",
  "recommendation": "A warm direct empathetic recommendation like a wise friend",
  "powerPhrase": "A short memorable insight sentence"
}
Match the language of the user input. Be warm, honest, and deeply human.`;

const FREE_LIMIT = 3;

const s: any = {
  page: { minHeight: "100vh", background: "#030712", color: "white", fontFamily: "system-ui, sans-serif", padding: "0" },
  container: { maxWidth: 520, margin: "0 auto", padding: "32px 16px", minHeight: "100vh", display: "flex", flexDirection: "column" as const },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  appName: { fontSize: 22, fontWeight: 800, background: "linear-gradient(90deg,#a78bfa,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 },
  tagline: { color: "#6b7280", fontSize: 12, margin: 0 },
  topBtns: { display: "flex", gap: 8 },
  btn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", borderRadius: 99, padding: "6px 14px", fontSize: 12, cursor: "pointer" },
  planBar: { display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 14px", marginBottom: 24 },
  planText: { color: "#6b7280", fontSize: 12 },
  planPro: { color: "#c4b5fd", fontSize: 12, fontWeight: 600 },
  upgradeLink: { color: "#a78bfa", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "none", border: "none" },
  textarea: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 16, color: "white", fontSize: 14, resize: "none" as const, outline: "none", marginBottom: 16, boxSizing: "border-box" as const, fontFamily: "inherit" },
  exLabel: { color: "#4b5563", fontSize: 12, marginBottom: 8 },
  exWrap: { display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 24 },
  exBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", borderRadius: 99, padding: "6px 14px", fontSize: 12, cursor: "pointer" },
  analyzeBtn: { width: "100%", padding: "16px 0", borderRadius: 16, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", background: "linear-gradient(90deg,#7c3aed,#4f46e5)", color: "white", marginBottom: 12 },
  analyzeBtnDisabled: { width: "100%", padding: "16px 0", borderRadius: 16, fontWeight: 700, fontSize: 14, cursor: "not-allowed", border: "none", background: "linear-gradient(90deg,#7c3aed,#4f46e5)", color: "white", opacity: 0.4, marginBottom: 12 },
  upgradeBtnMain: { width: "100%", padding: "16px 0", borderRadius: 16, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", background: "linear-gradient(90deg,#6d28d9,#be185d)", color: "white", marginBottom: 12 },
  dots: { display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 4 },
  dot: (used: boolean) => ({ width: 8, height: 8, borderRadius: "50%", background: used ? "#374151" : "#7c3aed" }),
  dotsText: { color: "#4b5563", fontSize: 12 },
  errorText: { color: "#f87171", fontSize: 13, textAlign: "center" as const, marginBottom: 12 },
  backBtn: { background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 16, marginBottom: 12 },
  cardTitle: (color: string) => ({ color, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 2, marginBottom: 8 }),
  cardText: { color: "#e5e7eb", fontSize: 13, lineHeight: 1.6 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 },
  scenarioCard: (color: string) => ({ border: `1px solid ${color}`, borderRadius: 14, padding: 12, background: "rgba(0,0,0,0.3)" }),
  scenarioLabel: { color: "#9ca3af", fontSize: 11, fontWeight: 700, marginBottom: 6 },
  scenarioText: { color: "#e5e7eb", fontSize: 11, lineHeight: 1.5 },
  ring: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 },
  riskBadge: (color: string) => {
    const map: any = { green: { bg: "rgba(6,78,59,0.5)", text: "#6ee7b7", border: "#065f46" }, yellow: { bg: "rgba(78,63,6,0.5)", text: "#fde68a", border: "#92400e" }, red: { bg: "rgba(78,6,6,0.5)", text: "#fca5a5", border: "#991b1b" } };
    const c = map[color] || map.yellow;
    return { background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 99, padding: "3px 12px", fontSize: 11, fontWeight: 700 };
  },
  decisionBox: { background: "linear-gradient(135deg,rgba(76,29,149,0.3),rgba(30,27,75,0.3))", border: "1px solid rgba(109,40,217,0.3)", borderRadius: 20, padding: 20, marginBottom: 16 },
  decisionLabel: { color: "#9ca3af", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 2, marginBottom: 6 },
  decisionText: { color: "white", fontWeight: 600, fontSize: 15 },
  keyBox: { background: "rgba(78,52,6,0.3)", border: "1px solid rgba(146,64,14,0.4)", borderRadius: 16, padding: 16, marginBottom: 12 },
  keyLabel: { color: "#fbbf24", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 2, marginBottom: 6 },
  keyText: { color: "#fef3c7", fontWeight: 600, fontSize: 13 },
  recBox: { background: "linear-gradient(135deg,rgba(76,29,149,0.2),rgba(30,27,75,0.2))", border: "1px solid rgba(109,40,217,0.3)", borderRadius: 20, padding: 20, marginBottom: 12 },
  phraseBox: { background: "linear-gradient(90deg,rgba(109,40,217,0.15),rgba(157,23,77,0.15))", border: "1px solid rgba(157,23,77,0.3)", borderRadius: 20, padding: 20, textAlign: "center" as const, marginBottom: 12 },
  phraseLabel: { color: "#f9a8d4", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 2, marginBottom: 8 },
  phraseText: { color: "white", fontWeight: 700, fontSize: 15, fontStyle: "italic" },
  limitBox: { background: "linear-gradient(90deg,rgba(76,29,149,0.4),rgba(157,23,77,0.4))", border: "1px solid rgba(109,40,217,0.5)", borderRadius: 20, padding: 16, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  limitTitle: { color: "white", fontWeight: 700, fontSize: 13, marginBottom: 2 },
  limitSub: { color: "#9ca3af", fontSize: 11 },
  limitBtn: { background: "linear-gradient(90deg,#7c3aed,#be185d)", color: "white", border: "none", borderRadius: 12, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#030712", border: "1px solid rgba(109,40,217,0.4)", borderRadius: 28, width: "100%", maxWidth: 380, padding: 28, position: "relative" as const },
  modalClose: { position: "absolute" as const, top: 16, right: 16, background: "none", border: "none", color: "#6b7280", fontSize: 20, cursor: "pointer" },
  modalBadge: { display: "inline-block", background: "linear-gradient(90deg,#7c3aed,#be185d)", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, marginBottom: 12 },
  modalTitle: { color: "white", fontWeight: 800, fontSize: 20, marginBottom: 6, textAlign: "center" as const },
  modalSub: { color: "#9ca3af", fontSize: 13, textAlign: "center" as const, marginBottom: 20 },
  billingToggle: { display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4, marginBottom: 20, border: "1px solid rgba(255,255,255,0.08)" },
  billingBtn: (active: boolean) => ({ flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: active ? "#7c3aed" : "transparent", color: active ? "white" : "#9ca3af" }),
  price: { textAlign: "center" as const, marginBottom: 20 },
  priceNum: { color: "white", fontSize: 52, fontWeight: 800 },
  pricePer: { color: "#9ca3af", fontSize: 14 },
  featureList: { listStyle: "none", padding: 0, margin: "0 0 20px 0" },
  featureItem: { color: "#d1d5db", fontSize: 13, padding: "4px 0" },
  modalCta: { width: "100%", padding: "14px 0", borderRadius: 16, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", background: "linear-gradient(90deg,#7c3aed,#be185d)", color: "white", marginBottom: 8 },
  modalCtaSub: { color: "#4b5563", fontSize: 11, textAlign: "center" as const },
  historyOverlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 },
  historyPanel: { background: "#030712", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, width: "100%", maxWidth: 520, padding: 24, maxHeight: "70vh", overflowY: "auto" as const },
  historyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  historyTitle: { color: "white", fontWeight: 700, fontSize: 17 },
  historyClose: { background: "none", border: "none", color: "#6b7280", fontSize: 20, cursor: "pointer" },
  historyItem: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14, marginBottom: 10, cursor: "pointer" },
  historyDecision: { color: "white", fontSize: 13, fontWeight: 600, marginBottom: 8 },
  historyMeta: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  historyDate: { color: "#6b7280", fontSize: 11 },
  clearBtn: { width: "100%", background: "none", border: "none", color: "#ef4444", fontSize: 12, cursor: "pointer", padding: "8px 0", marginTop: 4 },
  emptyText: { color: "#6b7280", fontSize: 13, textAlign: "center" as const, padding: "32px 0" },
  historyCount: { background: "#7c3aed", color: "white", fontSize: 10, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute" as const, top: -4, right: -4 },
  historyBtnWrap: { position: "relative" as const, display: "inline-block" },
};

function ScoreRing({ score }: { score: number }) {
  const r = 28, circ = 2 * Math.PI * r;
  const filled = (score / 10) * circ;
  const color = score >= 7 ? "#a78bfa" : score >= 4 ? "#fbbf24" : "#f87171";
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#1e1b4b" strokeWidth="7" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" transform="rotate(-90 40 40)" />
      <text x="40" y="45" textAnchor="middle" fill={color} fontSize="18" fontWeight="bold">{score}</text>
    </svg>
  );
}

export default function App() {
  const [lang, setLang] = useState("es");
  const [decision, setDecision] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentDecision, setCurrentDecision] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [usedToday, setUsedToday] = useState(0);
  const [error, setError] = useState("");
  const [billing, setBilling] = useState("yearly");
  const freeLeft = Math.max(0, FREE_LIMIT - usedToday);
  const canAnalyze = isPro || freeLeft > 0;
  const es = lang === "es";

  const examples = es
    ? ["Cambio de trabajo?", "Compro ahora o espero?", "Me conviene este socio?", "Esta relacion me suma?"]
    : ["Change jobs?", "Buy now or wait?", "Is this partner right?", "Does this add value?"];

  const analyze = async () => {
    if (!decision.trim() || !canAnalyze) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
       headers: { "Content-Type": "application/json", "x-api-key": "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", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: decision }],
        }),
      });
      const data = await res.json();
      const text = data.content ? data.content.map((b: any) => b.text || "").join("") : "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      const entry = { decision, result: parsed, date: new Date().toLocaleDateString(es ? "es-ES" : "en-US", { day: "numeric", month: "short", year: "numeric" }) };
      setHistory((prev) => [entry, ...prev].slice(0, 20));
      if (!isPro) setUsedToday((u) => u + 1);
      setCurrentDecision(decision);
      setResult(parsed);
      setDecision("");
    } catch {
      setError(es ? "Error al analizar. Intenta de nuevo." : "Analysis error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.topBar}>
          <div>
            <p style={s.appName}>{es ? "Decision Clara" : "Clear Decision"} {isPro && <span style={{ fontSize: 11 }}>PRO</span>}</p>
            <p style={s.tagline}>{es ? "IA que analiza lo que realmente importa" : "AI that analyzes what really matters"}</p>
          </div>
          <div style={s.topBtns}>
            <div style={s.historyBtnWrap}>
              <button style={s.btn} onClick={() => setShowHistory(true)}>{es ? "Historial" : "History"}</button>
              {history.length > 0 && <div style={s.historyCount}>{history.length > 9 ? "9+" : history.length}</div>}
            </div>
            <button style={s.btn} onClick={() => setLang(l => l === "es" ? "en" : "es")}>{es ? "EN" : "ES"}</button>
          </div>
        </div>
        <div style={s.planBar}>
          {isPro ? <span style={s.planPro}>Plan Pro activo</span> : <span style={s.planText}>{es ? "Plan Gratuito" : "Free Plan"} · {freeLeft} {es ? "analisis restantes" : "analyses left"}</span>}
          {!isPro && <button style={s.upgradeLink} onClick={() => setShowUpgrade(true)}>{es ? "Actualizar a Pro" : "Upgrade to Pro"}</button>}
          {isPro && <button style={{ ...s.upgradeLink, color: "#4b5563" }} onClick={() => { setIsPro(false); setUsedToday(0); }}>Reset demo</button>}
        </div>
        <div style={{ flex: 1 }}>
          {result ? (
            <div>
              <button style={s.backBtn} onClick={() => { setResult(null); setCurrentDecision(""); }}>&larr; {es ? "Nueva decision" : "New decision"}</button>
              <div style={s.decisionBox}>
                <p style={s.decisionLabel}>{es ? "Tu decision" : "Your decision"}</p>
                <p style={s.decisionText}>"{currentDecision}"</p>
              </div>
              <div style={s.grid2}>
                <div style={s.card}>
                  <p style={s.cardTitle("#a78bfa")}>{es ? "Estado emocional" : "Emotional state"}</p>
                  <p style={s.cardText}>{result.emotionalState}</p>
                </div>
                <div style={{ ...s.card, ...s.ring }}>
                  <ScoreRing score={result.clarityScore} />
                  <p style={{ color: "#d1d5db", fontSize: 11, textAlign: "center" }}>{result.clarityLabel}</p>
                  <span style={s.riskBadge(result.riskColor)}>{result.riskLevel}</span>
                </div>
              </div>
              <div style={s.grid3}>
                {[
                  { label: es ? "Mejor caso" : "Best case", val: result.bestCase, color: "#065f46" },
                  { label: es ? "Mas probable" : "Most likely", val: result.mostLikely, color: "#4c1d95" },
                  { label: es ? "Peor caso" : "Worst case", val: result.worstCase, color: "#7f1d1d" },
                ].map(sc => (
                  <div key={sc.label} style={s.scenarioCard(sc.color)}>
                    <p style={s.scenarioLabel}>{sc.label}</p>
                    <p style={s.scenarioText}>{sc.val}</p>
                  </div>
                ))}
              </div>
              <div style={s.grid2}>
                <div style={s.card}>
                  <p style={s.cardTitle("#60a5fa")}>{es ? "Corto plazo" : "Short term"}</p>
                  <p style={s.cardText}>{result.shortTerm}</p>
                </div>
                <div style={s.card}>
                  <p style={s.cardTitle("#c084fc")}>{es ? "Largo plazo" : "Long term"}</p>
                  <p style={s.cardText}>{result.longTerm}</p>
                </div>
              </div>
              <div style={s.keyBox}>
                <p style={s.keyLabel}>{es ? "La pregunta clave" : "Key question"}</p>
                <p style={s.keyText}>{result.keyQuestion}</p>
              </div>
              <div style={s.recBox}>
                <p style={s.cardTitle("#a78bfa")}>{es ? "Recomendacion" : "Recommendation"}</p>
                <p style={s.cardText}>{result.recommendation}</p>
              </div>
              <div style={s.phraseBox}>
                <p style={s.phraseLabel}>{es ? "Para recordar" : "To remember"}</p>
                <p style={s.phraseText}>"{result.powerPhrase}"</p>
              </div>
            </div>
          ) : (
            <div>
              {!canAnalyze && (
                <div style={s.limitBox}>
                  <div>
                    <p style={s.limitTitle}>{es ? "Usaste tus 3 analisis de hoy." : "You used your 3 analyses."}</p>
                    <p style={s.limitSub}>{es ? "Actualiza para continuar" : "Upgrade to continue"}</p>
                  </div>
                  <button style={s.limitBtn} onClick={() => setShowUpgrade(true)}>{es ? "Actualizar a Pro" : "Upgrade to Pro"}</button>
                </div>
              )}
              <textarea style={{ ...s.textarea, opacity: canAnalyze ? 1 : 0.4 }} value={decision} onChange={(e) => setDecision(e.target.value)} placeholder={es ? "Describe tu decision... ej: Cambio de trabajo o me quedo?" : "Describe your decision..."} rows={4} disabled={!canAnalyze} />
              {canAnalyze && (
                <div>
                  <p style={s.exLabel}>{es ? "Ejemplos rapidos:" : "Quick examples:"}</p>
                  <div style={s.exWrap}>
                    {examples.map(ex => <button key={ex} style={s.exBtn} onClick={() => setDecision(ex)}>{ex}</button>)}
                  </div>
                </div>
              )}
              {error && <p style={s.errorText}>{error}</p>}
              <button style={canAnalyze ? (loading || !decision.trim() ? s.analyzeBtnDisabled : s.analyzeBtn) : s.upgradeBtnMain} onClick={canAnalyze ? analyze : () => setShowUpgrade(true)} disabled={loading || (canAnalyze && !decision.trim())}>
                {loading ? (es ? "Analizando..." : "Analyzing...") : canAnalyze ? (es ? "Analizar mi decision" : "Analyze my decision") : (es ? "Actualizar a Pro" : "Upgrade to Pro")}
              </button>
              {canAnalyze && !isPro && (
                <div style={s.dots}>
                  {Array.from({ length: FREE_LIMIT }).map((_, i) => <div key={i} style={s.dot(i < usedToday)} />)}
                  <span style={s.dotsText}>{freeLeft} {es ? "analisis restantes" : "left today"}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showUpgrade && (
        <div style={s.overlay} onClick={() => setShowUpgrade(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <button style={s.modalClose} onClick={() => setShowUpgrade(false)}>X</button>
            <div style={{ textAlign: "center" }}>
              <span style={s.modalBadge}>PRO</span>
              <p style={s.modalTitle}>{es ? "Desbloquea Decision Clara Pro" : "Unlock Clear Decision Pro"}</p>
              <p style={s.modalSub}>{es ? "Toma mejores decisiones, sin limites." : "Make better decisions, without limits."}</p>
            </div>
            <div style={s.billingToggle}>
              {["monthly", "yearly"].map(b => (
                <button key={b} style={s.billingBtn(billing === b)} onClick={() => setBilling(b)}>
                  {b === "monthly" ? (es ? "Mensual" : "Monthly") : (es ? "Anual" : "Yearly")}
                  {b === "yearly" && <span style={{ marginLeft: 6, background: "#059669", color: "white", fontSize: 10, padding: "2px 6px", borderRadius: 99 }}>{es ? "Ahorra 40%" : "Save 40%"}</span>}
                </button>
              ))}
            </div>
            <div style={s.price}>
              <span style={{ color: "#9ca3af", fontSize: 18 }}>$</span>
              <span style={s.priceNum}>{billing === "monthly" ? "9" : "5"}</span>
              <span style={s.pricePer}>{es ? "/mes" : "/mo"}</span>
            </div>
            <ul style={s.featureList}>
              {(es ? ["Analisis ilimitados cada dia", "Historial completo", "Analisis profundo", "Exportar resultados (pronto)", "Sin publicidad nunca"] : ["Unlimited daily analyses", "Full history", "Deep analysis", "Export results (soon)", "Never any ads"]).map(f => <li key={f} style={s.featureItem}>{"✅ " + f}</li>)}
            </ul>
            <button style={s.modalCta} onClick={() => { setIsPro(true); setUsedToday(0); setShowUpgrade(false); }}>{es ? "Comenzar Pro ahora" : "Start Pro now"}</button>
            <p style={s.modalCtaSub}>{es ? "Cancela cuando quieras" : "Cancel anytime"}</p>
          </div>
        </div>
      )}
      {showHistory && (
        <div style={s.historyOverlay} onClick={() => setShowHistory(false)}>
          <div style={s.historyPanel} onClick={(e) => e.stopPropagation()}>
            <div style={s.historyHeader}>
              <span style={s.historyTitle}>{es ? "Mis decisiones anteriores" : "My previous decisions"}</span>
              <button style={s.historyClose} onClick={() => setShowHistory(false)}>X</button>
            </div>
            {history.length === 0 ? <p style={s.emptyText}>{es ? "Aun no hay decisiones analizadas." : "No decisions yet."}</p> : <>
              {history.map((item, i) => (
                <div key={i} style={s.historyItem} onClick={() => { setResult(item.result); setCurrentDecision(item.decision); setShowHistory(false); }}>
                  <p style={s.historyDecision}>"{item.decision}"</p>
                  <div style={s.historyMeta}>
                    <span style={s.historyDate}>{item.date}</span>
                    <span style={s.riskBadge(item.result.riskColor)}>{item.result.riskLevel}</span>
                  </div>
                </div>
              ))}
              <button style={s.clearBtn} onClick={() => setHistory([])}>{es ? "Limpiar historial" : "Clear history"}</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
