document.addEventListener("DOMContentLoaded", function () {
    let dataByYear;
    let customerDataByYear;
    let milestones;
    let tooltip;

    Promise.all([
        d3.csv("data/netflix_titles.csv"),
        d3.csv("data/netflix_customer_growth_regions.csv")
    ]).then(function (datasets) {
        const data = datasets[0];
        const customerData = datasets[1];

        milestones = [
            { year: 2007, description: "Netflix Launches Streaming", link: "milestone1.html" },
            { year: 2013, description: "House of Cards, first original series", link: "milestone2.html" },
            { year: 2016, description: "Netflix available in 190 countries", link: "milestone3.html" }
        ];

        createDynamicLineGraphWithMilestones(data, customerData);

        // Set up slider
        const slider = document.getElementById("yearSlider");
        const yearLabel = document.getElementById("yearLabel");
        slider.value = 2005;
        yearLabel.innerText = 2005;

        slider.addEventListener("input", function () {
            const year = parseInt(this.value);
            yearLabel.innerText = year;
            updateGraphForYear(year);
        });

        window.addEventListener("resize", () => {
            createDynamicLineGraphWithMilestones(data, customerData);
        });
    }).catch(function (error) {
        console.error('Error loading the CSV files:', error);
    });

    function updateGraphForYear(year) {
        const svg = d3.select("#line-graph svg");
        const margin = { top: 50, right: 50, bottom: 50, left: 100 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;
        const g = svg.select("g");
        const parseTime = d3.timeParse("%Y");

        const filteredData = dataByYear.filter(d => d.year.getFullYear() <= year);
        const filteredCustomerData = customerDataByYear.filter(d => d.year.getFullYear() <= year);

        const x = d3.scaleTime()
            .domain([parseTime("2005"), parseTime("2020")])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(dataByYear, d => d.cumulativeTotal)])
            .range([height, 0]);

        const y2 = d3.scaleLinear()
            .domain([0, 200]) // Adjusted for million notation
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.cumulativeTotal));

        const lineCustomer = d3.line()
            .x(d => x(d.year))
            .y(d => y2(d.customers / 1000000)); // Scale in millions

        g.selectAll("path.titles-line").remove(); // Remove existing paths before redrawing
        g.selectAll("path.customers-line").remove(); // Remove existing paths before redrawing
        g.selectAll("circle.title-circle").remove(); // Remove existing circles before redrawing
        g.selectAll("circle.customer-circle").remove(); // Remove existing circles before redrawing
        g.selectAll(".milestone-line").remove(); // Remove existing milestone lines before redrawing
        g.selectAll(".milestone-box").remove(); // Remove existing milestone boxes before redrawing

        g.append("path")
            .datum(filteredData)
            .attr("class", "titles-line")
            .attr("fill", "none")
            .attr("stroke", "#87CEEB") /* Light Blue color for the total titles line */
            .attr("stroke-width", 1.5)
            .attr("d", line);

        g.append("path")
            .datum(filteredCustomerData)
            .attr("class", "customers-line")
            .attr("fill", "none")
            .attr("stroke", "#FFA500") /* Orange color for the customer growth line */
            .attr("stroke-width", 1.5)
            .attr("d", lineCustomer);

        const titleCircles = g.selectAll("circle.title-circle")
            .data(filteredData);

        titleCircles.enter().append("circle")
            .attr("class", "title-circle")
            .attr("r", 5)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.cumulativeTotal))
            .attr("fill", d => milestones.some(m => m.year === d.year.getFullYear()) ? "#FF6347" : "#ADD8E6") /* Light Blue color for non-milestone circles, Tomato for milestones */
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Year: ${d.year.getFullYear()}<br>Total: ${d.cumulativeTotal}<br>Movies: ${d.cumulativeMovies}<br>TV Shows: ${d.cumulativeTvShows}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        const customerCircles = g.selectAll("circle.customer-circle")
            .data(filteredCustomerData);

        customerCircles.enter().append("circle")
            .attr("class", "customer-circle")
            .attr("r", 5)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y2(d.customers / 1000000))
            .attr("fill", "#FFA500") /* Orange color for customer data points */
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Year: ${d.year.getFullYear()}<br>Customers: ${(d.customers / 1000000).toFixed(2)}M`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        milestones.forEach((milestone, index) => {
            if (milestone.year <= year) {
                g.append("line")
                    .attr("class", "milestone-line")
                    .attr("x1", x(parseTime(milestone.year)))
                    .attr("x2", x(parseTime(milestone.year)))
                    .attr("y1", 0)
                    .attr("y2", height)
                    .attr("stroke", "#FF6347")
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "4 2");

                // Calculate title and customer counts from the filtered data
                const milestoneData = filteredData.find(d => d.year.getFullYear() === milestone.year);
                const milestoneCustomerData = filteredCustomerData.find(d => d.year.getFullYear() === milestone.year);

                const titles = milestoneData ? milestoneData.cumulativeTotal : 0;
                const customers = milestoneCustomerData ? (milestoneCustomerData.customers / 1000000).toFixed(2) : 0;

                const boxGroup = g.append("g")
                    .attr("class", "milestone-box")
                    .attr("transform", `translate(${x(parseTime(milestone.year)) - 100},${height / 2 - 70})`); // Adjusted position

                // Add milestone box
                const boxWidth = 205;
                const boxHeight = 100;

                boxGroup.append("rect")
                    .attr("width", boxWidth)
                    .attr("height", boxHeight)
                    .attr("rx", 10)
                    .attr("ry", 10)
                    .attr("fill", "lightyellow")
                    .attr("stroke", "#007BFF")
                    .attr("stroke-width", 1)
                    .style("filter", "url(#drop-shadow)");

                boxGroup.append("text")
                    .attr("x", 80)
                    .attr("y", 20)
                    .style("font-size", "11px")
                    .style("fill", "#FF0000")
                    .style("font-weight", "bold")
                    .text(milestone.year);

                // Add milestone description text
                boxGroup.append("text")
                    .attr("x", 10)
                    .attr("y", 40)
                    .style("font-size", "11px")
                    .style("fill", "#333333")
                    .style("font-weight", "bold")
                    .text(milestone.description);

                // Add title count
                boxGroup.append("text")
                    .attr("x", 10)
                    .attr("y", 60)
                    .style("font-size", "12px")
                    .style("fill", "#333333")
                    .text(`Titles: ${titles}`);

                // Add customer count
                boxGroup.append("text")
                    .attr("x", 10)
                    .attr("y", 75)
                    .style("font-size", "12px")
                    .style("fill", "#333333")
                    .text(`Customers: ${customers}M`);

                // Add "More details" link
                boxGroup.append("a")
                    .attr("xlink:href", milestone.link)
                    .attr("target", "_self")
                    .append("text")
                    .attr("x", 10)
                    .attr("y", 90)
                    .style("font-size", "12px")
                    .style("fill", "#007BFF")
                    .style("text-decoration", "underline")
                    .text("More details");
            }
        });
    }

    function createDynamicLineGraphWithMilestones(data, customerData) {
        const container = d3.select("#line-graph");
        container.selectAll("*").remove(); // Clear existing graph

        const svg = container.append("svg")
            .attr("width", container.node().getBoundingClientRect().width)
            .attr("height", 435);

        const margin = { top: 50, right: 50, bottom: 50, left: 100 };
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

        // Define drop shadow filter
        const defs = svg.append("defs");
        const filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "130%");

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 3)
            .attr("result", "blur");

        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 2)
            .attr("dy", 2)
            .attr("result", "offsetBlur");

        const feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");

        // Filter data from year 2005 onwards
        const filteredData = data.filter(d => d.release_year >= 2005);

        dataByYear = Array.from(
            d3.rollup(filteredData, v => ({
                total: v.length,
                cumulativeTotal: v.reduce((acc, curr) => acc + 1, 0),
                cumulativeMovies: v.filter(d => d.type === "Movie").reduce((acc, curr) => acc + 1, 0),
                cumulativeTvShows: v.filter(d => d.type === "TV Show").reduce((acc, curr) => acc + 1, 0),
                movie: v.filter(d => d.type === "Movie").length,
                tvShow: v.filter(d => d.type === "TV Show").length
            }), d => d.release_year),
            ([key, value]) => ({ year: parseTime(key), ...value })
        ).sort((a, b) => a.year - b.year);

        // Aggregate customer data by year
        customerDataByYear = Array.from(
            d3.rollup(customerData, v => ({
                customers: d3.sum(v, d => +d.customers)
            }), d => d.year),
            ([key, value]) => ({ year: parseTime(key), ...value })
        ).sort((a, b) => a.year - b.year);

        const x = d3.scaleTime()
            .domain([parseTime("2005"), parseTime("2020")])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(dataByYear, d => d.cumulativeTotal)])
            .range([height, 0]);

        const y2 = d3.scaleLinear()
            .domain([0, 200]) // Adjusted for million notation
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.cumulativeTotal));

        const lineCustomer = d3.line()
            .x(d => x(d.year))
            .y(d => y2(d.customers / 1000000)); // Scale in millions

        g.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

        g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format("d"))); // Total Titles axis

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20) // Adjusted position
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Total Titles");

        g.append("g")
            .attr("class", "y axis")
            .attr("transform", `translate(${width},0)`)
            .call(d3.axisRight(y2).ticks(10).tickFormat(d => d + "M")); // Customers axis

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", width + margin.right - 35) // Adjusted position
            .attr("x", 0 - (height / 2))
            .attr("dy", "2em") // Adjusted distance
            .style("text-anchor", "middle")
            .text("Customers (Millions)");

        const pathTitles = g.append("path")
            .datum(dataByYear)
            .attr("class", "titles-line")
            .attr("fill", "none")
            .attr("stroke", "url(#line-gradient)")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        const pathCustomers = g.append("path")
            .datum(customerDataByYear)
            .attr("class", "customers-line")
            .attr("fill", "none")
            .attr("stroke", "#FFA500") /* Orange color for the customer growth line */
            .attr("stroke-width", 1.5)
            .attr("d", lineCustomer);

        // Dynamic transition
        const totalLengthTitles = pathTitles.node().getTotalLength();
        const totalLengthCustomers = pathCustomers.node().getTotalLength();

        // Set up slider
        const slider = document.getElementById("yearSlider");
        const yearLabel = document.getElementById("yearLabel");

        pathTitles
            .attr("stroke-dasharray", totalLengthTitles + " " + totalLengthTitles)
            .attr("stroke-dashoffset", totalLengthTitles)
            .transition()
            .duration(8000) // Increase duration for complete animation
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0) // Animate to the end
            .on("start", function () {
                d3.active(this)
                    .tween("year", function () {
                        const interpolate = d3.interpolateNumber(2005, 2020);
                        return function (t) {
                            const year = Math.round(interpolate(t));
                            yearLabel.innerText = year;
                            slider.value = year;
                            updateGraphForYear(year);
                        };
                    });
            });

        pathCustomers
            .attr("stroke-dasharray", totalLengthCustomers + " " + totalLengthCustomers)
            .attr("stroke-dashoffset", totalLengthCustomers)
            .transition()
            .duration(8000) // Increase duration for complete animation
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0); // Animate to the end

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
            .attr("class", "title-circle")
            .attr("r", 5)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.cumulativeTotal))
            .attr("fill", d => milestones.some(m => m.year === d.year.getFullYear()) ? "#FF6347" : "#ADD8E6") /* Light Blue color for non-milestone circles, Tomato for milestones */
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Year: ${d.year.getFullYear()}<br>Total: ${d.cumulativeTotal}<br>Movies: ${d.cumulativeMovies}<br>TV Shows: ${d.cumulativeTvShows}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add circles for customer data
        g.selectAll(".customer-circle")
            .data(customerDataByYear)
            .enter().append("circle")
            .attr("class", "customer-circle")
            .attr("r", 5)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y2(d.customers / 1000000))
            .attr("fill", "#FFA500") /* Orange color for customer data points */
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Year: ${d.year.getFullYear()}<br>Customers: ${(d.customers / 1000000).toFixed(2)}M`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add static annotations

        // Add legend for line labels
        // Calculate the center position for the legend
        const legendWidth = 350; // Total width of the legend box
        const centerX = (width - legendWidth) / 2; // Calculate the x position to center the legend

        g.append("rect")
            .attr("x", centerX)
            .attr("y", -40) // Move the legend more towards the top
            .attr("width", legendWidth)
            .attr("height", 30)
            .attr("fill", "white")
            .attr("stroke", "black");

        g.append("line")
            .attr("x1", centerX + 10)
            .attr("y1", -25) // Adjust position according to rect y value
            .attr("x2", centerX + 30)
            .attr("y2", -25)
            .attr("stroke", "#87CEEB")
            .attr("stroke-width", 1.5);

        g.append("text")
            .attr("x", centerX + 40)
            .attr("y", -20) // Adjust position according to rect y value
            .style("font-size", "12px") // Smaller text size
            .text("Titles launched")
            .attr("alignment-baseline", "middle");

        g.append("line")
            .attr("x1", centerX + 130)
            .attr("y1", -25) // Adjust position according to rect y value
            .attr("x2", centerX + 150)
            .attr("y2", -25)
            .attr("stroke", "#FFA500")
            .attr("stroke-width", 1.5);

        g.append("text")
            .attr("x", centerX + 160)
            .attr("y", -20) // Adjust position according to rect y value
            .style("font-size", "12px") // Smaller text size
            .text("Customer Growth")
            .attr("alignment-baseline", "middle");

        function enableSlider() {
            const slider = document.getElementById("yearSlider");
            const yearLabel = document.getElementById("yearLabel");

            slider.disabled = false;

            slider.addEventListener("input", function () {
                const year = parseInt(this.value);
                yearLabel.innerText = year;
                updateGraphForYear(year);

                g.selectAll(".title-circle")
                    .attr("opacity", d => d.year.getFullYear() <= year ? 1 : 0);

                g.selectAll(".customer-circle")
                    .attr("opacity", d => d.year.getFullYear() <= year ? 1 : 0);

                // Update visibility of milestone boxes
                g.selectAll(".milestone-box").attr("opacity", d => d.year <= year ? 1 : 0);
            });
        }

        enableSlider();
    }
});
