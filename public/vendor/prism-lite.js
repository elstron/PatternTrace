/*
  Prism.js (lite-ish)
  NOTE: This is a small, dependency-free syntax highlighter inspired by Prism.
  It supports: markup, css, clike, javascript.
  This file is intentionally not the full Prism distribution to keep the demo self-contained.
  License: MIT (PrismJS)
  Project: https://prismjs.com/
*/
(function(){
  var _self = (typeof window !== 'undefined') ? window : (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) ? self : {};
  var Prism = (function(){
    var _ = {
      manual: false,
      disableWorkerMessageHandler: true,
      util: {
        encode: function (tokens) {
          if (tokens instanceof Token) {
            return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
          } else if (Array.isArray(tokens)) {
            return tokens.map(_.util.encode);
          } else {
            return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
          }
        },
        type: function (o) {
          return Object.prototype.toString.call(o).slice(8, -1);
        },
        objId: (function(){
          var id = 0;
          return function(obj){
            if (!obj['__id']) Object.defineProperty(obj, '__id', { value: ++id });
            return obj['__id'];
          };
        })(),
        clone: function deepClone(o, visited) {
          visited = visited || {};
          var t = _.util.type(o);
          switch (t) {
            case 'Object':
              if (visited[_.util.objId(o)]) return visited[_.util.objId(o)];
              var clone = {};
              visited[_.util.objId(o)] = clone;
              for (var key in o) if (o.hasOwnProperty(key)) clone[key] = deepClone(o[key], visited);
              return clone;
            case 'Array':
              if (visited[_.util.objId(o)]) return visited[_.util.objId(o)];
              var arr = [];
              visited[_.util.objId(o)] = arr;
              o.forEach(function(v,i){ arr[i] = deepClone(v, visited); });
              return arr;
            default:
              return o;
          }
        }
      },
      languages: {
        extend: function (id, redef) {
          var lang = _.util.clone(_.languages[id]);
          for (var key in redef) lang[key] = redef[key];
          return lang;
        },
        insertBefore: function (inside, before, insert, root) {
          root = root || _.languages;
          var grammar = root[inside];
          var ret = {};
          for (var token in grammar) {
            if (grammar.hasOwnProperty(token)) {
              if (token === before) {
                for (var newToken in insert) {
                  if (insert.hasOwnProperty(newToken)) ret[newToken] = insert[newToken];
                }
              }
              if (!insert.hasOwnProperty(token)) ret[token] = grammar[token];
            }
          }
          var old = root[inside];
          root[inside] = ret;
          _.languages.DFS(_.languages, function(key, value){
            if (value === old && this !== root) this[key] = ret;
          });
          return ret;
        },
        DFS: function DFS(o, callback, type, visited) {
          visited = visited || {};
          var objId = _.util.objId;
          for (var i in o) {
            if (o.hasOwnProperty(i)) {
              callback.call(o, i, o[i], type || i);
              var t = _.util.type(o[i]);
              if ((t === 'Object' || t === 'Array') && !visited[objId(o[i])]) {
                visited[objId(o[i])] = true;
                DFS(o[i], callback, null, visited);
              }
            }
          }
        }
      },
      highlightAllUnder: function (container) {
        var elements = container.querySelectorAll('code[class*="language-"]');
        for (var i=0; i<elements.length; i++) _.highlightElement(elements[i]);
      },
      highlightAll: function () {
        _.highlightAllUnder(document);
      },
      highlightElement: function (element) {
        var language = (element.className.match(/language-([\w-]+)/) || [,''])[1].toLowerCase();
        var grammar = _.languages[language];
        if (!grammar) return;
        var code = element.textContent;
        var html = _.highlight(code, grammar, language);
        element.innerHTML = html;
        element.parentNode && (element.parentNode.className = element.parentNode.className.replace(/\blanguage-[\w-]+\b/g, '') + ' language-' + language);
      },
      highlight: function (text, grammar) {
        var tokens = _.tokenize(text, grammar);
        return Token.stringify(_.util.encode(tokens), 'code');
      },
      tokenize: function (text, grammar) {
        var strarr = [text];
        var rest = grammar;
        for (var token in rest) {
          if (!rest.hasOwnProperty(token) || !rest[token]) continue;
          var patterns = rest[token];
          patterns = Array.isArray(patterns) ? patterns : [patterns];
          for (var j=0; j<patterns.length; j++) {
            var patternObj = patterns[j];
            var pattern = patternObj.pattern || patternObj;
            var inside = patternObj.inside;
            var lookbehind = !!patternObj.lookbehind;
            var alias = patternObj.alias;
            for (var i=0; i<strarr.length; i++) {
              var str = strarr[i];
              if (strarr.length > text.length) break;
              if (str instanceof Token) continue;
              pattern.lastIndex = 0;
              var match = pattern.exec(str);
              if (!match) continue;
              var from = match.index + (lookbehind ? match[1].length : 0);
              var matchStr = match[0].slice(lookbehind ? match[1].length : 0);
              var before = str.slice(0, from);
              var after = str.slice(from + matchStr.length);
              var args = [i, 1];
              if (before) args.push(before);
              var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias);
              args.push(wrapped);
              if (after) args.push(after);
              Array.prototype.splice.apply(strarr, args);
            }
          }
        }
        return strarr;
      }
    };

    function Token(type, content, alias) {
      this.type = type;
      this.content = content;
      this.alias = alias;
    }

    Token.stringify = function(o, language) {
      if (typeof o === 'string') return o;
      if (Array.isArray(o)) return o.map(function(e){ return Token.stringify(e, language); }).join('');
      var content = Token.stringify(o.content, language);
      var classes = ['token', o.type];
      if (o.alias) classes.push(o.alias);
      return '<span class="' + classes.join(' ') + '">' + content + '</span>';
    };

    _self.Prism = _;
    _.Token = Token;

    return _;
  })();

  // --- Grammars (markup omitted; we only need JS/TS-like) ---
  Prism.languages.clike = {
    'comment': [
      { pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/, lookbehind: true },
      { pattern: /(^|[^\\:])\/\/.*$/, lookbehind: true, alias: 'comment' }
    ],
    'string': { pattern: /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/, greedy: true },
    'class-name': { pattern: /(\bclass\s+)[\w\\]+/, lookbehind: true },
    'keyword': /\b(?:if|else|for|while|do|return|class|new|try|catch|finally|throw|extends|implements|import|from|export|default|const|let|var|function|async|await|this|super)\b/,
    'boolean': /\b(?:true|false)\b/,
    'number': /\b0x[\da-f]+|\b\d+(?:\.\d+)?/i,
    'operator': /--?|\+\+?|!=?=?|<=?|>=?|={1,3}|&&|\|\|?|\?|\*\*?|\/|%|\^|~/,
    'punctuation': /[{}[\];(),.:]/
  };

  Prism.languages.javascript = Prism.languages.extend('clike', {
    'keyword': /\b(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|get|if|import|in|instanceof|let|new|null|of|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
  });

  // Treat TS as JS + types (simple)
  Prism.languages.typescript = Prism.languages.extend('javascript', {
    'builtin': /\b(?:string|number|boolean|any|unknown|never|void|object)\b/,
    'keyword': /\b(?:type|interface|implements|extends|public|private|protected|readonly|as|asserts|infer|is|keyof|namespace|declare)\b|\b(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|get|if|import|in|instanceof|let|new|null|of|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/
  });
})();
