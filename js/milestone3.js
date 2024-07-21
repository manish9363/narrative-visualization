document.addEventListener("DOMContentLoaded", function () {
    d3.csv("data/customer_growth.csv").then(function (customerData) {
        d3.csv("data/country_launches.csv").then(function (launchData) {
            
            const svg = d3.select("#customerGrowthChart")
                .append("svg")
                .attr("width", 800)
                .attr("height", 400)
                .append("g")
                .attr("transform", "translate(100,50)");
            
            const xScale = d3.scaleBand()
                .domain(customerData.map(d => d.year))
                .range([0, 700])
                .padding(0.1);
            
            const yScale = d3.scaleLinear()
                .domain([0, d3.max(customerData, d => +d.customers)])
                .nice()
                .range([300, 0]);

            svg.append("g")
                .attr("transform", "translate(0,300)")
                .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
            
            svg.append("g")
                .call(d3.axisLeft(yScale).ticks(10))
                .append("text")
                .attr("fill", "#007BFF")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Customers (millions)");

            const line = d3.line()
                .x(d => xScale(d.year) + xScale.bandwidth() / 2)
                .y(d => yScale(d.customers));

            svg.append("path")
                .datum(customerData)
                .attr("fill", "none")
                .attr("stroke", "#007BFF")
                .attr("stroke-width", 2)
                .attr("d", line);

            svg.selectAll(".dot")
                .data(customerData)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
                .attr("cy", d => yScale(d.customers))
                .attr("r", 5)
                .attr("fill", "#007BFF")
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("r", 8);
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(`Year: ${d.year}<br>Customers: ${d.customers}M`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("r", 5);
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "lightsteelblue")
                .style("padding", "5px")
                .style("border-radius", "5px")
                .style("pointer-events", "none")
                .style("opacity", 0);

            const launchSvg = d3.select("#countryLaunchesChart")
                .append("svg")
                .attr("width", 800)
                .attr("height", 400)
                .append("g")
                .attr("transform", "translate(100,50)");

            const xScaleLaunch = d3.scaleBand()
                .domain(launchData.map(d => d.year))
                .range([0, 700])
                .padding(0.1);
            
            const yScaleLaunch = d3.scaleLinear()
                .domain([0, d3.max(launchData, d => +d.impact)])
                .nice()
                .range([300, 0]);

            launchSvg.append("g")
                .attr("transform", "translate(0,300)")
                .call(d3.axisBottom(xScaleLaunch).tickFormat(d3.format("d")));
            
            launchSvg.append("g")
                .call(d3.axisLeft(yScaleLaunch).ticks(10))
                .append("text")
                .attr("fill", "#32CD32")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Impact (millions)");

            const bar = launchSvg.selectAll(".bar")
                .data(launchData)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => xScaleLaunch(d.year))
                .attr("y", d => yScaleLaunch(d.impact))
                .attr("width", xScaleLaunch.bandwidth())
                .attr("height", d => 300 - yScaleLaunch(d.impact))
                .attr("fill", "#32CD32")
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("fill", "#FF5733");
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(`Year: ${d.year}<br>Country: ${d.country}<br>Impact: ${d.impact}M`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("fill", "#32CD32");
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            launchSvg.selectAll(".text")
                .data(launchData)
                .enter().append("text")
                .attr("x", d => xScaleLaunch(d.year) + xScaleLaunch.bandwidth() / 2)
                .attr("y", d => yScaleLaunch(d.impact) - 5)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .text(d => `${d.country}: ${d.impact}M`);

            // Add annotations for significant country launches
            launchSvg.append("text")
                .attr("x", xScaleLaunch(2013))
                .attr("y", yScaleLaunch(5) - 10)
                .attr("fill", "red")
                .text("2013: Brazil launch - Significant impact");

            launchSvg.append("text")
                .attr("x", xScaleLaunch(2016))
                .attr("y", yScaleLaunch(12) - 10)
                .attr("fill", "red")
                .text("2016: India launch - Major customer boost");

            launchSvg.append("text")
                .attr("x", xScaleLaunch(2020))
                .attr("y", yScaleLaunch(7) - 10)
                .attr("fill", "red")
                .text("2020: Spain launch - Continued growth");

        });
    });
});
