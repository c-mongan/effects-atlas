import type { RecipeId } from "./catalog";
export function StaticRecipe({ id }: { id: RecipeId }) {
  return (
    <div
      className={`ea-recipe-static ea-recipe-static-${id}`}
      aria-hidden="true"
      data-testid="recipe-static"
    >
      <div className="ea-recipe-orbit" />
      <div className="ea-recipe-object" />
      <div className="ea-recipe-plinth" />
      {Array.from({ length: 12 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${12 + ((i * 29) % 78)}%`,
            top: `${15 + ((i * 17) % 65)}%`,
            transform: `rotate(${i * 31}deg)`,
          }}
        />
      ))}
    </div>
  );
}
