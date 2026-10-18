import { Dithering } from "../vendor/paper/shaders/dithering";
import { GodRays } from "../vendor/paper/shaders/god-rays";
import { HalftoneCmyk } from "../vendor/paper/shaders/halftone-cmyk";
import { HalftoneDots } from "../vendor/paper/shaders/halftone-dots";
import { LiquidMetal } from "../vendor/paper/shaders/liquid-metal";
import { MeshGradient } from "../vendor/paper/shaders/mesh-gradient";
import { Metaballs } from "../vendor/paper/shaders/metaballs";
import { PaperFailureContext } from "../runtime/PaperFailureContext";
import type { EffectId } from "../catalog";
const fill = {
  width: "100%",
  height: "100%",
  position: "absolute" as const,
  inset: 0,
};
const image = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><rect width="1000" height="600" fill="#f4efde"/><circle cx="370" cy="280" r="210" fill="#26344a"/><circle cx="610" cy="220" r="150" fill="#d76c60"/><path d="M0 560L1000 150V600H0Z" fill="#5087a0"/></svg>')}`;
const metalImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><path fill="white" d="M400 95C515 20 680 165 615 285C735 370 575 565 450 475C335 595 135 460 205 335C75 210 270 45 400 95Z"/></svg>')}`;
function PaperRecipe({ id }: { id: EffectId }) {
  const common = { style: fill, maxPixelCount: 800_000, minPixelRatio: 1 };
  switch (id) {
    case "liquid-morph":
      return (
        <Metaballs
          {...common}
          speed={0.4}
          count={4}
          size={1}
          colors={["#f17a91", "#b38be5", "#efb17e"]}
          colorBack="#151422"
        />
      );
    case "metaballs":
      return (
        <Metaballs
          {...common}
          speed={0.45}
          count={10}
          size={0.45}
          colors={["#302b65"]}
          colorBack="#e8dfee"
        />
      );
    case "dithering":
      return (
        <Dithering
          {...common}
          speed={0.3}
          colorBack="#15172d"
          colorFront="#aaa5ec"
        />
      );
    case "halftone-dots":
      return <HalftoneDots {...common} image={image} speed={0.2} />;
    case "risograph-print":
      return <HalftoneCmyk {...common} image={image} speed={0.2} />;
    case "mesh-gradient":
      return (
        <MeshGradient
          {...common}
          speed={0.3}
          colors={["#5248c8", "#b58cf1", "#ed9d84", "#a4d9d5"]}
        />
      );
    case "liquid-metal":
      return (
        <LiquidMetal
          {...common}
          image={metalImage}
          scale={1.6}
          colorBack="#141322"
          speed={0.35}
        />
      );
    case "light-shafts":
      return <GodRays {...common} speed={0.4} />;
    default:
      return null;
  }
}

export function PaperEffect({
  id,
  onFailure,
}: {
  id: EffectId;
  onFailure: () => void;
}) {
  return (
    <PaperFailureContext value={onFailure}>
      <PaperRecipe id={id} />
    </PaperFailureContext>
  );
}
