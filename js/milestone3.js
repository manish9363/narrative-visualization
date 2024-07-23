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
            // Add more mappings as needed
        };

        const diameter = 600;
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const bubble = d3.pack()
            .size([diameter, diameter])
            .padding(1.5);

        const svg = d3.select("#combinedChart")
            .append("svg")
            .attr("width", diameter)
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

            const root = d3.hierarchy({ children: data })
                .sum(d => d.count * 0.05); // Adjust the scaling factor here to make circles smaller

            bubble(root);

            const nodes = svg.selectAll(".node")
                .data(root.children)
                .enter().append("g")
                .attr("class", "node")
                .attr("transform", d => `translate(${d.x},${d.y})`);

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
        };

        renderBubbles(filteredCountryCounts);

        d3.select("#countryButton").on("click", () => renderBubbles(filteredCountryCounts, true));
        d3.select("#genreButton").on("click", () => renderBubbles(filteredGenreCounts, false));
    });
});
