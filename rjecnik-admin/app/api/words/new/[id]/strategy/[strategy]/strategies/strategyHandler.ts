import { WordProcessingStrategy } from "@/app/api/words/contracts";
import { applyFrequencyOnly } from "./frequencyOnly";
import { applyRemoveNewWord } from "./removeNewWord";
import { applyNewWordForm } from "./newWordForm";
import { applyExistingWordForm } from "./existingWordForm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerFn = (id: number, body: any) => Promise<any>;

const strategyMap: Record<WordProcessingStrategy, HandlerFn> = {
  "New Definition": async () => ({}),
  Ignore: async () => ({}),
  "Frequency Only": applyFrequencyOnly,
  "New Example": async () => ({}),
  "New Form": applyNewWordForm,
  "Existing Form": applyExistingWordForm,
  "New Headword": async () => ({}),
  Remove: applyRemoveNewWord,
};



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleStrategy(id: number, strategy: string, body: any) {
  if (!(strategy in strategyMap)) {
    throw new Error(`Nepoznata strategija: ${strategy}`);
  }

  const handler = strategyMap[strategy as WordProcessingStrategy];
  return await handler(id, body);
}