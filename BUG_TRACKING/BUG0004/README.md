# STATUS: [CLOSED](https://github.com/oceanofthelost/InteractiveBOM/commit/84720017a016ba750a36266c65750e66ed9e245b) 


# EFFECTED VERSION: <= V1.6

# DESCRIPTION
If an Eagle part has a double quote character in any attribute field, the resulting JSON is invalid. THis bug was reported by dronecz and is assigned [Github Issue #4](https://github.com/oceanofthelost/InteractiveBOM/issues/4)

# Resolution
When running the EagleCAD ULP, scan through a string an replace a double quote character with a space character. Within the ULP the function removeDoubleQuote() accomplishes the task.



