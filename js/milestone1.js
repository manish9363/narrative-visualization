document.addEventListener("DOMContentLoaded", function() {
    // Load customer data from CSV file
    d3.csv("data/netflix_customer_growth_regions.csv").then(function(data) {
        const customerDataByRegion = d3.group(data, d => d.region);
        const globalData = aggregateGlobalData(data);

        const margin = { top: 80, right: 30, bottom: 60, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#customerBaseChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .range([height, 0]);

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`);

        svg.append("g")
            .attr("class", "y-axis");

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
            .attr("y", -40)
            .text("Netflix Customer Base Growth by Region and Globally");

        // Add arrow marker
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

        updateChart(globalData);

        // Create filter dropdown
        const filterDropdown = d3.select("#filterDropdown");
        filterDropdown.on("change", function() {
            const selectedRegion = this.value;
            if (selectedRegion === "Global") {
                updateChart(globalData);
            } else {
                updateChart(customerDataByRegion.get(selectedRegion));
            }
        });

        // Populate filter dropdown with regions
        const regions = Array.from(customerDataByRegion.keys());
        regions.unshift("Global");
        filterDropdown.selectAll("option")
            .data(regions)
            .enter()
            .append("option")
            .text(d => d);

        function updateChart(customerData) {
            customerData = customerData.map(d => ({ ...d, customers: +d.customers, year: +d.year }));
            x.domain(customerData.map(d => d.year));
            y.domain([0, d3.max(customerData, d => d.customers)]).nice();

            svg.selectAll(".bar").remove();
            svg.selectAll(".bar-label").remove();
            svg.selectAll(".annotation").remove();

            svg.select(".x-axis")
                .call(d3.axisBottom(x).tickFormat(d3.format("d")));

            svg.select(".y-axis")
                .call(d3.axisLeft(y).tickFormat(d => `${d / 1000000}M`));

            const bars = svg.selectAll(".bar")
                .data(customerData);

            bars.enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.year))
                .attr("y", d => y(d.customers))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.customers))
                .attr("fill", d => d.year >= 2007 ? "#ff6347" : "#007BFF");

            // Add labels on bars
            svg.selectAll(".bar")
                .data(customerData)
                .enter()
                .append("text")
                .attr("class", "bar-label")
                .attr("x", d => x(d.year) + x.bandwidth() / 2)
                .attr("y", d => y(d.customers) - 5)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("font-weight", "bold")
                .text(d => `${(d.customers / 1000000).toFixed(1)}M`);

            // Add annotations for before and after streaming
            const beforeStreaming = customerData.find(d => d.year === 2006)?.customers || 0;
            const afterStreaming = customerData.find(d => d.year === 2020)?.customers || 0;
            const increase = afterStreaming - beforeStreaming;

            svg.append("line")
                .attr("x1", x(2006) + x.bandwidth() / 2)
                .attr("y1", y(beforeStreaming))
                .attr("x2", x(2020) + x.bandwidth() / 2)
                .attr("y2", y(afterStreaming))
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .attr("marker-end", "url(#arrow)")
                .attr("class", "annotation");

            svg.append("text")
                .attr("x", (x(2006) + x(2020)) / 2)
                .attr("y", (y(beforeStreaming) + y(afterStreaming)) / 2)
                .attr("dy", -10)
                .attr("text-anchor", "middle")
                .attr("fill", "red")
                .attr("font-weight", "bold")
                .attr("class", "annotation")
                .text(`+${(increase / 1000000).toFixed(1)}M customers`);
        }

        function aggregateGlobalData(data) {
            const years = [...new Set(data.map(d => d.year))];
            return years.map(year => {
                const customers = data
                    .filter(d => d.year === year)
                    .reduce((acc, d) => acc + +d.customers, 0);
                return { year: +year, customers };
            });
        }
    }).catch(function(error) {
        console.error('Error loading the CSV file:', error);
    });
});
