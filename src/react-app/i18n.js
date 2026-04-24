import { createContext, useContext } from "react";
import pl from "../i18n/pl.json";
import en from "../i18n/en.json";

export const DICT = { pl, en };

export const LangCtx = createContext({
  lang: "pl",
  t: DICT.pl,
  setLang: () => {},
});

export const useT = () => useContext(LangCtx);
