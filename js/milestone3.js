document.addEventListener("DOMContentLoaded", function () {
    d3.csv("data/netflix_titles.csv").then(data => {
        // Prepare the data
        data.forEach(d => {
            if (!d.country) {
                d.country = "United States"; // Assign null/missing countries to the US
            } else {
                d.country = d.country.split(',')[0].trim(); // Select the first country if multiple are listed
            }
            if (!d.listed_in) {
                d.listed_in = "Unknown"; // Assign unknown to missing genres
            } else {
                d.listed_in = d.listed_in.split(',')[0].trim(); // Select the first genre if multiple are listed
            }
        });

        const countryCounts = d3.rollup(data, v => v.length, d => d.country);
        const genreCounts = d3.rollup(data, v => v.length, d => d.listed_in);

        // Filter out countries and genres with less than 10 titles
        const filteredCountryCounts = Array.from(countryCounts, ([country, count]) => ({ country, count }))
            .filter(d => d.count >= 10)
            .sort((a, b) => d3.descending(a.count, b.count))
            .slice(0, 100); // Take top 100 countries for visibility

        const filteredGenreCounts = Array.from(genreCounts, ([genre, count]) => ({ genre, count }))
            .filter(d => d.count >= 10)
            .sort((a, b) => d3.descending(a.count, b.count))
            .slice(0, 100); // Take top 100 genres for visibility

        const shortCountryNames = {
            "United States": "US",
            "United Kingdom": "UK",
            "South Korea": "Korea",
            "Hong Kong": "HK",
            "New Zealand": "NZ",
            // Add more mappings as needed
        };

        const shortGenreNames = {
            "International TV Shows": "Intl TV",
            "Children & Family Movies": "Kids & Family",
            "Action & Adventure": "Action",
            "Sci-Fi & Fantasy": "Sci-Fi",
            "Documentaries": "Docs",
            "British TV Shows": "British TV",
            "Dramas": "Dramas",
            // Add more mappings as needed
        };

        const diameter = 550;
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const bubble = d3.pack()
            .size([diameter, diameter])
            .padding(1.5);

        const svg = d3.select("#combinedChart")
            .append("svg")
            .attr("width", diameter + 300) // Increased width to accommodate annotations
            .attr("height", diameter)
            .attr("class", "bubble");

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "lightsteelblue")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        const renderBubbles = (data, isCountry = true) => {
            svg.selectAll(".node").remove();
            svg.selectAll(".annotation").remove();

            const root = d3.hierarchy({ children: data })
                .sum(d => d.count * 0.05); // Adjust the scaling factor here to make circles smaller

            bubble(root);

            const nodes = svg.selectAll(".node")
                .data(root.children)
                .enter().append("g")
                .attr("class", "node")
                .attr("transform", d => `translate(${d.x + 150},${d.y})`); // Move circles to the right to make space for annotations

            nodes.append("circle")
                .attr("r", d => d.r)
                .attr("fill", d => color(isCountry ? d.data.country : d.data.genre))
                .each(function (d) {
                    d.originalRadius = d.r;
                    d.originalX = d.x;
                    d.originalY = d.y;
                }) // Store the original radius and position
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", d.originalRadius * 1.2); // Use the stored original radius
                    nodes.selectAll("circle").filter(function (e) { return e !== d; })
                        .transition()
                        .duration(200)
                        .style("opacity", 0.3);
                })
                .on("mouseout", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", d.originalRadius) // Restore the original radius
                        .attr("cx", d.originalX)
                        .attr("cy", d.originalY);
                    nodes.selectAll("circle")
                        .transition()
                        .duration(200)
                        .style("opacity", 1);
                });

            nodes.append("text")
                .attr("dy", ".3em")
                .attr("text-anchor", "middle")
                .style("pointer-events", "none")
                .style("fill", "white")
                .style("font-size", d => `${d.r / 3}px`)
                .text(d => {
                    const name = isCountry ? (shortCountryNames[d.data.country] || d.data.country) : (shortGenreNames[d.data.genre] || d.data.genre);
                    return name.length > 10 ? name.substring(0, 10) + "..." : name;
                });

            nodes.on("mouseover", function (event, d) {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`${isCountry ? "Country" : "Genre"}: ${isCountry ? d.data.country : d.data.genre}<br>Count: ${d.data.count}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
                .on("mouseout", function () {
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            // Add annotations for the US or Dramas
            if (isCountry) {
                const usData = data.find(d => d.country === "United States");
                if (usData) {
                    const usNode = nodes.filter(d => d.data.country === "United States");

                    svg.append("text")
                        .attr("class", "annotation")
                        .attr("x", 50) // Adjust the position for visibility
                        .attr("y", 50)
                        .attr("text-anchor", "start")
                        .attr("font-size", "12px")
                        .attr("fill", "black")
                        .text(`US Titles: ${usData.count}`);

                    svg.append("line")
                        .attr("class", "annotation")
                        .attr("x1", usNode.datum().x + 150) // Move x position to the right to match new bubble position
                        .attr("y1", usNode.datum().y)
                        .attr("x2", 100) // Adjust the position for visibility
                        .attr("y2", 50)
                        .attr("stroke", "black")
                        .attr("stroke-width", 2)
                        .attr("marker-end", "url(#arrow)");
                }
            } else {
                const dramaData = data.find(d => d.genre === "Dramas");
                if (dramaData) {
                    const dramaNode = nodes.filter(d => d.data.genre === "Dramas");

                    svg.append("text")
                        .attr("class", "annotation")
                        .attr("x", 50) // Adjust the position for visibility
                        .attr("y", 100)
                        .attr("text-anchor", "start")
                        .attr("font-size", "12px")
                        .attr("fill", "black")
                        .text(`Dramas: ${dramaData.count}`);

                    svg.append("line")
                        .attr("class", "annotation")
                        .attr("x1", dramaNode.datum().x + 150) // Move x position to the right to match new bubble position
                        .attr("y1", dramaNode.datum().y)
                        .attr("x2", 100) // Adjust the position for visibility
                        .attr("y2", 100)
                        .attr("stroke", "black")
                        .attr("stroke-width", 2)
                        .attr("marker-end", "url(#arrow)");
                }
            }

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
        };

        renderBubbles(filteredCountryCounts);

        d3.select("#countryButton").on("click", () => renderBubbles(filteredCountryCounts, true));
        d3.select("#genreButton").on("click", () => renderBubbles(filteredGenreCounts, false));
    });
});

