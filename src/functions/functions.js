//used to create url endpoint for single date range
export const createUrl = (start, finish, db, searchInput) => {
    return `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=${db}&api_key=074b15a6d484c46e428f79dab8bb9cd89609&term=${searchInput}&mindate=${start}&maxdate=${finish}&datetype=pdat&retmode=json&retmax=0&rettype=count`;
}

//used to validate user inputs
export const validateInputs = (startYear, finishYear, searchTerm) => {
    //Prevents empty field
    if (!searchTerm || !startYear || !finishYear) {
      return "Please fill all input fields";
    } 
    
    //Prevents non-numbers being used as start or finish year
    if(!isNumber(startYear) || !isNumber(finishYear)){
      return "Please enter a positive number as Start Year and/or Finish Year";
    } 

    //Prevents start being higher than finish year
    if(parseInt(startYear,10) >= parseInt(finishYear,10)){
      return "Please ensure Finish Year is after Start Year";
    } 

    //Prevents invalid year from being added
    if( 0 > parseInt(startYear,10) || parseInt(startYear,10) > 2021 ||  parseInt(finishYear,10) > 2021) {
      return "Please enter an year between 0AD-2021AD";
    } 

    return "valid";
}

//checks if string is a number
export const isNumber = x => {
    let isNum = false;
    for(let i = 0; i < x.length; i++) {
        isNaN(parseInt(x.charAt(i), 10)) ? isNum = false : isNum = true; 
        if(!isNum)
            return false;
    }
    return true;
}

//format string input
export const formatStringInput = x => {
    return x.trim().replace(' ', '+')
} 

//sorts object array based on the size of the order property and 
//creates/returns array of ordered graph data
export const createGraphDataArray = (arr) => {
    arr.sort(function(a, b){return a.order-b.order});
    let orderedGraphData = arr.map(x => x.size);
    return orderedGraphData
}