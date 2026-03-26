const resultsNode =
  typeof document === "undefined" ? null : document.querySelector("#results");

function appendResult(label, className, detail = "") {
  if (!resultsNode) {
    const output = detail ? `${label}: ${detail}` : label;
    const method = className === "fail" ? "error" : "log";
    console[method](output);
    return;
  }

  const line = document.createElement("p");
  line.className = className;
  line.textContent = detail ? `${label}: ${detail}` : label;
  resultsNode.append(line);
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message} (expected ${expected}, received ${actual})`);
  }
}

export function test(name, fn) {
  try {
    fn();
    appendResult(`PASS ${name}`, "pass");
  } catch (error) {
    appendResult(`FAIL ${name}`, "fail", error.message);
    throw error;
  }
}
