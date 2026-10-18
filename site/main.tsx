import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Effect, type EffectId } from "../src";
import { Recipe } from "../src/Recipe";
import { examples, getExample, type ExampleDefinition } from "../src/discovery";
import {
  codeForExample,
  downloadStarter,
  type StarterSelection,
} from "./starter";
import "./site.css";
const legacyPath = new URLSearchParams(location.search).get("path");
if (legacyPath?.startsWith("/story/") || legacyPath?.startsWith("/docs/"))
  location.replace(`./storybook/${location.search}${location.hash}`);
const jumpTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView();
  document.getElementById(id)?.focus();
};
type Settings = NonNullable<StarterSelection["settings"]>;
function readSettings(example: ExampleDefinition, query: string): Settings {
  const params = new URLSearchParams(query),
    result: Settings = {};
  for (const key of ["speed", "intensity"] as const) {
    const raw = params.get(key),
      n = Number(raw);
    if (
      example.controls.includes(key) &&
      raw !== null &&
      Number.isFinite(n) &&
      n >= (example.kind === "recipe" ? 0.25 : 0) &&
      n <= 2
    )
      result[key] = n;
  }
  const colors = params.get("colors")?.split(",");
  if (
    example.controls.includes("color") &&
    colors?.length &&
    colors.length <= example.defaultColors.length &&
    colors.every((c) => /^#[\da-f]{6}$/i.test(c))
  )
    result.colors = example.defaultColors.map(
      (color, index) => colors[index] ?? color,
    );
  return result;
}
function setSettings(example: ExampleDefinition, settings: Settings) {
  const params = new URLSearchParams();
  if (settings.speed !== undefined) params.set("speed", String(settings.speed));
  if (settings.intensity !== undefined)
    params.set("intensity", String(settings.intensity));
  if (settings.colors) params.set("colors", settings.colors.join(","));
  location.hash = `/example/${example.id}${params.size ? `?${params}` : ""}`;
}
function Art({ example }: { example: ExampleDefinition }) {
  const n = examples.indexOf(example),
    color = ["#b6a6ef", "#f0a78c", "#88c6c4"][n % 3];
  const variant = /type|neon|glitch|ascii|text/.test(example.id)
    ? "type"
    : example.category.toLowerCase();
  return (
    <svg
      viewBox="0 0 600 360"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="thumbnail-art"
    >
      <rect
        width="600"
        height="360"
        fill={n % 3 === 1 ? "#262032" : "#191828"}
      />
      {variant === "type" ? (
        <text
          x="300"
          y="205"
          fill={color}
          textAnchor="middle"
          fontFamily="system-ui"
          fontSize="65"
          fontWeight="800"
        >
          {example.id.includes("ascii")
            ? "# FORM #"
            : example.id.includes("neon")
              ? "AFTER DARK"
              : "Make waves."}
        </text>
      ) : /particle/.test(variant) ? (
        Array.from({ length: 70 }, (_, i) => (
          <circle
            key={i}
            cx={40 + ((i * 137) % 520)}
            cy={35 + ((i * 67) % 290)}
            r={2 + (i % 4)}
            fill={color}
            opacity={0.35 + (i % 5) / 8}
          />
        ))
      ) : /geometric|3d/.test(variant) ? (
        <g transform={`translate(300 180) rotate(${n * 13})`}>
          {Array.from({ length: 7 }, (_, i) => (
            <rect
              key={i}
              x={-130 + i * 10}
              y={-120 + i * 10}
              width={240 - i * 20}
              height={240 - i * 20}
              rx={example.category === "3D" ? 75 : 3}
              fill="none"
              stroke={i % 2 ? "#f0a78c" : color}
              strokeWidth={10}
            />
          ))}
        </g>
      ) : /texture/.test(variant) ? (
        <>
          {Array.from({ length: 150 }, (_, i) => (
            <circle
              key={i}
              cx={25 + (i % 25) * 24}
              cy={65 + Math.floor(i / 25) * 45}
              r={3 + Math.sin(i * 0.3) * 2 + Math.floor(i / 25)}
              fill={i % 3 ? color : "#88c6c4"}
            />
          ))}
        </>
      ) : (
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse
              key={i}
              cx={165 + i * 65}
              cy={170 + Math.sin(i + n) * 45}
              rx={85 - i * 7}
              ry={110 - i * 7}
              transform={`rotate(${i * 25},${165 + i * 65},180)`}
              fill={i % 2 ? "#88c6c4" : color}
              opacity={0.65}
            />
          ))}
        </>
      )}
      {variant === "surface" && (
        <rect
          x="140"
          y="85"
          width="320"
          height="190"
          rx="14"
          fill="#ffffff18"
          stroke="#ffffff60"
        />
      )}
    </svg>
  );
}
function StaticThumbnail({ example }: { example: ExampleDefinition }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [example.id]);
  return failed ? (
    <div
      className="static-preview"
      role="img"
      aria-label={`Original static illustration of ${example.name}`}
    >
      <Art example={example} />
    </div>
  ) : (
    <img
      className="static-preview thumbnail-image"
      src={`${import.meta.env.BASE_URL}previews/${example.id}.webp`}
      alt={`Static preview of ${example.name}`}
      loading="lazy"
      decoding="async"
      width={600}
      height={360}
      onError={() => setFailed(true)}
    />
  );
}
function Preview({
  example,
  settings,
  active = true,
  paused = false,
}: {
  example: ExampleDefinition;
  settings?: Settings;
  active?: boolean;
  paused?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="preview"
      role="group"
      aria-label={`${example.name} preview`}
      data-preview-kind={example.kind}
      data-preview-active={active && visible && !paused ? "true" : "false"}
    >
      {active && visible ? (
        example.kind === "effect" ? (
          <Effect
            id={example.id as EffectId}
            settings={settings}
            paused={paused}
          />
        ) : (
          <Recipe
            id={example.id as React.ComponentProps<typeof Recipe>["id"]}
            settings={settings}
            paused={paused}
          />
        )
      ) : (
        <StaticThumbnail example={example} />
      )}
    </div>
  );
}
function sourceGroup(source: string): string {
  for (const [needle, label] of [
    ["Paper Shaders", "Paper Shaders"],
    ["Motion Primitives", "Motion Primitives"],
    ["Drei", "Drei"],
    ["Motion composition", "Motion"],
    ["tsParticles", "tsParticles"],
    ["Sprite Lite", "Sprite Lite"],
    ["Three.js", "Three.js"],
    ["UI FX Kit", "UI FX Kit"],
    ["Magic UI", "Magic UI"],
    ["WebGL-Mandelbulb", "WebGL Mandelbulb"],
  ])
    if (source.includes(needle)) return label;
  return source.startsWith("Shaders") ? "Shaders" : "Effects Atlas";
}
function Gallery() {
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [use, setUse] = useState(""),
    [engine, setEngine] = useState(""),
    [source, setSource] = useState(""),
    [active, setActive] = useState<string | null>(null);
  const reset = () => {
    setSearch("");
    setCategory("");
    setUse("");
    setEngine("");
    setSource("");
    setActive(null);
  };
  const matches = examples.filter(
    (e) =>
      `${e.name} ${e.description} ${e.category} ${e.source}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!category || e.category === category) &&
      (!use || e.useCases.includes(use)) &&
      (!engine || e.renderer === engine) &&
      (!source || sourceGroup(e.source) === source),
  );
  const select = (
    label: string,
    value: string,
    setter: (v: string) => void,
    values: string[],
  ) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => {
          setter(event.target.value);
          setActive(null);
        }}
      >
        <option value="">
          All {label === "Category" ? "categories" : `${label.toLowerCase()}s`}
        </option>
        {[...new Set(values)].sort().map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </label>
  );
  return (
    <>
      <section className="intro">
        <div>
          <p className="intro-note">A field guide for expressive websites</p>
          <h1>
            Find your next
            <br />
            <span>visual direction.</span>
          </h1>
          <p>
            Explore effects, try a small change, then take the code into your
            own project. Start with the look. Learn how it works.
          </p>
          <a className="text-link" href="#/guide">
            New here? Read the quick start <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="intro-art">
          <StaticThumbnail example={getExample("mesh-gradient")!} />
          <span>Color, form & a little motion.</span>
        </div>
      </section>
      <section aria-labelledby="gallery-heading">
        <div className="section-heading">
          <h2 id="gallery-heading">The collection</h2>
          <p>{examples.length} examples · static previews</p>
        </div>
        <div className="filters">
          <label className="search">
            Search
            <input
              type="search"
              placeholder="Try “gradient” or “type”"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActive(null);
              }}
            />
          </label>
          {select(
            "Category",
            category,
            setCategory,
            examples.map((e) => e.category),
          )}
          {select(
            "Use",
            use,
            setUse,
            examples.flatMap((e) => e.useCases),
          )}
          {select(
            "Engine",
            engine,
            setEngine,
            examples.map((e) => e.renderer),
          )}
          {select(
            "Source",
            source,
            setSource,
            examples.map((e) => sourceGroup(e.source)),
          )}
          <button onClick={reset}>Clear filters</button>
        </div>
        <p className="result-count" role="status">
          {matches.length} {matches.length === 1 ? "example" : "examples"}{" "}
          found. Press Play to try one. Motion stops when you leave the preview.
        </p>
        <div className="gallery">
          {matches.map((e) => (
            <article
              className="example-card"
              key={e.id}
              onMouseLeave={() => setActive((id) => (id === e.id ? null : id))}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setActive((id) => (id === e.id ? null : id));
              }}
            >
              <div className="card-art">
                <Preview example={e} active={active === e.id} />
                {active !== e.id && (
                  <span className="static-label">Static preview</span>
                )}
                <button
                  className="play"
                  aria-label={`${active === e.id ? "Pause" : "Play"} ${e.name}`}
                  aria-pressed={active === e.id}
                  onClick={() => setActive(active === e.id ? null : e.id)}
                >
                  {active === e.id ? "Ⅱ Pause" : "▷ Play"}
                </button>
              </div>
              <div className="card-copy">
                <div className="card-meta">
                  <span>{e.category}</span>
                  <span>{e.kind === "recipe" ? "Recipe" : e.renderer}</span>
                </div>
                <h3>
                  <a href={`#/example/${e.id}`}>
                    {e.name}
                    <span aria-hidden="true">↗</span>
                  </a>
                </h3>
                <p>{e.description}</p>
              </div>
            </article>
          ))}
        </div>
        {!matches.length && (
          <div className="empty">
            <h3>No examples match these filters.</h3>
            <p>Try a broader search or remove a filter.</p>
            <button onClick={reset}>Clear all filters</button>
          </div>
        )}
      </section>
      <section className="composition-links">
        <div>
          <h2>See the effect in a real layout.</h2>
          <p>A strong effect needs room, contrast, and useful content.</p>
        </div>
        <a href="#/compositions/product-hero">Product hero ↗</a>
        <a href="#/compositions/portfolio-card">Portfolio project ↗</a>
        <a href="#/compositions/feature-section">Feature section ↗</a>
      </section>
    </>
  );
}
function Detail({
  example,
  query,
}: {
  example: ExampleDefinition;
  query: string;
}) {
  const settings = readSettings(example, query),
    selection: StarterSelection = {
      kind: example.kind,
      id: example.id,
      settings,
    };
  const [paused, setPaused] = useState(false),
    [tab, setTab] = useState("Code"),
    [message, setMessage] = useState(""),
    [manual, setManual] = useState(false);
  const code = codeForExample(selection);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Code copied.");
      setManual(false);
    } catch {
      setManual(true);
      setMessage("Clipboard is unavailable. Select and copy the code below.");
    }
  };
  return (
    <>
      <a className="back" href="#/">
        ← Back to the collection
      </a>
      <header className="detail-header">
        <div>
          <p className="intro-note">
            {example.category} / {example.renderer}
          </p>
          <h1>{example.name}</h1>
          <p>{example.description}</p>
        </div>
        <span className="tag">{example.license}</span>
      </header>
      <div className="detail-grid">
        <div className="detail-stage">
          <Preview example={example} settings={settings} paused={paused} />
          <button onClick={() => setPaused(!paused)} aria-pressed={paused}>
            {paused ? "Resume preview" : "Pause preview"}
          </button>
        </div>
        <aside className="controls">
          <h2>Make it yours</h2>
          <p>Only controls supported by this example are shown.</p>
          {example.controls.map((control) =>
            control === "color" ? (
              <fieldset key={control}>
                <legend>Colors</legend>
                {(settings.colors || example.defaultColors).map(
                  (color, index) => (
                    <label className="color-control" key={index}>
                      Color {index + 1}
                      <input
                        type="color"
                        value={color}
                        onChange={(event) => {
                          const colors = [
                            ...(settings.colors || example.defaultColors),
                          ];
                          colors[index] = event.target.value;
                          setSettings(example, { ...settings, colors });
                        }}
                      />
                    </label>
                  ),
                )}
              </fieldset>
            ) : (
              <label key={control}>
                {control === "speed" ? "Speed" : "Intensity"}{" "}
                <output>{settings[control] ?? 1}×</output>
                <input
                  type="range"
                  aria-label={control === "speed" ? "Speed" : "Intensity"}
                  min={example.kind === "recipe" ? "0.25" : "0"}
                  max="2"
                  step={example.kind === "recipe" ? "0.05" : "0.1"}
                  value={settings[control] ?? 1}
                  onChange={(event) =>
                    setSettings(example, {
                      ...settings,
                      [control]: Number(event.target.value),
                    })
                  }
                />
              </label>
            ),
          )}
          {!example.controls.length && (
            <p>
              This example has a fixed visual treatment. Use the source as a
              starting point for deeper changes.
            </p>
          )}
          <button
            onClick={() => {
              setSettings(example, {});
              setPaused(false);
              setMessage("Settings reset.");
            }}
          >
            Reset settings
          </button>
          <p className="hint">
            The address keeps your settings. Copy the page URL to share this
            version.
          </p>
          <button
            className="primary"
            onClick={async () => {
              try {
                await downloadStarter(selection);
                setMessage("Starter downloaded.");
              } catch (error) {
                setMessage(
                  `Could not download the starter: ${error instanceof Error ? error.message : "Please try again."}`,
                );
              }
            }}
          >
            Download starter ↓
          </button>
        </aside>
      </div>
      <section className="detail-info">
        <div
          className="tabs"
          role="tablist"
          aria-label="Example information"
          onKeyDown={(event) => {
            const names = ["Code", "Usage", "Source"];
            const index = names.indexOf(tab);
            const next =
              event.key === "ArrowRight"
                ? (index + 1) % 3
                : event.key === "ArrowLeft"
                  ? (index + 2) % 3
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? 2
                      : -1;
            if (next < 0) return;
            event.preventDefault();
            setTab(names[next]);
            document.getElementById(`tab-${names[next]}`)?.focus();
          }}
        >
          {["Code", "Usage", "Source"].map((name) => (
            <button
              key={name}
              id={`tab-${name}`}
              role="tab"
              tabIndex={tab === name ? 0 : -1}
              aria-selected={tab === name}
              aria-controls="detail-panel"
              onClick={() => setTab(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div id="detail-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {tab === "Code" ? (
            <>
              <div className="code-heading">
                <p>This code uses your current settings.</p>
                <button onClick={copy}>Copy code</button>
              </div>
              <pre tabIndex={0}>
                <code>{code}</code>
              </pre>
              {manual && (
                <label>
                  Copy manually
                  <textarea
                    aria-label="Code to copy manually"
                    readOnly
                    value={code}
                    onFocus={(e) => e.currentTarget.select()}
                  />
                </label>
              )}
              <p>
                <a href="#/guide">Install and use the starter →</a>
              </p>
            </>
          ) : tab === "Usage" ? (
            <div className="usage">
              <div>
                <h2>Use it for</h2>
                <p>{example.guidance.use}</p>
                <p>{example.useCases.join(" · ")}</p>
              </div>
              <div>
                <h2>Take care with</h2>
                <p>{example.guidance.avoid}</p>
                <p>
                  Keep text in the document. Check contrast and reduced motion
                  on your target devices.
                </p>
              </div>
            </div>
          ) : (
            <>
              <h2>Source & license</h2>
              <p>
                {example.source} · {example.license}
              </p>
              <p>
                <a href={example.sourceUrl} target="_blank" rel="noreferrer">
                  Open upstream source ↗
                </a>
              </p>
              <p>
                Retain the applicable license and attribution notices when you
                reuse or adapt this example. The starter includes source
                details.
              </p>
              <a href="#/sources">Browse all sources →</a>
            </>
          )}
        </div>
        <p role="status" className="feedback">
          {message}
        </p>
      </section>
    </>
  );
}
const guideSections = [
  [
    "Choose an effect",
    "Start with the job: a hero sets the mood, a card highlights one item, and a background supports content. Use the category and use filters to narrow the collection. A simple CSS effect often fits a small accent. Use 3D or particles when the scene needs them.",
  ],
  [
    "Install the starter",
    "Open an example and select Download starter. Unzip the folder. In a terminal, enter the folder and run npm install, then npm run dev. The starter README lists its runtime requirements and files. Keep the package lock generated by your installation.",
  ],
  [
    "Add it to your page",
    "Keep headings, links, and buttons as real HTML beside or above the visual. Give the preview a clear width and height. Start with one effect. Use the Code tab to copy the same settings you see in the preview.",
  ],
  [
    "Customize with purpose",
    "Change one control at a time. Speed changes motion rate; intensity changes visual strength where supported. Colors change the supported palette. Reset returns to the default. The page address stores valid settings, so you can share a version with a teammate.",
  ],
  [
    "Keep it accessible",
    "Every important message must remain readable without animation. Provide a pause control. Respect prefers-reduced-motion. Test keyboard focus, touch input, 200% zoom, and text contrast at the lightest and darkest animation frames. Never make motion or color the only way to understand an action.",
  ],
  [
    "Set a performance budget",
    "Use one animated focal point per view. Load heavy renderers only when needed, and stop them when offscreen or when the page is hidden. Test on a real phone. Reduce scene detail before increasing frame work. Avoid placing several WebGL or WebGPU canvases on the same screen.",
  ],
  [
    "Plan for fallback",
    "GPU support, device limits, and context loss can prevent a live effect. Keep a static image or CSS treatment in the same space. This collection uses original static artwork while a renderer is unavailable, paused, or reduced motion is requested. A fallback is a complete visual state; it must not hide page content.",
  ],
  [
    "Keep attribution",
    "The Atlas includes original work, adapted examples, and dependency-based recipes. The Source tab names each upstream project and license. Keep MIT notices, Apache notices, and any other supplied terms with redistributed code. Reference-only links are inspiration; they do not grant permission to copy assets.",
  ],
];
function Guide() {
  return (
    <article className="guide">
      <a className="back" href="#/">
        ← Back to the collection
      </a>
      <h1>
        A little motion.
        <br />A clear purpose.
      </h1>
      <p className="lede">
        From a first preview to a useful part of your website.
      </p>
      <ol>
        {guideSections.map(([title, text]) => (
          <li key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
            {title === "Install the starter" && (
              <pre>
                <code>npm install{"\n"}npm run dev</code>
              </pre>
            )}
          </li>
        ))}
      </ol>
      <a className="primary" href="#/">
        Choose your first example →
      </a>
    </article>
  );
}
const sources = [
  [
    "Paper Shaders",
    "Apache-2.0",
    "https://github.com/paper-design/shaders",
    "Selected adapters and shader dependency.",
  ],
  [
    "Shaders",
    "MIT",
    "https://github.com/shader-effects-inc/shaders",
    "WebGPU effects through shaders/react.",
  ],
  [
    "Three.js",
    "MIT",
    "https://github.com/mrdoob/three.js",
    "Original 3D scenes. No external models.",
  ],
  [
    "Sprite Lite",
    "MIT",
    "https://github.com/marcsist/sprite-lite",
    "Small animated SVG pixel studies.",
  ],
  [
    "WebGL-Mandelbulb",
    "MIT",
    "https://github.com/matt-k-wong/WebGL-Mandelbulb",
    "Adapted distance estimator with numerical guards.",
  ],
  [
    "UI FX Kit",
    "MIT",
    "https://github.com/pptt3300/ui-fx-kit",
    "Adapted pointer, touch, and keyboard foil interaction.",
  ],
  [
    "Magic UI",
    "MIT",
    "https://github.com/magicuidesign/magicui",
    "Adapted CSS perspective grid.",
  ],
  [
    "Bauhaus UI",
    "Reference only",
    "https://github.com/xhu96/bauhaus-ui-library",
    "Design inspiration. Original Atlas SVG.",
  ],
  [
    "Motion",
    "MIT",
    "https://github.com/motiondivision/motion",
    "Animation library used by original motion recipes.",
  ],
  [
    "tsParticles",
    "MIT",
    "https://github.com/tsparticles/tsparticles",
    "Particle engine used by original particle recipes.",
  ],
  [
    "Drei / React Three Fiber",
    "MIT",
    "https://github.com/pmndrs/drei",
    "Scene helpers used by original 3D recipes.",
  ],
  [
    "Motion Primitives",
    "Reference only",
    "https://github.com/ibelick/motion-primitives",
    "Design reference for original Atlas text, feature, and panel recipes. No upstream component code is bundled.",
  ],
  [
    "React Bits",
    "Reference only",
    "https://reactbits.dev",
    "Inspiration and discovery link. No code or assets copied.",
  ],
];
function Sources() {
  return (
    <article className="sources">
      <h1>Good work has roots.</h1>
      <p className="lede">
        Explore the projects behind this collection. Each example keeps its own
        source and license details.
      </p>
      <div className="source-list">
        {sources.map(([name, license, url, note]) => (
          <section key={name}>
            <h2>
              <a href={url} target="_blank" rel="noreferrer">
                {name} ↗
              </a>
            </h2>
            <span className="tag">{license}</span>
            <p>{note}</p>
          </section>
        ))}
      </div>
      <p>
        Original Atlas code and artwork use MIT. Dependency licenses remain
        separate. Keep the notices supplied with your starter.
      </p>
    </article>
  );
}
function Composition({ id }: { id: string }) {
  const [live, setLive] = useState(false);
  const data =
    id === "portfolio-card"
      ? {
          name: "Portfolio project",
          effect: "holographic-foil",
          brand: "Mira / Design & direction",
          title: "Objects with a point of view.",
          body: "I build thoughtful identities and digital spaces for people who make things.",
          label: "Selected project — Forma",
          detail:
            "A visual identity for a studio that turns everyday materials into lasting objects.",
        }
      : id === "feature-section"
        ? {
            name: "Feature section",
            effect: "flow-fields",
            brand: "Current / Team workspace",
            title: "Find a clearer path through your day.",
            body: "Bring your notes, decisions, and next steps into one calm workspace.",
            label: "From idea to next step",
            detail:
              "Capture a thought, connect it to a project, and give it an owner. Your team can see what changed and what comes next.",
          }
        : {
            name: "Product hero",
            effect: "mesh-gradient",
            brand: "Still / Focus sessions",
            title: "Make space for your best work.",
            body: "A quiet timer for deep work. Choose one task, set a session, and let everything else wait.",
            label: "Built for a calmer working day",
            detail:
              "Simple sessions. Useful breaks. A clear record of the work you chose to do.",
          };
  return (
    <>
      <div className="composition-toolbar">
        <a href="#/">← Collection</a>
        <span>{data.name} / example layout</span>
        <button onClick={() => setLive(!live)}>
          {live ? "Pause effect" : "Play effect"}
        </button>
      </div>
      <article className={`composition ${id}`}>
        <header>
          <strong>{data.brand}</strong>
          <a
            href="#composition-details"
            onClick={(event) => jumpTo(event, "composition-details")}
          >
            Explore ↓
          </a>
        </header>
        <section className="composition-hero">
          <div>
            <h1>{data.title}</h1>
            <p>{data.body}</p>
            <a
              className="primary"
              href="#composition-details"
              onClick={(event) => jumpTo(event, "composition-details")}
            >
              See how it works →
            </a>
          </div>
          <div className="composition-visual">
            <Preview example={getExample(data.effect)!} active={live} />
          </div>
        </section>
        <section
          tabIndex={-1}
          id="composition-details"
          className="composition-detail"
        >
          <h2>{data.label}</h2>
          <p>{data.detail}</p>
          <div className="composition-facts">
            <p>
              <strong>
                {id === "portfolio-card" ? "Strategy" : "01 / Choose"}
              </strong>
              {id === "portfolio-card"
                ? "A distinct voice, grounded in the craft."
                : "Start with one meaningful thing."}
            </p>
            <p>
              <strong>
                {id === "portfolio-card" ? "Identity" : "02 / Focus"}
              </strong>
              {id === "portfolio-card"
                ? "A flexible system for print and screen."
                : "Give it your full attention."}
            </p>
            <p>
              <strong>
                {id === "portfolio-card" ? "Digital" : "03 / Reflect"}
              </strong>
              {id === "portfolio-card"
                ? "A simple experience that lets the work lead."
                : "Keep what helped. Adjust tomorrow."}
            </p>
          </div>
        </section>
        <footer>
          Example website content ·{" "}
          <a href={`#/example/${data.effect}`}>Get this effect ↗</a>
        </footer>
      </article>
    </>
  );
}
function App() {
  const [hash, setHash] = useState(location.hash || "#/");
  useEffect(() => {
    const update = () => setHash(location.hash || "#/");
    addEventListener("hashchange", update);
    return () => removeEventListener("hashchange", update);
  }, []);
  const [route, query = ""] = hash.replace(/^#/, "").split("?");
  const example = route.startsWith("/example/")
    ? getExample(route.slice(9))
    : undefined;
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = example
      ? `${example.name} — Effects Atlas`
      : "Effects Atlas — Find your visual direction";
  }, [route, example]);
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(event) => jumpTo(event, "main")}
      >
        Skip to content
      </a>
      <header className="site-header">
        <a className="wordmark" href="#/">
          Effects<span>Atlas</span>
          <span className="brand-dot" aria-hidden="true">
            ✳
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#/" aria-current={route === "/" ? "page" : undefined}>
            Collection
          </a>
          <a
            href="#/guide"
            aria-current={route === "/guide" ? "page" : undefined}
          >
            Guide
          </a>
          <a
            href="#/sources"
            aria-current={route === "/sources" ? "page" : undefined}
          >
            Sources
          </a>
          <a href="./storybook/">Storybook ↗</a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        {route === "/" || route === "" ? (
          <Gallery />
        ) : example ? (
          <Detail key={example.id} example={example} query={query} />
        ) : route === "/guide" ? (
          <Guide />
        ) : route === "/sources" ? (
          <Sources />
        ) : ["product-hero", "portfolio-card", "feature-section"].some(
            (id) => route === `/compositions/${id}`,
          ) ? (
          <Composition key={route} id={route.split("/")[2]} />
        ) : (
          <section className="empty">
            <h1>That example is not here.</h1>
            <p>
              The link may be incomplete. Find an example in the collection.
            </p>
            <a href="#/">Back to the collection →</a>
          </section>
        )}
      </main>
      <footer className="site-footer">
        <a className="wordmark" href="#/">
          Effects<span>Atlas</span>
        </a>
        <p>Explore freely. Build thoughtfully. Keep the credits.</p>
        <a href="#/guide">Start building ↗</a>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
