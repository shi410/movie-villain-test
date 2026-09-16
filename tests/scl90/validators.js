(function initializeScl90Validators(global, factory) {
  "use strict";
  const validators = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = validators;
  if (global) global.Scl90Validators = validators;
})(typeof globalThis !== "undefined" ? globalThis : this, function createValidators() {
  "use strict";
  const ANSWER_COUNT = 90;

  function validateAnswers(answers) {
    if (!Array.isArray(answers)) throw new TypeError("SCL-90 answers must be an array.");
    if (answers.length !== ANSWER_COUNT) {
      throw new RangeError("SCL-90 answers must contain exactly 90 items.");
    }
    answers.forEach((answer, index) => {
      if (!Number.isInteger(answer) || answer < 1 || answer > 5) {
        throw new TypeError(`SCL-90 answer Q${index + 1} must be an integer from 1 to 5.`);
      }
    });
    return answers;
  }

  function validateFactorDefinitions(definitions) {
    if (!Array.isArray(definitions) || definitions.length !== 10) {
      throw new TypeError("SCL-90 must define exactly ten report dimensions.");
    }
    const ids = new Set();
    const itemNumbers = new Set();
    definitions.forEach(definition => {
      if (!definition || typeof definition.id !== "string" || ids.has(definition.id)) {
        throw new TypeError("Each SCL-90 factor must have one unique id.");
      }
      ids.add(definition.id);
      if (!Array.isArray(definition.itemNumbers) || definition.itemNumbers.length !== definition.itemCount) {
        throw new Error(`SCL-90 factor ${definition.id} has an invalid item count.`);
      }
      definition.itemNumbers.forEach(questionNumber => {
        if (!Number.isInteger(questionNumber) || questionNumber < 1 || questionNumber > 90) {
          throw new RangeError(`SCL-90 factor ${definition.id} contains an invalid question number.`);
        }
        if (itemNumbers.has(questionNumber)) {
          throw new Error(`SCL-90 question Q${questionNumber} appears in multiple dimensions.`);
        }
        itemNumbers.add(questionNumber);
      });
    });
    if (itemNumbers.size !== 90) throw new Error("SCL-90 factors must cover Q1-Q90 exactly once.");
    for (let questionNumber = 1; questionNumber <= 90; questionNumber += 1) {
      if (!itemNumbers.has(questionNumber)) throw new Error(`SCL-90 factors are missing Q${questionNumber}.`);
    }
    const additional = definitions.find(definition => definition.id === "additional");
    const core = definitions.filter(definition => definition.id !== "additional");
    if (!additional || additional.itemCount !== 7 || additional.includeInRadar !== false) {
      throw new Error("SCL-90 additional must have seven items and stay outside the radar chart.");
    }
    if (core.length !== 9 || core.some(definition => definition.includeInRadar !== true)) {
      throw new Error("All nine core SCL-90 factors must enter the radar chart.");
    }
    return definitions;
  }

  function assertJsonSafe(value, path, seen) {
    if (value === null || typeof value === "string" || typeof value === "boolean") return;
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new TypeError(`${path} contains a non-finite number.`);
      return;
    }
    if (typeof value !== "object") throw new TypeError(`${path} contains a value that is not JSON safe.`);
    if (seen.has(value)) throw new TypeError(`${path} contains a circular reference.`);
    seen.add(value);
    if (Array.isArray(value)) {
      value.forEach((entry, index) => assertJsonSafe(entry, `${path}[${index}]`, seen));
      seen.delete(value);
      return;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${path} must contain only plain objects and arrays.`);
    }
    Object.keys(value).forEach(key => assertJsonSafe(value[key], `${path}.${key}`, seen));
    seen.delete(value);
  }

  function validateResultPayloadIdentity(resultPayload) {
    if (!resultPayload || typeof resultPayload !== "object" || Array.isArray(resultPayload)) {
      throw new TypeError("SCL-90 resultPayload must be an object.");
    }
    if (resultPayload.testId !== "scl90") {
      throw new TypeError("SCL-90 resultPayload must use testId scl90.");
    }
    assertJsonSafe(resultPayload, "resultPayload", new Set());
    return resultPayload;
  }

  function validateCurrentResultPayload(resultPayload) {
    validateResultPayloadIdentity(resultPayload);
    if (resultPayload.schemaVersion !== 1) {
      throw new TypeError("Current SCL-90 resultPayload schemaVersion must be 1.");
    }
    if (!resultPayload.total || !resultPayload.symptoms || !resultPayload.factors || !resultPayload.additional) {
      throw new TypeError("Current SCL-90 resultPayload is missing scoring sections.");
    }
    if (resultPayload.reportContext !== undefined) {
      const context = resultPayload.reportContext;
      const generatedAt = new Date(context?.generatedAt);
      if (
        !context ||
        typeof context !== "object" ||
        Array.isArray(context) ||
        typeof context.generatedAt !== "string" ||
        Number.isNaN(generatedAt.getTime()) ||
        typeof context.generatedLabel !== "string" ||
        !context.generatedLabel.trim()
      ) {
        throw new TypeError("SCL-90 reportContext must contain a valid generatedAt and generatedLabel.");
      }
    }
    return resultPayload;
  }

  return Object.freeze({
    ANSWER_COUNT,
    validateAnswers,
    validateFactorDefinitions,
    validateResultPayloadIdentity,
    validateCurrentResultPayload
  });
});
