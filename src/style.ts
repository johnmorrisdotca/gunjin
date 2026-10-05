export const GUNJIN_STYLE = `
.gj-root{font:1rem/1.45 system-ui,sans-serif;color:var(--kz-ink,#202521);max-width:62rem;margin:auto}
.gj-board{position:relative;width:min(100%,42rem);margin:1rem auto;outline:none}
.gj-cells{position:absolute;inset:0;display:grid;grid-template-columns:repeat(var(--gj-width),1fr);grid-template-rows:repeat(var(--gj-height),1fr)}
.gj-cell{min-width:0;min-height:0;border:0;background:transparent;cursor:pointer;color:transparent}
.gj-cell:focus-visible{outline:3px solid #c4972e;outline-offset:-3px}
.gj-tools{display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;margin:.75rem 0}
.gj-battle-history{width:min(100%,42rem);margin:.75rem auto;padding:.5rem 1rem;border:1px solid #a98954;border-radius:.5rem;background:#fffdf7;color:#273029}
.gj-battle-history h2{font-size:1rem;margin:.25rem 0}
.gj-battle-history ol{margin:.25rem 0;padding-inline-start:1.5rem}
.gj-tools button,.gj-primary{font:inherit;padding:.5rem .9rem;border:1px solid #8d927f;border-radius:.55rem;background:var(--kz-paper,#fbf8f1);color:inherit;min-height:2.75rem}
.gj-primary{background:#315d46;color:white;border-color:#315d46}
.gj-status{min-height:1.5em;text-align:center;font-weight:600}
.gj-pass{padding:2rem 1rem;text-align:center;border-radius:1rem;background:var(--kz-paper,#fbf8f1)}
.gj-pass h2{margin-top:0}
.gj-setup-count{text-align:center}
.gj-settings{display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center}
.gj-settings label{display:grid;gap:.25rem}
.gj-settings select{font:inherit;padding:.45rem;border-radius:.4rem}
`;
