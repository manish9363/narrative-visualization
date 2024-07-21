document.addEventListener("DOMContentLoaded", function() {
    // Sample data for customer base before and after the streaming service
    const data = [
      { year: 2006, customers: 6000000 },
      { year: 2007, customers: 7000000 },
      { year: 2008, customers: 9000000 },
      { year: 2009, customers: 12000000 },
      { year: 2010, customers: 20000000 },
      { year: 2011, customers: 25000000 },
    ];
  
    const margin = { top: 40, right: 30, bottom: 40, left: 60 }; // Increased top margin
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#customerBaseChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleBand()
      .domain(data.map(d => d.year))
      .range([0, width])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.customers)])
      .nice()
      .range([height, 0]);
  
    svg.append("g")
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.year))
      .attr("y", d => y(d.customers))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.customers))
      .attr("fill", d => d.year >= 2007 ? "#ff6347" : "#007BFF"); // Red for years 2007 and after
  
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).tickFormat(d => `${d / 1000000}M`));
  
    svg.append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width / 2},${height + margin.bottom - 10})`)
      .text("Year");
  
    svg.append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(-40,${height / 2})rotate(-90)`)
      .text("Customers (in millions)");
  
    svg.append("text")
      .attr("class", "chart-title")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", -25) // Adjusted y position to move it higher
      .text("Netflix Customer Base Before and After Streaming Service Launch");
  
    // Adding the indicator
    const beforeStreaming = data.find(d => d.year === 2007).customers;
    const afterStreaming = data.find(d => d.year === 2011).customers;
    const increase = afterStreaming - beforeStreaming;
  
    svg.append("line")
      .attr("x1", x(2007) + x.bandwidth() / 2)
      .attr("y1", y(beforeStreaming))
      .attr("x2", x(2011) + x.bandwidth() / 2)
      .attr("y2", y(afterStreaming))
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");
  
    svg.append("text")
      .attr("x", (x(2007) + x(2011)) / 2)
      .attr("y", (y(beforeStreaming) + y(afterStreaming)) / 2)
      .attr("dy", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "red")
      .attr("font-weight", "bold")
      .text(`+${(increase / 1000000).toFixed(1)}M customers`);
  
    // Define arrow marker
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
      .attr("fill", "red");
  
    // Adding the before metrics
    svg.append("text")
      .attr("x", x(2007) + x.bandwidth() / 2)
      .attr("y", y(beforeStreaming))
      .attr("dy", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("font-weight", "bold")
      .text(`Before: ${(beforeStreaming / 1000000).toFixed(1)}M`);
  
    // Adding the after metrics
    svg.append("text")
      .attr("x", x(2011) + x.bandwidth() / 2)
      .attr("y", y(afterStreaming))
      .attr("dy", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("font-weight", "bold")
      .text(`After: ${(afterStreaming / 1000000).toFixed(1)}M`);
  });
  