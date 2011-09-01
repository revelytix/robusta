function tableResult(doc, table, ans) {

  function writeBNode(tdElt, n) {
    if (n.charAt(0) !== '_') n = "_:" + n;
    tdElt.appendChild(doc.createTextNode(n));
  };

  function writeUri(tdElt, u) {
    if (u.substr(0, 7) === "http://") {
      var a = doc.createElement("a");
      a.setAttribute("href", u);
      a.appendChild(doc.createTextNode(u));
      tdElt.appendChild(a);
    } else {
      tdElt.appendChild(doc.createTextNode(u));
    }
  };

  function writeLiteral(tdElt, l, lang, dt) {
    var text = '"' + l + '"';
    if (lang) text += "@" + lang;
    if (dt) text += "^^<" + dt + ">";
    tdElt.appendChild(doc.createTextNode(text));
  };

  function setValue(tdElt, binding) {
    var bnode, uri, literal;
    bnode = binding.getElementsByTagName("bnode");
    if (bnode.length !== 0) {
      writeBNode(tdElt, bnode[0].firstChild.nodeValue);
    } else {
      uri = binding.getElementsByTagName("uri");
      if (uri.length !== 0) {
        writeUri(tdElt, uri[0].firstChild.nodeValue);
      } else {
        literal = binding.getElementsByTagName("literal");
        if (literal.length !== 0) {
          var lang = literal[0].getAttributeNS("xml", "lang");
          var dt = literal[0].getAttribute("datatype");
          var value = literal[0].firstChild ? literal[0].firstChild.nodeValue : "";
          writeLiteral(tdElt, value, lang, dt);
        } else {
          tdElt.appendChild(doc.createTextNode("XXX"));
        }
      }
    }
  };

  function appendResult(row, result, vars) {
    var i, bindings;
    var j = 0;
    for (i = 0; i < vars.length; i++) {
      tdElt = doc.createElement("td");
      bindings = result.getElementsByTagName("binding");
      for (j = 0; j < bindings.length; j++) {
        if (bindings[j].getAttribute("name") === vars[i]) break;
      }
      if (j < bindings.length && bindings[j].getAttribute("name") === vars[i]) {
        setValue(tdElt, bindings[j]);
      }
      row.appendChild(tdElt);
    }
  };

  function th(text) {
    var elt = doc.createElement("th");
    elt.appendChild(doc.createTextNode(text));
    return elt;
  };

  return (function () {
      var vars = [], vname, variables, results;
      var row;
      var i;
      // clear the table
      while (table.rows.length > 0) table.deleteRow(0);
      // write the header
      row = doc.createElement("tr");
      variables = ans.getElementsByTagName("head")[0].getElementsByTagName("variable");
      for (i = 0; i < variables.length; i++) {
        vname = variables[i].getAttribute("name");
        vars.push(vname);
        row.appendChild(th(vname));
      }
      table.appendChild(row);
      // write the body
      results = ans.getElementsByTagName("results")[0].getElementsByTagName("result");
      for (i = 0; i < results.length; i++) {
        row = doc.createElement("tr");
        appendResult(row, results[i], vars);
        table.appendChild(row);
      }
    })();
};
