import App from './App';
import { createUrl, validateInputs, isNumber, formatStringInput, createGraphDataArray } from './functions/functions';

describe("Create NCBI api url", () => {
  test("Format input string", () => {
    const searchTerm   = " lung cancer "

    const output = "lung+cancer";

    expect(formatStringInput(searchTerm)).toEqual(output);
  });

  test("Incoporate inputs into string", () => {
    const startInput1   = "2000";
    const finishInput1  = "2010";
    const databaseName1 = "pubmed"
    const searchTerm1   = "cancer"

    const output = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&api_key=074b15a6d484c46e428f79dab8bb9cd89609&term=cancer&mindate=2000&maxdate=2010&datetype=pdat&retmode=json&retmax=0&rettype=count";

    expect(createUrl(startInput1, finishInput1, databaseName1, searchTerm1)).toEqual(output);

  });
});

describe("Validate search inputs", () => {
  test("Inputs recognised as valid", () => {
    const startInput1   = "2000";
    const finishInput1  = "2010";
    const searchTerm1   = "cancer";

    const output = "valid";
  
    expect(validateInputs(startInput1, finishInput1, searchTerm1)).toEqual(output);

  });

  test("Catch empty inputs", () => {
    const startInput1   = "2000";
    const finishInput1  = "2010";
    const searchTerm1   = "cancer"
    const empty = "";

    const output = "Please fill all input fields"    

    expect(validateInputs(empty, finishInput1, searchTerm1)).toEqual(output);
    expect(validateInputs(startInput1, finishInput1, empty)).toEqual(output);
    expect(validateInputs(startInput1, empty, searchTerm1)).toEqual(output);

  });

  test("All values in a string are numbers", () => {
    const validInput = "1000";
    const invalidInput1 = "1s";
    const invalidInput2 = " 1s";
    const invalidInput3 = "s1";

    const validOutput = true;
    const invalidOutput = false;

    expect(isNumber(validInput)).toEqual(validOutput);
    expect(isNumber(invalidInput1)).toEqual(invalidOutput);
    expect(isNumber(invalidInput2)).toEqual(invalidOutput);
    expect(isNumber(invalidInput3)).toEqual(invalidOutput);
  });

  test("Catch NaN inputs for year inputs", () => {
    const startInput1   = "2000";
    const finishInput1  = "2010";
    const searchTerm1   = "cancer"
    const notANumber1 = "Not A Number";
    const notANumber2 = "1s";

    const output = "Please enter a positive number as Start Year and/or Finish Year";

    expect(validateInputs(notANumber1, finishInput1, searchTerm1)).toEqual(output);
    expect(validateInputs(startInput1, notANumber1, searchTerm1)).toEqual(output);
  
  });

  test("Finish Year is after Start Year", () => {
    const startInput1   = "2020";
    const finishInput1  = "2010";
    const searchTerm1   = "cancer"

    const output = "Please ensure Finish Year is after Start Year";
    
    expect(validateInputs(startInput1, finishInput1, searchTerm1)).toEqual(output);
  
  });

  test("Start & Finish Years in range 0-2021", () => {
    const startInput1   = "0";
    const tooLate       = "2022"
    const searchTerm1   = "cancer"

    const output = "Please enter an year between 0AD-2021AD";
    
    expect(validateInputs(startInput1, tooLate, searchTerm1)).toEqual(output);
  });

});

describe("Create Graph Data Array", () => {
  test("Orders the array", () => {
    const objectArray   = [
      {size: 30, order: 3},
      {size: 10, order: 1},
      {size: 20, order: 2},
    ]

    const output = [10,20,30]

    expect(createGraphDataArray(objectArray)).toEqual(output);
  });
});
