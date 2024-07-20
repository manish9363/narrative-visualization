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
  
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
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
      .attr("fill", "#007BFF");
  
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));
  
    svg.append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width / 2},${height + margin.bottom - 10})`)
      .text("Year");
  
    svg.append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(-40,${height / 2})rotate(-90)`)
      .text("Customers");
  
    svg.append("text")
      .attr("class", "chart-title")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", -10)
      .text("Netflix Customer Base Before and After Streaming Service Launch");
  });
  