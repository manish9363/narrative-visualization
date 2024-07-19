document.addEventListener("DOMContentLoaded", function() {
  let dataByYear;
  let milestones;
  let tooltip;

  d3.csv("data/netflix_titles.csv").then(function(data) {
      // Calculate total titles
      const totalTitles = data.length;
      const totalTitlesElement = document.querySelector("#total-titles");
      if (totalTitlesElement) {
          totalTitlesElement.innerText = totalTitles;
      }

      // Calculate content type distribution
      const contentTypeCounts = d3.rollup(data, v => v.length, d => d.type);
      const contentTypeDistribution = Array.from(contentTypeCounts, ([key, value]) => `${key}: ${value}`).join(", ");
      const contentTypeElement = document.querySelector("#content-type");
      if (contentTypeElement) {
          contentTypeElement.innerText = contentTypeDistribution;
      }

      // Set up navigation
      document.querySelector("#nextButton").addEventListener("click", nextSlide);
      document.querySelector("#prevButton").addEventListener("click", previousSlide);

      showSlide(currentSlide);

      milestones = [
          { year: 2007, description: "Netflix introduces streaming service.", link: "milestone1.html" },
          { year: 2013, description: "House of Cards, first original series.", link: "milestone2.html" },
          { year: 2016, description: "Netflix available in 190 countries.", link: "milestone3.html" },
          { year: 2020, description: "Netflix reaches 200 million subscribers.", link: "milestone4.html" }
      ];

      createDynamicLineGraphWithMilestones(data);

      // Set up slider
      const slider = document.getElementById("yearSlider");
      const yearLabel = document.getElementById("yearLabel");
      slider.value = 2007;
      yearLabel.innerText = 2007;

      slider.addEventListener("input", function() {
          const year = parseInt(this.value);
          yearLabel.innerText = year;
          updateGraphForYear(year);
      });
  }).catch(function(error) {
      console.error('Error loading the CSV file:', error);
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

  function updateGraphForYear(year) {
      const svg = d3.select("#line-graph svg");
      const margin = { top: 50, right: 20, bottom: 30, left: 50 };
      const width = +svg.attr("width") - margin.left - margin.right;
      const height = +svg.attr("height") - margin.top - margin.bottom;
      const g = svg.select("g");
      const parseTime = d3.timeParse("%Y");

      const filteredData = dataByYear.filter(d => d.year.getFullYear() <= year);

      const x = d3.scaleTime()
          .domain([parseTime("2000"), parseTime("2020")])
          .range([0, width]);

      const y = d3.scaleLinear()
          .domain([0, d3.max(dataByYear, d => d.total)])
          .range([height, 0]);

      const line = d3.line()
          .x(d => x(d.year))
          .y(d => y(d.total));

      g.selectAll("path").remove(); // Remove existing paths before redrawing
      g.append("path")
          .datum(filteredData)
          .attr("fill", "none")
          .attr("stroke", "#87CEEB") /* Light Blue color for the line */
          .attr("stroke-width", 1.5)
          .attr("d", line);

      const circles = g.selectAll("circle")
          .data(filteredData);

      circles.enter().append("circle")
          .attr("r", 5)
          .attr("cx", d => x(d.year))
          .attr("cy", d => y(d.total))
          .attr("fill", d => milestones.some(m => m.year === d.year.getFullYear()) ? "#FF6347" : "#ADD8E6") /* Light Blue color for non-milestone circles, Tomato for milestones */
          .attr("opacity", d => d.year.getFullYear() <= 2007 ? 1 : 0) // Initial opacity set to 0 for dots beyond the first milestone
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

      circles.attr("cx", d => x(d.year))
          .attr("cy", d => y(d.total))
          .attr("fill", d => milestones.some(m => m.year === d.year.getFullYear()) ? "#FF6347" : "#ADD8E6"); /* Light Blue color for non-milestone circles, Tomato for milestones */

      circles.exit().remove();

      g.selectAll("g.milestone-box").remove(); // Remove existing milestone boxes

      milestones.forEach((milestone, index) => {
          const yearData = dataByYear.find(d => d.year.getFullYear() === milestone.year);
          if (milestone.year <= year) {
              const boxGroup = g.append("g")
                  .attr("class", `milestone-box milestone-box-${milestone.year}`);

              // Add milestone box
              const boxWidth = 200; /* Increased width for clarity */
              const boxHeight = 60; /* Increased height for clarity */
              const offset = index % 2 === 0 ? 70 : -70; // Increased offset for better spacing
              let xBox = x(parseTime(milestone.year)) + 15; // Further offset to the right
              if (xBox + boxWidth > width) xBox -= (boxWidth + 20); // Adjust to stay within bounds
              const yBox = y(yearData ? yearData.total : 0) - boxHeight - offset; // Further offset above or below

              boxGroup.append("rect")
                  .attr("x", xBox)
                  .attr("y", yBox)
                  .attr("width", boxWidth)
                  .attr("height", boxHeight)
                  .attr("fill", "lightyellow")
                  .attr("stroke", "#007BFF") /* Blue border color */
                  .attr("stroke-width", 2); /* Increased border thickness */

              // Add milestone description text
              boxGroup.append("text")
                  .attr("x", xBox + 10)
                  .attr("y", yBox + 20)
                  .style("font-size", "12px")
                  .style("fill", "#333333")
                  .text(milestone.description);

              // Add "Click for more details" link
              boxGroup.append("a")
                  .attr("xlink:href", milestone.link)
                  .attr("target", "_blank")
                  .append("text")
                  .attr("x", xBox + 10)
                  .attr("y", yBox + 40)
                  .style("font-size", "12px")
                  .style("fill", "#007BFF")
                  .style("text-decoration", "underline")
                  .text("Click for more details");

              // Add arrow
              boxGroup.append("line")
                  .attr("x1", xBox)
                  .attr("y1", yBox + boxHeight / 2)
                  .attr("x2", x(parseTime(milestone.year)))
                  .attr("y2", y(yearData ? yearData.total : 0))
                  .attr("stroke", "black")
                  .attr("marker-end", "url(#arrow)");
          }
      });

      milestones.forEach(milestone => {
          const boxGroup = g.selectAll(`.milestone-box-${milestone.year}`);

          if (milestone.year > year) {
              boxGroup.attr("opacity", 0);
          } else {
              boxGroup.attr("opacity", 1);
          }
      });

      const dynamicText = d3.select(".dynamic-text");
      const milestone = milestones.find(m => m.year === year);
      if (milestone) {
          dynamicText.html(`<a href="${milestone.link}" target="_blank">${milestone.description}</a>`);
      } else {
          const yearData = dataByYear.find(d => d.year.getFullYear() === year);
          if (yearData) {
              dynamicText.text(`Year: ${year}, ${yearData.total} titles`);
          } else {
              dynamicText.text(`Year: ${year}, no data available`);
          }
      }
  }

  function createDynamicLineGraphWithMilestones(data) {
      const svg = d3.select("#line-graph").append("svg")
          .attr("width", 1200) // Adjusted width
          .attr("height", 600); // Adjusted height

      const margin = { top: 50, right: 50, bottom: 50, left: 50 }; // Adjusted margins
      const width = +svg.attr("width") - margin.left - margin.right;
      const height = +svg.attr("height") - margin.top - margin.bottom;
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const parseTime = d3.timeParse("%Y");

      // Add arrowhead marker definition
      svg.append("defs").append("marker")
          .attr("id", "arrow")
          .attr("viewBox", "0 0 10 10")
          .attr("refX", 5)
          .attr("refY", 5)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto-start-reverse")
          .append("path")
          .attr("d", "M 0 0 L 10 5 L 0 10 z")
          .attr("fill", "black");

      // Add gradient
      const gradient = svg.append("defs")
          .append("linearGradient")
          .attr("id", "line-gradient")
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", width)
          .attr("y2", 0);

      gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "#87CEEB"); /* Light Blue start color */

      gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#ADD8E6"); /* Light Blue end color */

      // Filter data from year 2000 onwards
      const filteredData = data.filter(d => d.release_year >= 2000);

      dataByYear = Array.from(
          d3.rollup(filteredData, v => ({
              total: v.length,
              movie: v.filter(d => d.type === "Movie").length,
              tvShow: v.filter(d => d.type === "TV Show").length
          }), d => d.release_year),
          ([key, value]) => ({ year: parseTime(key), ...value })
      ).sort((a, b) => a.year - b.year);

      const x = d3.scaleTime()
          .domain([parseTime("2000"), parseTime("2020")])
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
          .attr("stroke", "url(#line-gradient)")
          .attr("stroke-width", 1.5)
          .attr("d", line);

      // Dynamic transition
      const totalLength = path.node().getTotalLength();
      const firstMilestoneYear = 2007;
      const firstMilestoneIndex = dataByYear.findIndex(d => d.year.getFullYear() === firstMilestoneYear);
      const firstMilestoneLength = (firstMilestoneIndex / dataByYear.length) * totalLength;

      path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(5000)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", totalLength - firstMilestoneLength) // Animate up to the first milestone
          .on("end", () => {
              revealFirstMilestone();
              enableSlider();
          });

      // Define tooltip at the higher scope
      tooltip = d3.select("body").append("div")
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
          .attr("fill", d => milestones.some(m => m.year === d.year.getFullYear()) ? "#FF6347" : "#ADD8E6") /* Light Blue color for non-milestone circles, Tomato for milestones */
          .attr("opacity", d => d.year.getFullYear() <= 2007 ? 1 : 0) // Initial opacity set to 0 for dots beyond the first milestone
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

      // Add dynamic text at the bottom
      const dynamicText = d3.select(".milestones")
          .append("div")
          .attr("class", "dynamic-text")
          .style("text-align", "center")
          .style("font-size", "20px")
          .style("color", "black")
          .style("background", "steelblue")
          .style("padding", "10px")
          .style("border-radius", "5px")
          .style("margin-top", "10px");

      // Animation for revealing the first milestone
      function revealFirstMilestone() {
          const milestone = milestones.find(m => m.year === firstMilestoneYear);
          const yearData = dataByYear.find(d => d.year.getFullYear() === firstMilestoneYear);

          const boxGroup = g.append("g")
              .attr("class", `milestone-box milestone-box-${milestone.year}`);

          // Add milestone box
          const boxWidth = 200;
          const boxHeight = 60;
          const offset = firstMilestoneIndex % 2 === 0 ? 70 : -70;
          let xBox = x(parseTime(milestone.year)) + 15;
          if (xBox + boxWidth > width) xBox -= (boxWidth + 20);
          const yBox = y(yearData ? yearData.total : 0) - boxHeight - offset;

          boxGroup.append("rect")
              .attr("x", xBox)
              .attr("y", yBox)
              .attr("width", boxWidth)
              .attr("height", boxHeight)
              .attr("fill", "lightyellow")
              .attr("stroke", "#007BFF")
              .attr("stroke-width", 2);

          // Add milestone description text
          boxGroup.append("text")
              .attr("x", xBox + 10)
              .attr("y", yBox + 20)
              .style("font-size", "12px")
              .style("fill", "#333333")
              .text(milestone.description);

          // Add "Click for more details" link
          boxGroup.append("a")
              .attr("xlink:href", milestone.link)
              .attr("target", "_blank")
              .append("text")
              .attr("x", xBox + 10)
              .attr("y", yBox + 40)
              .style("font-size", "12px")
              .style("fill", "#007BFF")
              .style("text-decoration", "underline")
              .text("Click for more details");

          // Add arrow
          boxGroup.append("line")
              .attr("x1", xBox)
              .attr("y1", yBox + boxHeight / 2)
              .attr("x2", x(parseTime(milestone.year)))
              .attr("y2", y(yearData ? yearData.total : 0))
              .attr("stroke", "black")
              .attr("marker-end", "url(#arrow)");

          // Show or hide the milestone link based on slider position
          if (milestone.year > parseInt(document.getElementById("yearSlider").value)) {
              boxGroup.attr("opacity", 0);
          } else {
              boxGroup.attr("opacity", 1);
          }

          // Update dynamic text
          dynamicText.html(`<a href="${milestone.link}" target="_blank">${milestone.description}</a>`);
      }

      function enableSlider() {
          // Enable slider for user interaction after animation completes
          const slider = document.getElementById("yearSlider");
          const yearLabel = document.getElementById("yearLabel");

          slider.disabled = false; // Enable the slider

          slider.addEventListener("input", function() {
              const year = parseInt(this.value);
              yearLabel.innerText = year;
              updateGraphForYear(year);

              // Reveal dots gradually as the slider moves
              g.selectAll("circle")
                  .attr("opacity", d => d.year.getFullYear() <= year ? 1 : 0);
          });
      }
  }
});
