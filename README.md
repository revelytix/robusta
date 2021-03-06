<img src="https://github.com/downloads/revelytix/robusta/robusta.jpeg" alt="Robusta Beans" align="right" />
# Robusta

Robusta is a simple UI tool for accessing a SPARQL 1.1 endpoint.

Version 0.1 has only been tested on Jena/Fuseki.

## Usage

To run Robusta, open the index.html file. Query results are placed in a new window if the file is served from a web server, and will be placed at the bottom of the window if opened directly on a file system (the separate window is prefered, but the difference is due to security restrictions in HTML/JavaScript).

NOTE: This application is **not safe** to be placed in a publically accessible area. It allows users to send SPARQL queries to arbitrary endpoints and can be used to stage an attack on a third party's site.

## sparql.js

The sparql.js file is specifically meant to be a standalone utility. To use, create a connection object with:

    var connection = sparqlConnection(url);

The following methods are available on the connection:

**query(text, callback, [graphs], [namedgraphs], [errfn], [completedfn])**

Performs a SPARQL query using the connection. The callback function is used when data is successfully returned. The callback takes one parameter, which is the XML DOM of the result.

+  *text* - The SPARQL text to be run.
+  *callback* - The function called on successful completion of the query. An XML DOM conforming to the SPARQL XML Result Format will be passed as the only parameter. Optional, but a warning is displayed if not included.
+  *graphs* - An array of graph URIs to be applied to the query. These are ignored by Fuseki. Optional.
+  *namedgraphs* - An array of named graph URIs to be applied to the query. These are ignored by Fuseki. Optional.
+  *errfn* - A function that is called in case of an error. The error message is passed to this function. Optional.
+  *complete* - A function that is called at the conclusion of the query, regardless of the outcome. No parameters are provided to this function. Optional.  


**queryJSON(text, callback, [graphs], [namedgraphs], [errfn], [completedfn])**

Identical method to query, however the callback function receives a JavaScript object that conforms to the SPARQL JSON Result Format.

+  *text* - The SPARQL text to be run.
+  *callback* - The function called on successful completion of the query. A JavaScript object conforming to the SPARQL JSON Result Format will be passed as the only parameter. Optional, but a warning is displayed if not included.
+  *graphs* - An array of graph URIs to be applied to the query. These are ignored by Fuseki. Optional.
+  *namedgraphs* - An array of named graph URIs to be applied to the query. These are ignored by Fuseki. Optional.
+  *errfn* - A function that is called in case of an error. The error message is passed to this function. Optional.
+  *complete* - A function that is called at the conclusion of the query, regardless of the outcome. No parameters are provided to this function. Optional.  


**action(text, callback, errfn)**

Performs a SPARQL Update action using the connection. The callback function is called when the action is successfully completed, passing the server message as a parameter. On failure, the errfn function is called, passing the error message as a parameter.

+  *text* - The SPARQL Update command.
+  *callback* - The function that will be called on successful completion of the operation. Optional.
+  *errfn* - The function that will be called if there is an error completing the operation. Optional.  


**getGraphs(callback, errfn)**

Retrieves all the graphs in the store. Returns a "promise" of a value, this can be checked for a value with the methods getStatus (if true, then the data is now ready), and getValue (when the status is true, then this will return an array of graphs). The method is intended to be used with a callback that will used to return the result.

+  *callback* - A function that will be called when the results are ready. An array of graphs is passed as the only parameter to the callback. Optional.  
+  *errfn* - Called when the server returns an error. The error message is given as a parameter. Optional.  


**isGraph(name, callback)**

Tests if a graph exists. The callback is called with a value of either true or false. May use a callback, but also returns a promise.

+  *name* - The graph to test the existence of.
+  *callback* - Passed the boolean result of the test once a result is known. Optional.  


**removeGraph(name, callback, errfn)**

Removes a graph from the store.

+  *name* - The graph to be removed.
+  *callback* - Called on successful completion, passing the results returned from the server. Optional.
+  *errfn* - Called when the server returns an error. The error message is given as a parameter. Optional.  


**addGraph(name, callback, errfn)**

Adds a graph to the store.

+  *name* - The graph to be added.
+  *callback* - Called on successful completion, passing the results returned from the server. Optional.
+  *errfn* - Called when the server returns an error. The error message is given as a parameter. Optional.  


**moveGraph(src, dest, callback, errfn)**

Moves all data from one graph to another.

+  *src* - The graph containing the initial data. This graph will be removed.
+  *dest* - The graph to receive the data. This need not exist as it will be created.
+  *callback* - Called on successful completion, passing the results returned from the server. Optional.
+  *errfn* - Called when the server returns an error. The error message is given as a parameter. Optional.  


**copyGraph(src, dest, callback, errf)**

Copies data from one graph to another.

+  *src* - The graph containing the initial data. This graph will be unaffected.
+  *dest* - The graph to receive the data. This need not exist as it will be created.
+  *callback* - Called on successful completion, passing the results returned from the server. Optional.
+  *errfn* - Called when the server returns an error. The error message is given as a parameter. Optional.  

