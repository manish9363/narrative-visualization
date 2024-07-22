document.addEventListener("DOMContentLoaded", function () {
    d3.csv("data/data.csv").then(data => {
        data.forEach(d => {
            d.year = +d.year;
            d.originalSeries = +d.originalSeries;
            d.licensedContent = +d.licensedContent;
        });

        const svgWidth = 1200; // Increase the width of the SVG
        const svgHeight = 500;
        const margin = { top: 50, right: 150, bottom: 50, left: 50 }; // Reduce the left margin
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        const svg = d3.select("#combinedChart")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(d3.range(2009, 2021))
            .range([0, width]) // Adjust the range to start from 0
            .padding(0.1);

        const yScaleViewership = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.originalSeries, d.licensedContent))])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

        svg.append("g")
            .attr("class", "y axis viewership")
            .call(d3.axisLeft(yScaleViewership).ticks(10))
            .append("text")
            .attr("fill", "black")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .attr("font-size", "14px")
            .text("Viewership (millions)");

        svg.append("line")
            .attr("x1", xScale(2013) + xScale.bandwidth() / 2)
            .attr("x2", xScale(2013) + xScale.bandwidth() / 2)
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4");

        svg.append("text")
            .attr("x", xScale(2013) + xScale.bandwidth() / 2)
            .attr("y", -10)
            .attr("fill", "red")
            .attr("text-anchor", "middle")
            .text("2013: House of Cards Release");

        const legend = svg.append("g")
            .attr("transform", "translate(50,0)");

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "#FFA500");

        legend.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .text("Original Series");

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 20)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "#32CD32");

        legend.append("text")
            .attr("x", 15)
            .attr("y", 30)
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
            tooltip.html(`Year: ${d.year}<br>Original Series: ${d.originalSeries}M<br>Licensed Content: ${d.licensedContent}M`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        };

        const hideTooltip = () => {
            tooltip.transition().duration(500).style("opacity", 0);
        };

        // Define arrowhead marker
        svg.append("defs").append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5)
            .attr("refY", 0)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "black");

        const annotations = [
            { x: 2013, y: 5, dx: 30, dy: -40, color: "#FFA500", text: "Significant rise in viewership after 'House of Cards'.", line: "originalSeries" },
            { x: 2018, y: 13, dx: -300, dy: -100, color: "#32CD32", text: "Licensed content maintains steady viewership.", line: "licensedContent" },
            { x: 2019, y: 60, dx: -350, dy: -30, color: "#FFA500", text: "Original series continue to grow in popularity.", line: "originalSeries" }
        ];

        const filterDropdown = d3.select("#filterDropdown");

        const updateVisibility = () => {
            const selectedRegion = filterDropdown.property("value");
            const filteredData = data.filter(d => d.region === selectedRegion);

            svg.selectAll(".line, .dot, .annotation").remove(); // Remove existing elements

            const maxViewership = d3.max(filteredData, d => Math.max(d.originalSeries, d.licensedContent));
            yScaleViewership.domain([0, maxViewership]).nice();

            svg.select(".y.axis.viewership").transition().duration(500).call(d3.axisLeft(yScaleViewership).ticks(10));

            const lineOriginal = d3.line()
                .x(d => xScale(d.year) + xScale.bandwidth() / 2)
                .y(d => yScaleViewership(d.originalSeries));

            const lineLicensed = d3.line()
                .x(d => xScale(d.year) + xScale.bandwidth() / 2)
                .y(d => yScaleViewership(d.licensedContent));

            svg.append("path")
                .datum(filteredData)
                .attr("class", "line originalSeries")
                .attr("fill", "none")
                .attr("stroke", "#FFA500")
                .attr("stroke-width", 2)
                .attr("d", lineOriginal);

            svg.append("path")
                .datum(filteredData)
                .attr("class", "line licensedContent")
                .attr("fill", "none")
                .attr("stroke", "#32CD32")
                .attr("stroke-width", 2)
                .attr("d", lineLicensed);

            // Ensure old circles are removed before adding new ones
            svg.selectAll(".dot-original").remove();
            svg.selectAll(".dot-licensed").remove();

            svg.selectAll(".dot-original")
                .data(filteredData)
                .enter().append("circle")
                .attr("class", "dot-original")
                .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
                .attr("cy", d => yScaleViewership(d.originalSeries))
                .attr("r", 5)
                .attr("fill", "#FFA500")
                .on("mouseover", showTooltip)
                .on("mouseout", hideTooltip);

            svg.selectAll(".dot-licensed")
                .data(filteredData)
                .enter().append("circle")
                .attr("class", "dot-licensed")
                .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
                .attr("cy", d => yScaleViewership(d.licensedContent))
                .attr("r", 5)
                .attr("fill", "#32CD32")
                .on("mouseover", showTooltip)
                .on("mouseout", hideTooltip);

            annotations.forEach(annotation => {
                const dataPoint = filteredData.find(d => d.year === annotation.x);
                if (dataPoint) {
                    const yValue = annotation.line === "originalSeries" ? yScaleViewership(dataPoint.originalSeries) : yScaleViewership(dataPoint.licensedContent);
                    svg.append("line")
                        .attr("class", "annotation")
                        .attr("x1", xScale(annotation.x) + xScale.bandwidth() / 2)
                        .attr("y1", yValue)
                        .attr("x2", xScale(annotation.x) + xScale.bandwidth() / 2 + annotation.dx)
                        .attr("y2", yValue + annotation.dy)
                        .attr("stroke", annotation.color)
                        .attr("stroke-width", 1)
                        .attr("marker-end", "url(#arrow)");

                    svg.append("text")
                        .attr("class", "annotation")
                        .attr("x", xScale(annotation.x) + xScale.bandwidth() / 2 + annotation.dx + 5)
                        .attr("y", yValue + annotation.dy)
                        .attr("fill", annotation.color)
                        .attr("font-size", "10px")
                        .attr("text-anchor", "start")
                        .text(`${annotation.text} Original: ${dataPoint.originalSeries}M, Licensed: ${dataPoint.licensedContent}M`);
                }
            });
        };

        filterDropdown.on("change", updateVisibility);

        updateVisibility();
    });
});
