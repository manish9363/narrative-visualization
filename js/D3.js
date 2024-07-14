let currentScene = 1;

d3.csv('/data/netflix_titles.csv').then(data => {
  // Parse data
  data.forEach(d => {
    d.release_year = +d.release_year;
  });

  // Create initial scene
  createScene1(data);
});

function createScene1(data) {
  d3.select('#visualization').html(''); // Clear previous scene

  const svg = d3.select('#visualization')
                .append('svg')
                .attr('width', 800)
                .attr('height', 600);

  const margin = {top: 20, right: 30, bottom: 40, left: 40};
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const x = d3.scaleLinear()
              .domain(d3.extent(data, d => d.release_year))
              .range([margin.left, width - margin.right]);

  const yearCounts = d3.rollup(data, v => v.length, d => d.release_year);
  const yearArray = Array.from(yearCounts, ([year, count]) => ({year, count}));

  const y = d3.scaleLinear()
              .domain([0, d3.max(yearArray, d => d.count)])
              .range([height - margin.bottom, margin.top]);

  svg.append('g')
     .attr('transform', `translate(0,${height - margin.bottom})`)
     .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append('g')
     .attr('transform', `translate(${margin.left},0)`)
     .call(d3.axisLeft(y));

  svg.selectAll('rect')
     .data(yearArray)
     .enter()
     .append('rect')
     .attr('x', d => x(d.year))
     .attr('y', d => y(d.count))
     .attr('width', 10)
     .attr('height', d => height - margin.bottom - y(d.count))
     .attr('fill', 'steelblue');

  svg.append('text')
     .attr('x', width / 2)
     .attr('y', margin.top)
     .attr('text-anchor', 'middle')
     .attr('font-size', '16px')
     .attr('font-weight', 'bold')
     .text('Netflix Content Added Each Year');

  svg.append('text')
     .attr('x', width - margin.right)
     .attr('y', height - margin.bottom)
     .attr('text-anchor', 'end')
     .attr('font-size', '12px')
     .text('Source: Netflix');

  d3.select('#nextButton').on('click', () => {
    currentScene++;
    if (currentScene === 2) {
      createScene2(data);
    } else if (currentScene === 3) {
      createScene3(data);
    }
  });
}

function createScene2(data) {
  d3.select('#visualization').html(''); // Clear previous scene

  const svg = d3.select('#visualization')
                .append('svg')
                .attr('width', 800)
                .attr('height', 600);

  const margin = {top: 20, right: 30, bottom: 40, left: 40};
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const genreCounts = d3.rollup(data, v => v.length, d => d.listed_in.split(',')[0]);
  const genreArray = Array.from(genreCounts, ([genre, count]) => ({genre, count}));

  const x = d3.scaleBand()
              .domain(genreArray.map(d => d.genre))
              .range([margin.left, width - margin.right])
              .padding(0.1);

  const y = d3.scaleLinear()
              .domain([0, d3.max(genreArray, d => d.count)])
              .nice()
              .range([height - margin.bottom, margin.top]);

  svg.append('g')
     .attr('transform', `translate(0,${height - margin.bottom})`)
     .call(d3.axisBottom(x));

  svg.append('g')
     .attr('transform', `translate(${margin.left},0)`)
     .call(d3.axisLeft(y));

  svg.selectAll('rect')
     .data(genreArray)
     .enter()
     .append('rect')
     .attr('x', d => x(d.genre))
     .attr('y', d => y(d.count))
     .attr('width', x.bandwidth())
     .attr('height', d => height - margin.bottom - y(d.count))
     .attr('fill', 'orange');

  svg.append('text')
     .attr('x', width / 2)
     .attr('y', margin.top)
     .attr('text-anchor', 'middle')
     .attr('font-size', '16px')
     .attr('font-weight', 'bold')
     .text('Genre Distribution of Netflix Content');

  svg.append('text')
     .attr('x', width - margin.right)
     .attr('y', height - margin.bottom)
     .attr('text-anchor', 'end')
     .attr('font-size', '12px')
     .text('Source: Netflix');

  d3.select('#nextButton').on('click', () => {
    currentScene++;
    if (currentScene === 3) {
      createScene3(data);
    }
  });
}

function createScene3(data) {
  d3.select('#visualization').html(''); // Clear previous scene

  const svg = d3.select('#visualization')
                .append('svg')
                .attr('width', 800)
                .attr('height', 600);

  const margin = {top: 20, right: 30, bottom: 40, left: 40};
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const ratingCounts = d3.rollup(data, v => v.length, d => d.rating);
  const ratingArray = Array.from(ratingCounts, ([rating, count]) => ({rating, count}));

  const x = d3.scaleBand()
              .domain(ratingArray.map(d => d.rating))
              .range([margin.left, width - margin.right])
              .padding(0.1);

  const y = d3.scaleLinear()
              .domain([0, d3.max(ratingArray, d => d.count)])
              .nice()
              .range([height - margin.bottom, margin.top]);

  svg.append('g')
     .attr('transform', `translate(0,${height - margin.bottom})`)
     .call(d3.axisBottom(x));

  svg.append('g')
     .attr('transform', `translate(${margin.left},0)`)
     .call(d3.axisLeft(y));

  svg.selectAll('rect')
     .data(ratingArray)
     .enter()
     .append('rect')
     .attr('x', d => x(d.rating))
     .attr('y', d => y(d.count))
     .attr('width', x.bandwidth())
     .attr('height', d => height - margin.bottom - y(d.count))
     .attr('fill', 'green');

  svg.append('text')
     .attr('x', width / 2)
     .attr('y', margin.top)
     .attr('text-anchor', 'middle')
     .attr('font-size', '16px')
     .attr('font-weight', 'bold')
     .text('Content Ratings Distribution');

  svg.append('text')
     .attr('x', width - margin.right)
     .attr('y', height - margin.bottom)
     .attr('text-anchor', 'end')
     .attr('font-size', '12px')
     .text('Source: Netflix');

  d3.select('#nextButton').on('click', () => {
    currentScene++;
    if (currentScene === 4) {
      createScene4(data);
    }
  });
}

function createScene4(data) {
  d3.select('#visualization').html(''); // Clear previous scene

  const svg = d3.select('#visualization')
                .append('svg')
                .attr('width', 800)
                .attr('height', 600);

  const margin = {top: 20, right: 30, bottom: 40, left: 40};
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const x = d3.scaleLinear()
              .domain(d3.extent(data, d => d.release_year))
              .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
              .domain([0, 100]) // Adjust as necessary
              .range([height - margin.bottom, margin.top]);

  svg.append('g')
     .attr('transform', `translate(0,${height - margin.bottom})`)
     .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append('g')
     .attr('transform', `translate(${margin.left},0)`)
     .call(d3.axisLeft(y));




  const tooltip = d3.select('body')
                    .append('div')
                    .style('position', 'absolute')
                    .style('visibility', 'hidden')
                    .style('background', '#fff')
  const tooltip = d3.select('body')
                    .append('div')
                    .style('position', 'absolute')
                    .style('visibility', 'hidden')
                    .style('background', '#fff')
                    .style('border', '1px solid #000')
                    .style('padding', '10px');

  svg.selectAll('circle')
     .data(data)
     .enter()
     .append('circle')
     .attr('cx', d => x(d.release_year))
     .attr('cy', d => y(Math.random() * 100)) // Replace with appropriate y-axis value if available
     .attr('r', 3)
     .attr('fill', 'red')
     .on('mouseover', (event, d) => {
       tooltip.html(`Title: ${d.title}<br>Year: ${d.release_year}`)
              .style('visibility', 'visible');
     })
     .on('mousemove', (event) => {
       tooltip.style('top', (event.pageY - 10) + 'px')
              .style('left', (event.pageX + 10) + 'px');
     })
     .on('mouseout', () => {
       tooltip.style('visibility', 'hidden');
     });

  svg.append('text')
     .attr('x', width / 2)
     .attr('y', margin.top)
     .attr('text-anchor', 'middle')
     .attr('font-size', '16px')
     .attr('font-weight', 'bold')
     .text('Explore Netflix Content Over Time');

  svg.append('text')
     .attr('x', width - margin.right)
     .attr('y', height - margin.bottom)
     .attr('text-anchor', 'end')
     .attr('font-size', '12px')
     .text('Source: Netflix');
}             
