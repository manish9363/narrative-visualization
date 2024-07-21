document.addEventListener("DOMContentLoaded", function () {
    const combinedData = [
        { year: 2009, customers: 10, originalSeries: 0, licensedContent: 10 },
        { year: 2010, customers: 12, originalSeries: 0, licensedContent: 12 },
        { year: 2011, customers: 15, originalSeries: 0, licensedContent: 15 },
        { year: 2012, customers: 18, originalSeries: 0, licensedContent: 13 },
        { year: 2013, customers: 25, originalSeries: 5, licensedContent: 15 },
        { year: 2014, customers: 40, originalSeries: 10, licensedContent: 20 },
        { year: 2015, customers: 55, originalSeries: 20, licensedContent: 25 },
        { year: 2016, customers: 75, originalSeries: 30, licensedContent: 30 },
        { year: 2017, customers: 90, originalSeries: 45, licensedContent: 30 },
        { year: 2018, customers: 110, originalSeries: 60, licensedContent: 30 },
        { year: 2019, customers: 130, originalSeries: 80, licensedContent: 30 },
        { year: 2020, customers: 160, originalSeries: 100, licensedContent: 40 },
    ];

    const svg = d3.select("#combinedChart")
        .append("svg")
        .attr("width", 800)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(100,50)");

    const xScale = d3.scaleBand()
        .domain(combinedData.map(d => d.year))
        .range([0, 700])
        .padding(0.1);

    const yScaleCustomers = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => d.customers)])
        .nice()
        .range([300, 0]);

    const yScaleViewership = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => Math.max(d.originalSeries, d.licensedContent))])
        .nice()
        .range([300, 0]);

    svg.append("g")
        .attr("transform", "translate(0,300)")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("class", "y axis customers")
        .call(d3.axisLeft(yScaleCustomers).ticks(10))
        .append("text")
        .attr("fill", "#007BFF")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Customers (millions)");

    svg.append("g")
        .attr("class", "y axis viewership")
        .attr("transform", "translate(700,0)")
        .call(d3.axisRight(yScaleViewership).ticks(10))
        .append("text")
        .attr("fill", "#32CD32")
        .attr("transform", "rotate(-90)")
        .attr("y", 50)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Viewership (millions)");

    const lineCustomers = d3.line()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yScaleCustomers(d.customers));

    const lineOriginal = d3.line()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yScaleViewership(d.originalSeries));

    const lineLicensed = d3.line()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yScaleViewership(d.licensedContent));

    svg.append("path")
        .datum(combinedData)
        .attr("class", "line customers")
        .attr("fill", "none")
        .attr("stroke", "#007BFF")
        .attr("stroke-width", 2)
        .attr("d", lineCustomers);

    svg.append("path")
        .datum(combinedData)
        .attr("class", "line originalSeries")
        .attr("fill", "none")
        .attr("stroke", "#FFA500")
        .attr("stroke-width", 2)
        .attr("d", lineOriginal);

    svg.append("path")
        .datum(combinedData)
        .attr("class", "line licensedContent")
        .attr("fill", "none")
        .attr("stroke", "#32CD32")
        .attr("stroke-width", 2)
        .attr("d", lineLicensed);

    svg.append("line")
        .attr("x1", xScale(2013) + xScale.bandwidth() / 2)
        .attr("x2", xScale(2013) + xScale.bandwidth() / 2)
        .attr("y1", 0)
        .attr("y2", 300)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4");

    svg.append("text")
        .attr("x", xScale(2013))
        .attr("y", 20)
        .attr("fill", "red")
        .text("2013: House of Cards Release");

    const legend = svg.append("g")
        .attr("transform", "translate(50,0)"); // Adjusted transform to move legend to the middle

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "#007BFF");

    legend.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .text("Customers");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "#FFA500");

    legend.append("text")
        .attr("x", 15)
        .attr("y", 30)
        .text("Original Series");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 40)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "#32CD32");

    legend.append("text")
        .attr("x", 15)
        .attr("y", 50)
        .text("Licensed Content");

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "lightsteelblue")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    const showTooltip = (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`Year: ${d.year}<br>Customers: ${d.customers}M<br>Original Series: ${d.originalSeries}M<br>Licensed Content: ${d.licensedContent}M`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    };

    const hideTooltip = () => {
        tooltip.transition().duration(500).style("opacity", 0);
    };

    svg.selectAll(".dot")
        .data(combinedData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr("cy", d => yScaleCustomers(d.customers))
        .attr("r", 5)
        .attr("fill", "#007BFF")
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    svg.selectAll(".dot-original")
        .data(combinedData)
        .enter().append("circle")
        .attr("class", "dot-original")
        .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr("cy", d => yScaleViewership(d.originalSeries))
        .attr("r", 5)
        .attr("fill", "#FFA500")
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    svg.selectAll(".dot-licensed")
        .data(combinedData)
        .enter().append("circle")
        .attr("class", "dot-licensed")
        .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr("cy", d => yScaleViewership(d.licensedContent))
        .attr("r", 5)
        .attr("fill", "#32CD32")
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    // Filter
    const filterDropdown = d3.select("#filterDropdown");

    const updateVisibility = () => {
        const selectedValue = filterDropdown.property("value");
        svg.selectAll(".line, .dot").style("display", selectedValue === "all" || selectedValue === "customers" ? null : "none");
        svg.selectAll(".line.originalSeries, .dot-original").style("display", selectedValue === "all" || selectedValue === "originalSeries" ? null : "none");
        svg.selectAll(".line.licensedContent, .dot-licensed").style("display", selectedValue === "all" || selectedValue === "licensedContent" ? null : "none");
    };

    filterDropdown.on("change", updateVisibility);

    updateVisibility();
});
    