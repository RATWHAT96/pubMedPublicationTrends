
import React, {useRef, useEffect, useState } from 'react';
import './App.css';
import { select, axisBottom, axisLeft, scaleLinear, scaleBand } from "d3";
import axios from 'axios';



function App() {
  const [apiData, setAPIData] = useState([{size: null, order: null}]);
  const [data, setData] = useState([]);
  const [warning, setWarning] = useState([""])
  const [search, setSearch] = useState("Lung Cancer");
  const [startDate, setStart] = useState("1980");
  const [finishDate, setFinish] = useState("2021");

  const svgRef = useRef();

  const graphWidth = 0.8 * Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  const graphHeight = 0.7 * Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

  //D3 bar graph
  useEffect(() => {
    const svg = select(svgRef.current);
    const xScale = scaleBand()
      .domain(data.map((value, index) => index+ parseInt(startDate, 10)))
      .range([0, graphWidth])
      .padding(0.5);

    const yScale = scaleLinear()
      .domain([0, Math.max(...data) + (Math.round(Math.max(...data)/4))])
      .range([graphHeight, 0]);

    const colorScale = scaleLinear()
      .domain([75, 100, 150])
      .range(["green", "orange", "red"])
      .clamp(true);

    const xAxis = axisBottom(xScale).ticks(data.length);
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
      .data(data)
      .join("rect")
      .attr("class", "bar")

      .style("transform", "scale(1, -1)")
      .attr("x", (value, index) => xScale(index+parseInt(startDate, 10)))
      .attr("y", -graphHeight)
      .attr("width", xScale.bandwidth())
      .transition()
      .attr("fill", colorScale)
      .attr("height", value => graphHeight - yScale(value));
  }, [data]);

  
  //Fetches NCBI E-utilities Api data
  const handleSubmit = e => {
    e.preventDefault();
    
    
    if(validateInputs() === false)
      return;

    //preparing input string
    let editedInput = search.trim().replace(' ', '+');
   
    //create range of years 
    let valArr = []
    for (let i = startDate; i <= finishDate; i++) {
      valArr.push(i);
    }

    //fetching the values
    let start = parseInt(startDate, 10); 
    let x = []
    let y = []
    for (let i = 0; i < valArr.length; i++) {
      let nextDate = start + 1;
      let apiUrl = createUrl(start,nextDate,"pubmed", editedInput);
      setTimeout(() => {
        fetch(apiUrl)
          .then((response) => response.json())
          .then((rData) => {
            y = [...y, {size:parseInt(rData.esearchresult.count), order:i}];
            x = [...(arrange(y))];
            setAPIData(y)
            setData(x)
          });
        }, 250 * i)
      start++;
    }
  };
  
  //function to create data to be used in graph
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
      <div className='repo-container'>
        <p style={{color:"red"}} >{warning}</p>
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
      </div>
      <div>
        <svg style={{backgroundColor:"white"}} viewBox={`0 0 ${graphHeight*2.1} ${graphWidth/2.03}`} ref={svgRef}>
          <g className="x-axis" />
          <g className="y-axis" />
        </svg>
      </div>
    </div>
  );
}

export default App;
