
import React, {useRef, useEffect, useState } from 'react';
import './App.css';
import { select, axisBottom, axisLeft, scaleLinear, scaleBand } from "d3";
import { createUrl, validateInputs, formatStringInput, createGraphDataArray } from './functions/functions';


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
    
    //Checking for valid inputs
    let validityCheck = validateInputs(startDate, finishDate, search);
    validityCheck !== "valid" ? setWarning(validityCheck) : setWarning("");
    if (validityCheck !== "valid") return; 
    
    let formattedInput = formatStringInput(search);
    let start = parseInt(startDate.trim(), 10); 
    let numOfPapers = [];
    let papersAndYears = [];
    const yearRange = parseInt(finishDate.trim(), 10) - parseInt(startDate.trim(), 10);
    
    //fetches the graphValues for each year and stores it in the graphData array
    for (let i = 0; i <= yearRange; i++) {
      let nextDate = start + 1;
      let apiUrl = createUrl(start,nextDate,"pubmed", formattedInput);
      setTimeout(() => {
        fetch(apiUrl)
          .then((response) => {
            if (response.status >= 200 && response.status <= 299) {
              return response.json();
            } else {
              throw Error(response.statusText);
            }
          })
          .then((rData) => {
            papersAndYears = [...papersAndYears, {size:parseInt(rData.esearchresult.count), order:i}]; //array to store order and publication numbers from api responses
            numOfPapers = [...(createGraphDataArray(papersAndYears))]; //array to store publication numbers in order
            setAPIData(papersAndYears)
            setData(numOfPapers)
          });
        }, 250 * i)
      start++;
    }
  };
  
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
