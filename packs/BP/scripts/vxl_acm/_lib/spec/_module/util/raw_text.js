/**
 * Creates a simple text component.
 * @param value - The text value.
 * @returns Text component object.
 */
const TEXT = (value) => ({
    text: value
});
/**
 * Creates a translation component with optional 'with' parameters.
 * @param key - The translation key.
 * @param params - The optional parameters for translation.
 * @returns Translation component object.
 */
const TRANSLATE = (key, ...params) => ({
    translate: key,
    with: params.length ? params : undefined
});
/**
 * Creates a score component.
 * @param name - The entity's name whose score is being displayed.
 * @param objective - The name of the score objective.
 * @returns Score component object.
 */
const SCORE = (name, objective) => ({
    score: {
        name: name,
        objective: objective
    }
});
/**
 * Wraps various text components into a rawtext structure.
 * @param rawText - The raw text components.
 * @returns Raw text object.
 */
const MESSAGE = (...rawText) => ({
    rawtext: rawText
});
const RawText = {
    TEXT,
    TRANSLATE,
    SCORE,
    MESSAGE
};
export { RawText };
