
import React, {useRef, useEffect, useState } from 'react';
import './App.css';
import { select, axisBottom, axisLeft, scaleLinear, scaleBand } from "d3";



function App() {
  const [apiData, setAPIData] = useState([{size: null, order: null}]);
  const [graphData, setData] = useState([]);
  const [warning, setWarning] = useState([""])
  const [search, setSearch] = useState("");
  const [startDate, setStart] = useState("");
  const [finishDate, setFinish] = useState("");

  const svgRef = useRef();

  const graphWidth = 0.8 * Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  const graphHeight = 0.7 * Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

  /*Used to create and update D3 Bar Graph*/
  useEffect(() => {
    const svg = select(svgRef.current);
    const xScale = scaleBand()
      .domain(graphData.map((value, index) => index+ parseInt(startDate, 10)))
      .range([0, graphWidth])
      .padding(0.5);

    const yScale = scaleLinear()
      .domain([0, Math.max(...graphData) + (Math.round(Math.max(...graphData)/4))])
      .range([graphHeight, 0]);

    const colorScale = scaleLinear()
      .domain([(Math.round(Math.max(...graphData)* (1/3))), (Math.round(Math.max(...graphData)* (2/3))), (Math.round(Math.max(...graphData)))])
      .range(["green", "yellow", "red"])
      .clamp(true);

    const xAxis = axisBottom(xScale).ticks(graphData.length);
    svg
      .select(".x-axis")
      .style("transform", `translateY(${graphHeight}px)`)
      .call(xAxis);

    const yAxis = axisLeft(yScale);
    svg
      .select(".y-axis")
      .style("transform", "translateX(0px)")
      .call(yAxis);

    svg
      .selectAll(".bar")
      .data(graphData)
      .join("rect")
      .attr("class", "bar")

      .style("transform", "scale(1, -1)")
      .attr("x", (value, index) => xScale(index+parseInt(startDate, 10)))
      .attr("y", -graphHeight)
      .attr("width", xScale.bandwidth())
      .transition()
      .attr("fill", colorScale)
      .attr("height", value => graphHeight - yScale(value));
  }, [graphData]);

  
  /*Fetches NCBI E-Utilities API Data*/
  const handleSubmit = e => {
    e.preventDefault();
    
    if(validateInputs() === false)
      return;

    //cleaning and formatting input string
    let formattedInput = search.trim().replace(' ', '+');

    //create range of years for x-axis
    const yearRange= finishDate-startDate;

    
    let start = parseInt(startDate, 10); 
    let numOfPapers = []
    let papersAndYears = []

    //fetching the graphValues
    for (let i = 0; i <= yearRange; i++) {
      let nextDate = start + 1;
      let apiUrl = createUrl(start,nextDate,"pubmed", formattedInput);
      setTimeout(() => {
        fetch(apiUrl)
          .then((response) => response.json())
          .then((rData) => {
            papersAndYears = [...papersAndYears, {size:parseInt(rData.esearchresult.count), order:i}];
            numOfPapers = [...(arrange(papersAndYears))];
            setAPIData(papersAndYears)
            setData(numOfPapers)
          });
        }, 250 * i)
      start++;
    }
  };
  
  //function to sort papersAndYears array & create/return the numOfPapers array
  const arrange = (arr) => {
    arr.sort(function(a, b){return a.order-b.order});
    let dataArr = arr.map(x => x.size);
    return dataArr
  }

  //used to validate user inputs
  const validateInputs = () => {
    //Prevents empty field
    if (!search || !startDate || !finishDate) {
      setWarning("Please fill all input fields");
      return false;
    } 
      
    //Prevents non-numbers being used as start or finish year
    if(isNaN(parseInt(startDate,10)) || isNaN(parseInt(finishDate,10))){
      setWarning("Please enter a number as Start Year and/or Finish Year");
      return false;
    } 

    //Prevents start being higher than finish year
    if(parseInt(startDate,10) >= parseInt(finishDate,10)){
      setWarning("Please ensure Finish Year is after Start Year");
      return false;
    } 

    //Prevents invalid year from being added
    if( 0 > parseInt(startDate,10) || parseInt(startDate,10) > 2021 ||  parseInt(finishDate,10) > 2021) {
      setWarning("Please enter an year between 0AD-2021AD");
      return false;
    } 

    setWarning("");
    return true;
  }
  
  //used to create url endpoint for single date range
  const createUrl = (start, finish, db, searchInput) => {
    return `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=${db}&api_key=074b15a6d484c46e428f79dab8bb9cd89609&term=${searchInput}&mindate=${start}&maxdate=${finish}&datetype=pdat&retmode=json&retmax=0&rettype=count`;
  }

  return (
    <div className='App'>
      <div className='container'>
        <h1>Disease Research Trends</h1>
      </div>
      <div>
        <form style={{margin:"10px 0"}} onSubmit={handleSubmit}>
          <input
            type="text"
            value={search}
            placeholder="Disease/Disease Area"
            onChange={e => setSearch(e.target.value)}
          />
          <input
            type="text"
            value={startDate}
            placeholder="Start Year"
            onChange={e => setStart(e.target.value)}
          />
          <input
            type="text"
            value={finishDate}
            placeholder="Finish Year"
            onChange={e => setFinish(e.target.value)}
          />
          <button>Search</button>
        </form>
        <p style={{color:"red"}}>{warning}</p>
      </div>
      <div>
        <svg style={{backgroundColor:"white"}} viewBox={`0 0 ${graphHeight*2.1} ${graphWidth/2.03}`} ref={svgRef}>
          <g className="x-axis" />
          <g className="y-axis" />
        </svg>
      </div>
      <p>
          <span style={{color:"green", marginRight:"10px"}}>Bottom 33%</span>
          <span style={{color:"yellow", marginRight:"10px"}}>Middle 33%</span>
          <span style={{color:"red", marginRight:"10px"}}>Top 33%</span>
          <span style={{marginRight:"10px"}}>X-axis: Publication Year</span>
          <span style={{marginRight:"10px"}}>Y-axis: Number of Papers</span>
        </p>
    </div>
  );
}

export default App;
