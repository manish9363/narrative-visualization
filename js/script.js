document.addEventListener("DOMContentLoaded", function() {
   // Load the data
   d3.csv("data/netflix_titles 2.csv").then(function(data) {
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
     document.querySelector("#nextButton").addEventListener("click", function() {
       document.querySelector(".content").classList.add("hidden");
       document.querySelector("#slideshow").classList.remove("hidden");
       showSlide(currentSlide);
     });
 
     document.querySelector("#prevButton").addEventListener("click", previousSlide);
     document.querySelector("#nextSlideButton").addEventListener("click", nextSlide);
   });
 });
 
 let currentSlide = 0;
 const totalSlides = 3; // Only three slides as requested
 
 function showSlide(n) {
   const visualization = document.querySelector("#visualization");
   visualization.innerHTML = ''; // Clear the visualization content
 
   if (n === 0) {
     createSlide1();
   } else if (n === 1) {
     createSlide2();
   } else if (n === 2) {
     createSlide3();
   }
 }
 
 function nextSlide() {
   currentSlide = (currentSlide + 1) % totalSlides;
   showSlide(currentSlide);
 }
 
 function previousSlide() {
   currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
   showSlide(currentSlide);
 }
 
 function createSlide1() {
   const svg = d3.select("#visualization").append("svg")
     .attr("width", 800)
     .attr("height", 600);
 
   svg.append("text")
     .attr("x", 100)
     .attr("y", 50)
     .attr("class", "annotation")
     .text("Slide 1: Overview of Netflix Titles");
 
   // Add more visual elements here
 }
 
 function createSlide2() {
   const svg = d3.select("#visualization").append("svg")
     .attr("width", 800)
     .attr("height", 600);
 
   // Sample data
   const data = [
     { type: "Movie", count: 5000 },
     { type: "TV Show", count: 3807 }
   ];
 
   const x = d3.scaleBand()
     .domain(data.map(d => d.type))
     .range([0, 800])
     .padding(0.1);
 
   const y = d3.scaleLinear()
     .domain([0, d3.max(data, d => d.count)])
     .nice()
     .range([600, 0]);
 
   svg.selectAll(".bar")
     .data(data)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", d => x(d.type))
     .attr("y", d => y(d.count))
     .attr("width", x.bandwidth())
     .attr("height", d => 600 - y(d.count))
     .attr("fill", "#ff7e5f");
 
   svg.append("g")
     .attr("transform", "translate(0,600)")
     .call(d3.axisBottom(x));
 
   svg.append("g")
     .call(d3.axisLeft(y));
 
   svg.append("text")
     .attr("x", 400)
     .attr("y", 50)
     .attr("class", "annotation")
     .attr("text-anchor", "middle")
     .text("Slide 2: Distribution by Type");
 
   // Add annotations
   svg.append("text")
     .attr("x", x("Movie") + x.bandwidth() / 2)
     .attr("y", y(data[0].count) - 10)
     .attr("class", "annotation")
     .attr("text-anchor", "middle")
     .text(`Movies: ${data[0].count}`);
 
   svg.append("text")
     .attr("x", x("TV Show") + x.bandwidth() / 2)
     .attr("y", y(data[1].count) - 10)
     .attr("class", "annotation")
     .attr("text-anchor", "middle")
     .text(`TV Shows: ${data[1].count}`);
 }
 
 function createSlide3() {
   const svg = d3.select("#visualization").append("svg")
     .attr("width", 800)
     .attr("height", 600);
 
   // Sample data
   const data = [
     { country: "United States", count: 3000 },
     { country: "India", count: 800 },
     { country: "United Kingdom", count: 600 },
     { country: "Canada", count: 400 }
   ];
 
   const x = d3.scaleBand()
     .domain(data.map(d => d.country))
     .range([0, 800])
     .padding(0.1);
 
   const y = d3.scaleLinear()
     .domain([0, d3.max(data, d => d.count)])
     .nice()
     .range([600, 0]);
 
   svg.selectAll(".bar")
     .data(data)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", d => x(d.country))
     .attr("y", d => y(d.count))
     .attr("width", x.bandwidth())
     .attr("height", d => 600 - y(d.count))
     .attr("fill", "#feb47b");
 
   svg.append("g")
     .attr("transform", "translate(0,600)")
     .call(d3.axisBottom(x));
 
   svg.append("g")
     .call(d3.axisLeft(y));
 
   svg.append("text")
     .attr("x", 400)
     .attr("y", 50)
     .attr("class", "annotation")
     .attr("text-anchor", "middle")
     .text("Slide 3: Distribution by Country");
 
   // Add annotations
   data.forEach(d => {
     svg.append("text")
       .attr("x", x(d.country) + x.bandwidth() / 2)
       .attr("y", y(d.count) - 10)
       .attr("class", "annotation")
       .attr("text-anchor", "middle")
       .text(`${d.country}: ${d.count}`);
   });
 }
 