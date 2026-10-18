import { createContext } from "react";
/** Local to a single Paper renderer; never listens for global promise rejections. */
export const PaperFailureContext = createContext<() => void>(() => {});
