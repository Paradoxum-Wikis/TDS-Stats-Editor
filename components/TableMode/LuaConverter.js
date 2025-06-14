export default class LuaConverter {
  #domContainer;

  constructor() {
    this.#domContainer = document.createElement("pre");
    this.#domContainer.classList.add("lua-viewer");
  }

  getContainer() {
    return this.#domContainer;
  }

  /**
   * Convert and display JSON as lua
   * @param {Object} json - The JSON object to be converted to Lua
   */
  showJSONAsLua(json) {
    const luaContent = this.#formatAsLua(json);
    this.#domContainer.innerHTML = `<span class="lua-key">local</span> <span class="lua-key">data</span> = ${luaContent}\n\n<span class="lua-key">return</span> <span class="lua-key">data</span>`;
  }

  /**
   * Format a JSON object as a Lua table string
   * @param {Object} obj - The object to format
   * @param {Number} indent - Current indentation level
   * @returns {String} - Formatted Lua code
   */
  #formatAsLua(obj, indent = 0) {
    if (obj === null) {
      return '<span class="lua-nil">nil</span>';
    }

    const indentStr = "    ".repeat(indent);
    const indentStrNext = "    ".repeat(indent + 1);

    if (typeof obj === "string") {
      // escape special characters in string
      const escaped = obj
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n");
      return `<span class="lua-string">"${escaped}"</span>`;
    }

    if (typeof obj === "number") {
      return `<span class="lua-number">${obj}</span>`;
    }

    if (typeof obj === "boolean") {
      return `<span class="lua-boolean">${obj}</span>`;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return '<span class="lua-bracket">{}</span>';
      }

      let result = '<span class="lua-bracket">{</span>\n';
      obj.forEach((item, index) => {
        result += `${indentStrNext}${this.#formatAsLua(item, indent + 1)}`;
        if (index < obj.length - 1) {
          result += ",";
        }
        result += "\n";
      });
      result += `${indentStr}<span class="lua-bracket">}</span>`;
      return result;
    }

    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return '<span class="lua-bracket">{}</span>';
      }

      let result = '<span class="lua-bracket">{</span>\n';
      keys.forEach((key, index) => {
        // Format keys
        const luaKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)
          ? `<span class="lua-key">${key}</span>`
          : `<span class="lua-bracket">[</span><span class="lua-string">"${key}"</span><span class="lua-bracket">]</span>`;

        result += `${indentStrNext}${luaKey} = ${this.#formatAsLua(obj[key], indent + 1)}`;
        if (index < keys.length - 1) {
          result += ",";
        }
        result += "\n";
      });
      result += `${indentStr}<span class="lua-bracket">}</span>`;
      return result;
    }

    // everything else
    return String(obj);
  }
}
