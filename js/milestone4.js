document.addEventListener("DOMContentLoaded", function () {
    d3.csv("data/customer_growth.csv").then(function (customerData) {
        d3.csv("data/milestones.csv").then(function (milestoneData) {
            
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

            const milestoneSvg = d3.select("#milestonesChart")
                .append("svg")
                .attr("width", 800)
                .attr("height", 400)
                .append("g")
                .attr("transform", "translate(100,50)");

            const xScaleMilestones = d3.scaleBand()
                .domain(milestoneData.map(d => d.year))
                .range([0, 700])
                .padding(0.1);

            const yScaleMilestones = d3.scaleLinear()
                .domain([0, d3.max(milestoneData, d => +d.impact)])
                .nice()
                .range([300, 0]);

            milestoneSvg.append("g")
                .attr("transform", "translate(0,300)")
                .call(d3.axisBottom(xScaleMilestones).tickFormat(d3.format("d")));
            
            milestoneSvg.append("g")
                .call(d3.axisLeft(yScaleMilestones).ticks(10))
                .append("text")
                .attr("fill", "#FFA500")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Impact (millions)");

            const lineMilestones = d3.line()
                .x(d => xScaleMilestones(d.year) + xScaleMilestones.bandwidth() / 2)
                .y(d => yScaleMilestones(d.impact));

            milestoneSvg.append("path")
                .datum(milestoneData)
                .attr("fill", "none")
                .attr("stroke", "#FFA500")
                .attr("stroke-width", 2)
                .attr("d", lineMilestones);

            // Add annotations
            const annotations = [
                {
                    note: { label: "House of Cards Release", title: "2013" },
                    x: xScale("2013") + xScale.bandwidth() / 2,
                    y: yScale(25),
                    dx: 50,
                    dy: -50,
                    subject: { radius: 4, radiusPadding: 1 }
                },
                {
                    note: { label: "Global Expansion to 190 countries", title: "2016" },
                    x: xScale("2016") + xScale.bandwidth() / 2,
                    y: yScale(75),
                    dx: 50,
                    dy: -50,
                    subject: { radius: 4, radiusPadding: 1 }
                },
                {
                    note: { label: "Reaches 200 million subscribers", title: "2021" },
                    x: xScale("2020") + xScale.bandwidth() / 2,
                    y: yScale(160),
                    dx: 50,
                    dy: -50,
                    subject: { radius: 4, radiusPadding: 1 }
                }
            ];

            const makeAnnotations = d3.annotation()
                .annotations(annotations);

            svg.append("g")
                .call(makeAnnotations);
        });
    });
});
