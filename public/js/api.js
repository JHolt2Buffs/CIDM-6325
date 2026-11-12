"use strict";

window.NBATriviaApi = (() => {
  async function request(method, path, body) {
    let response;
    try {
      response = await fetch(`/api${path}`, {
        method,
        headers: body === undefined ? undefined : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch {
      const error = new Error("Cannot reach the server. Check your connection and try again.");
      error.code = "NETWORK_ERROR";
      throw error;
    }
    let result;
    try { result = await response.json(); }
    catch { result = null; }
    if (!response.ok) {
      const error = new Error(result?.error?.message || "The request failed. Please try again.");
      error.code = result?.error?.code || "REQUEST_FAILED";
      error.status = response.status;
      throw error;
    }
    if (!result || typeof result !== "object") throw new Error("The server returned an invalid response.");
    return result;
  }

  return {
    get: (path) => request("GET", path),
    post: (path, body = {}) => request("POST", path, body),
    patch: (path, body) => request("PATCH", path, body)
  };
})();
