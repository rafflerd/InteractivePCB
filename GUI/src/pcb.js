/*
    This file contains all of the definitions for working with pcbdata.json. 
    This file declares all of the access functions and interfaces for converting 
    the json file into an internal data structure. 
*/

/***************************************************************************************************
                                         PCB Part Interfaces
**************************************************************************************************/
// Read the ecad property. This property lets the application know what 
// ecad software generated the json file. 
function GetCADType(pcbdataStructure)
{
    if(pcbdataStructure.hasOwnProperty("ecad")){
        return pcbdataStructure.ecad;
    }
}

// This will hold the part objects. There is one entry per part
// Format of a part is as follows
// [VALUE,PACKAGE,REFRENECE DESIGNATOR, ,LOCATION, ATTRIBUTE],
// where ATTRIBUTE is a dict of ATTRIBUTE NAME : ATTRIBUTE VALUE
var BOM = [];

// Constructor for creating a part.
function Part(value, package, reference, location, attributes, checkboxes) {
    this.quantity   = 1;
    this.value      = value;
    this.package    = package;
    this.reference  = reference;
    this.location   = location;
    this.attributes = attributes;
    this.checkboxes = checkboxes;
}

function CopyPart(inputPart){
  // XXX: This is not performing a deep copy, attributes is a map and this is being copied by 
  //      reference which is not quite what we want here. It should be a deep copy so once called
  //      this will result in a completely new object that will not reference one another
  return new Part(inputPart.value, inputPart.package, inputPart.reference, inputPart.location, inputPart.attributes, inputPart.checkboxes);
}

//TODO: There should be steps here for validating the data and putting it into a 
//      format that is valid for our application
function CreateBOM(pcbdataStructure){
    // For every part in the input file, convert it to our internal 
    // representation data structure.
    for(var part of pcbdataStructure.bom.both){
        // extract the part data. This is here so I can iterate the design 
        // when I make changes to the underlying json file.
        var value     = part[1];
        var package   = part[2];
        var reference = part[3][0];
        var location  = part[6];

        // AttributeName and AttributeValue are two strings that are deliminated by ';'. 
        // Split the strings by ';' and then zip them together
        var attributeNames = part[4].split(';');
        var attributeValues = part[5].split(';');

        var checkboxes = new Map();

        //XXX: ASSUMTION that attributeNames is the same length as attributeValues
        attributes = new Map(); // Create a empty dictionary
        for(var i in attributeNames){
            attributes.set(attributeNames[i].toLowerCase(),attributeValues[i].toLowerCase());
        }
        // Add the par to the global part array
        BOM.push(new Part(value, package, reference, location, attributes, checkboxes));
    }
}

function GetBOM(){
      return BOM;
}

// TAkes a BOM table and a filter function. The filter 
// function is used onthe provided table to remove 
// any part that satisfy the filter
function filterBOMTable(bomtable, filterFunction){
  var result = [];

  // Makes sure that thE filter function is defined. 
  // if not defined then nothing should be filtered. 
  if(filterFunction != null){
    for(var i in bomtable){
      // If the filter returns false -> do not remove part, it does not need to be filtered
      if(!filterFunction(bomtable[i])){
        result.push(CopyPart(bomtable[i]));
      }
    }
  }
  else{
    result = bomtable;
  }
  return result;
}

// Takes a bom table and combines entries that are the same
function GetBOMCombinedValues(bomtableTemp){
    result = [];

    // TODO: sort bomtableTemp. Assumption here is that the bomtableTemp is presorted

    if(bomtableTemp.length>0){
      // XXX: Assuming that the input json data has bom entries presorted
      // TODO: Start at index 1, and compare the current to the last, this should simplify the logic
      // Need to create a new object by deep copy. this is because objects by default are passed by reference and i dont 
      // want to modify them.
      result.push(CopyPart(bomtableTemp[0]));
      count = 0;
      for (var n = 1; n < bomtableTemp.length;n++)
      {
        if(result[count].value == bomtableTemp[n].value)
        {
          // For parts that are listed as combined, store the references as an array.
          // This is because the logic for highlighting needs to match strings and 
          // If an appended string is used it might not work right
          refString = result[count].reference + "," + bomtableTemp[n].reference;
          result[count].quantity += 1;
          result[count].reference = refString;
        }
        else
        {
          result.push(CopyPart(bomtableTemp[n]));
          count++;
        }
      }
    }
    return result;
}

function getAttributeValue(part, attributeToLookup){
    var attributes = part.attributes;
    var result = "";

    if(attributeToLookup == "name")
    {
      result = part.reference;
    }
    else
    {
      result = (attributes.has(attributeToLookup) ? attributes.get(attributeToLookup) : "");
    }
    // Check that the attribute exists by looking up its name. If it exists
    // the return the value for the attribute, otherwise return an empty string. 
    return result;
}


function AddCheckbox(checkboxes)
{
  return null;
}

/***************************************************************************************************
                                         PCB Metadata Interfaces
***************************************************************************************************/
var metadata;
// Constructor for creating a part.
function Metadata(title, revision, company, date) {
    this.title    = title;
    this.revision = revision;
    this.company  = company;
    this.date     = date;
}

function CreateMetadata(pcbdataStructure){
  metadata = new Metadata(pcbdataStructure.metadata.title  , pcbdataStructure.metadata.revision, 
                      pcbdataStructure.metadata.company, pcbdataStructure.metadata.date);
}

function GetMetadata(){
  return metadata;
}



function OpenPcbData(pcbdata){
  CreateBOM(pcbdata);
  CreateMetadata(pcbdata);
}

module.exports = {
  OpenPcbData, GetBOM, getAttributeValue, GetBOMCombinedValues, filterBOMTable, GetMetadata, 
  AddCheckbox
}