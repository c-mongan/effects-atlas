import { useEffect, useState, type RefObject } from "react";
/** Stop expensive renderers outside the viewport; degrade safely in older hosts. */
export function useInViewport(ref: RefObject<Element | null>) {
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}
