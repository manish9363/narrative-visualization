document.addEventListener("DOMContentLoaded", function() {
    d3.csv("data/netflix_titles.csv").then(function(data) {
      // Format number with commas using d3.format
      const formatNumber = d3.format(",");
  
      // Calculate total titles
      const totalTitles = data.length;
      const totalTitlesElement = document.querySelector("#total-titles");
      if (totalTitlesElement) {
        totalTitlesElement.innerText = formatNumber(totalTitles);
      }
  
      // Calculate content type distribution
      const contentTypeCounts = d3.rollup(data, v => v.length, d => d.type);
      const contentTypeDistribution = Array.from(contentTypeCounts, ([key, value]) => `${key}: ${formatNumber(value)}`).join(", ");
      const contentTypeElement = document.querySelector("#content-type");
      if (contentTypeElement) {
        contentTypeElement.innerText = contentTypeDistribution;
      }
    }).catch(function(error) {
      console.error('Error loading the CSV file:', error);
    });
  });
  