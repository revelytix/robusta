// Simple SPARQL lib

var sparqlConnection = function (endpoint) {

  var ep = endpoint;

  function newPromise() {
    var _value;
    var _status;
    var _changed;
    return {
      getStatus: function() { return _status },
      getValue: function() { return _value },
      setValue: function(v) {
        _value = v;
        _status = true;
        if (_changed) _changed(_value);
      },
      setChangedFn: function(f) { _changed = f },

      // a different view, this one read only, and can register a callback
      getReadOnly: function() {
        return {
          getStatus: function() { return _status },
          getValue: function() { return _value },
          setChangedFn: function(f) { _changed = f }
        };
      }
    };
  };

  function ajaxRequest () {
     var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"]; //activeX versions to check for in IE
     if (window.ActiveXObject) { //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
       for (var i = 0; i < activexmodes.length; i++) {
         try {
           return new ActiveXObject(activexmodes[i]);
         } catch(e) { /* suppress error */ }
       }
     } else if (window.XMLHttpRequest) // if Mozilla, Safari etc
       return new XMLHttpRequest();
     else
       return false;
  };

  function sparqlXMLtoJSON(xml) {
    var b = xml.getElementsByTagName("boolean");
    if (b.length !== 0) return {
      head: { },
      "boolean" : b[0].firstChild.nodeValue === "true"
    };

    function readHead() {
      var v;
      var vars = [];
      var variables = xml.getElementsByTagName("head")[0].getElementsByTagName("variable");
      for (v = 0; v < variables.length; v++) vars.push(variables[v].getAttribute("name"));
      return { vars: vars };
    };

    function readResults() {
      function literalValue(l, lang, dt) {
        var lit = { value: l };
        if (dt) {
          lit.type = "typed-literal";
          lit.datatype = dt;
        } else {
          lit.type = "literal";
          if (lang) lit["xml:lang"] = lang;
        }
        return lit;
      };
      function valueOf(bind) {
        var bnode, iri, literal;
        bnode = bind.getElementsByTagName("bnode");
        if (bnode.length !== 0) {
          return { type: "bnode", value: bnode[0].firstChild.nodeValue };
        }
        iri = bind.getElementsByTagName("uri");
        if (iri.length !== 0) {
          return { type: "uri", value: iri[0].firstChild.nodeValue };
        }
        literal = bind.getElementsByTagName("literal");
        if (literal.length !== 0) {
          var lang = literal[0].getAttributeNS("xml", "lang");
          var dt = literal[0].getAttribute("datatype");
          var value = literal[0].firstChild ? literal[0].firstChild.nodeValue : "";
          return literalValue(value, lang, dt);
        }
        return { type: "unknown" };
      };

      function readBinding(result) {
        var b;
        var jbinding = {};
        var binding = result.getElementsByTagName("binding");
        for (b = 0; b < binding.length; b++) {
          jbinding[binding[b].getAttribute("name")] = valueOf(binding[b]);
        }
        return jbinding;
      };

      var r;
      var bindings = [];
      var resultsNodes = xml.getElementsByTagName("results");
      var results = resultsNodes[0].getElementsByTagName("result");
      for (r = 0; r < results.length; r++) bindings.push(readBinding(results[r]));

      return {
        bindings: bindings
      };
    };

    return {
      head: readHead(),
      results: readResults()
    };
  };
  // end of sparqlXMLtoJSON

  function graphDesc(g) {
    var desc;
    if (!g || g === "<default>" || g == "default") {
      desc = "DEFAULT";
    } else {
      desc = "GRAPH <" + g + ">";
    }
    return desc;
  };

  return {
    query: function (text, success, graphs, namedgraphs, errfn, complete) {
      // start query
      var url;
      var request = ajaxRequest();
      if (!success) {
        alert("No operation defined to execute at the end of query:\n" + text);
        success = function(){};
      }
      if (!complete) complete = function() {};
      // request.overrideMimeType('application/json');
      // register callback
      if (!errfn) errfn = function(){};
      request.onreadystatechange = function() {
        if (request.readyState == 4) {
          if (request.status == 200) {
            success(request.responseXML);
          } else if (request.status >= 400) {
            errfn(request.responseText);
          }
          complete();
        }
      };
      if (!graphs) graphs = [];
      if (!namedgraphs) namedgraphs = [];
      url = ep + "?query=" + encodeURIComponent(text);
      for (g in graphs) url += "&default-graph-uri=" + encodeURIComponent(g);
      for (g in namedgraphs) url += "&default-named-graph-uri=" + encodeURIComponent(g);
      request.open("GET", url);
      request.send();
    },

    action: function (text, complete, errfn) {
      // start query
      var request = ajaxRequest();
      request.overrideMimeType('application/json');
      // register callback
      if (!errfn) errfn = function(){};
      if (!complete) complete = function(){};
      request.onreadystatechange = function() {
        if (request.readyState == 4) {
          if (request.status == 200) {
            complete(request.responseXML);
          } else if (request.status >= 400) {
            errfn(request.responseText);
          }
        }
      }
      request.open("POST", ep);
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      params = "update=" + encodeURIComponent(text);
      request.send(params);
    },

    queryJSON: function(text, success, graphs, namedgraphs, errfn, complete) {
      this.query(text, function(xml){ success(sparqlXMLtoJSON(xml)) }, graphs, namedgraphs, errfn, complete);
    },

    getGraphs: function (notifier, errfn) {
      var result = newPromise();
      if (notifier) result.setChangedFn(notifier);
      if (!errfn) errfn = function(){};
      this.query("SELECT DISTINCT ?g {GRAPH ?g {?s ?p ?o}}", function(ans){
        var graphs = new Array();
        var results = ans.getElementsByTagName("results");
        var resultElts = results[0].getElementsByTagName("result");
        var bindingElts, uri;
        var r, b;
        for (r = 0; r < resultElts.length; r++) {
          bindingElts = resultElts[r].getElementsByTagName("binding");
          for (b = 0; b < bindingElts.length; b++) {
            uri = bindingElts[b].getElementsByTagName("uri");
            if (uri.length > 0) graphs.push(uri[0].firstChild.nodeValue);
          }
        }
        result.setValue(graphs);
      }, null, null, errfn);
      return result.getReadOnly();
    },

    isGraph: function (name, notifier) {
      var result = newPromise();
      if (notifier) result.setChangedFn(notifier);
      this.query("ASK {GRAPH <" + name + "> {?s ?p ?o}}", function(ans){
        var bool = ans.getElementsByTagName("boolean");
        var data = false;
        if (bool.length > 0) {
          data = bool[0].firstChild.nodeValue === "true";
        }
        result.setValue(data);
      });
      return result.getReadOnly();
    },

    removeGraph: function(graph, complete, errf) {
      var cmd;
      if (!graph) {
        cmd = "DROP DEFAULT";
      } else {
        cmd = "DROP GRAPH <" + graph + ">";
      }
      this.action(cmd, complete, errf);
    },

    addGraph: function(graph, complete, errf) {
      this.action("CREATE GRAPH <" + graph + ">", complete, errf);
    },

    moveGraph: function(src, dest, complete, errf) {
      var srcGraph = graphDesc(src);
      var destGraph = graphDesc(dest);
      this.action("MOVE " + srcGraph + " TO " + destGraph, complete, errf);
    },

    copyGraph: function(src, dest, complete, errf) {
      var srcGraph = graphDesc(src);
      var destGraph = graphDesc(dest);
      this.action("COPY " + srcGraph + " TO " + destGraph, complete, errf);
    }
  };
};

