document.addEventListener("DOMContentLoaded", function() {
   d3.csv("data/netflix_titles.csv").then(function(data) {
     // Calculate total titles
     const totalTitles = data.length;
     document.querySelector("#total-titles p").innerText = totalTitles;
 
     // Calculate content type distribution
     const contentTypeCounts = d3.rollup(data, v => v.length, d => d.type);
     const contentTypeDistribution = Array.from(contentTypeCounts, ([key, value]) => `${key}: ${value}`).join(", ");
     document.querySelector("#content-type p").innerText = contentTypeDistribution;
 
     // Calculate average release year
     const releaseYears = data.map(d => +d.release_year).filter(y => !isNaN(y));
     const averageYear = d3.mean(releaseYears).toFixed(1);
     document.querySelector("#average-year p").innerText = averageYear;
 
     // Set up navigation
     document.querySelector("#nextButton").addEventListener("click", nextSlide);
     document.querySelector("#prevButton").addEventListener("click", previousSlide);
 
     showSlide(currentSlide);
 
     createDynamicLineGraphWithMilestones(data);
   }).catch(function(error) {
     console.error('Error loading the CSV file:', error);
   });
 });
 
 let currentSlide = 0;
 const totalSlides = 2;
 
 function showSlide(n) {
   const slides = document.querySelectorAll(".slide");
   slides.forEach((slide, index) => {
     slide.classList.toggle("hidden", index !== n);
   });
 
   document.querySelector("#prevButton").classList.toggle("hidden", n === 0);
   document.querySelector("#nextButton").classList.toggle("hidden", n === totalSlides - 1);
 }
 
 function nextSlide() {
   if (currentSlide < totalSlides - 1) {
     currentSlide++;
     showSlide(currentSlide);
   }
 }
 
 function previousSlide() {
   if (currentSlide > 0) {
     currentSlide--;
     showSlide(currentSlide);
   }
 }
 
 function createDynamicLineGraphWithMilestones(data) {
   const svg = d3.select("#line-graph").append("svg")
     .attr("width", 800)
     .attr("height", 600);
 
   const margin = { top: 20, right: 20, bottom: 30, left: 50 };
   const width = +svg.attr("width") - margin.left - margin.right;
   const height = +svg.attr("height") - margin.top - margin.bottom;
   const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
 
   const parseTime = d3.timeParse("%Y");
 
   // Filter data from year 2000 onwards
   const filteredData = data.filter(d => d.release_year >= 2000);
 
   const dataByYear = Array.from(
     d3.rollup(filteredData, v => ({
         total: v.length,
         movie: v.filter(d => d.type === "Movie").length,
         tvShow: v.filter(d => d.type === "TV Show").length
       }), d => d.release_year),
     ([key, value]) => ({ year: parseTime(key), ...value })
   ).sort((a, b) => a.year - b.year);
 
   const x = d3.scaleTime()
     .domain([parseTime("2000"), d3.max(dataByYear, d => d.year)])
     .range([0, width]);
 
   const y = d3.scaleLinear()
     .domain([0, d3.max(dataByYear, d => d.total)])
     .range([height, 0]);
 
   const line = d3.line()
     .x(d => x(d.year))
     .y(d => y(d.total));
 
   g.append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));
 
   g.append("g")
     .call(d3.axisLeft(y));
 
   const path = g.append("path")
     .datum(dataByYear)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 1.5)
     .attr("d", line);
 
   // Dynamic transition
   const totalLength = path.node().getTotalLength();
 
   path
     .attr("stroke-dasharray", totalLength + " " + totalLength)
     .attr("stroke-dashoffset", totalLength)
     .transition()
     .duration(5000)
     .ease(d3.easeLinear)
     .attr("stroke-dashoffset", 0);
 
   // Add tooltip
   const tooltip = d3.select("body").append("div")
     .attr("class", "tooltip")
     .style("position", "absolute")
     .style("background", "lightsteelblue")
     .style("padding", "5px")
     .style("border-radius", "5px")
     .style("pointer-events", "none")
     .style("opacity", 0);
 
   g.selectAll("dot")
     .data(dataByYear)
     .enter().append("circle")
     .attr("r", 5)
     .attr("cx", d => x(d.year))
     .attr("cy", d => y(d.total))
     .attr("fill", "steelblue")
     .on("mouseover", function(event, d) {
       tooltip.transition()
         .duration(200)
         .style("opacity", .9);
       tooltip.html(`Year: ${d.year.getFullYear()}<br>Total: ${d.total}<br>Movies: ${d.movie}<br>TV Shows: ${d.tvShow}`)
         .style("left", (event.pageX + 5) + "px")
         .style("top", (event.pageY - 28) + "px");
     })
     .on("mouseout", function() {
       tooltip.transition()
         .duration(500)
         .style("opacity", 0);
     });
 
   // Animation for revealing each milestone step by step
   let index = 0;
 
   const milestones = [
     { year: 2007, description: "Netflix introduces streaming service." },
     { year: 2013, description: "House of Cards, first original series." },
     { year: 2015, description: "Netflix expands to Japan." },
     { year: 2016, description: "Netflix available in 190 countries." },
     { year: 2020, description: "Netflix reaches 200 million subscribers." }
     // Add more milestones as needed
   ];
 
   function revealNextMilestone() {
     if (index < milestones.length) {
       const milestone = milestones[index];
       const yearData = dataByYear.find(d => d.year.getFullYear() === milestone.year);
 
       g.append("circle")
         .attr("r", 5)
         .attr("cx", x(parseTime(milestone.year)))
         .attr("cy", y(yearData ? yearData.total : 0))
         .attr("fill", "red");
 
       g.append("text")
         .attr("x", x(parseTime(milestone.year)))
         .attr("y", y(yearData ? yearData.total : 0) - 20)
         .attr("text-anchor", "middle")
         .style("font-size", "12px")
         .style("fill", "black")
         .text(milestone.description);
 
       index++;
       setTimeout(revealNextMilestone, 2000); // Adjusted delay to 2000ms for a slower transition
     }
   }
 
   revealNextMilestone();
 }
 