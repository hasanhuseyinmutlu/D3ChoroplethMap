// Load the county and education data asynchronously
Promise.all([
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
  ]).then(([countyData, educationData]) => {
    // Constants for SVG dimensions
    const width = 960;
    const height = 600;
  
    // Create SVG container
    const svg = d3.select("#choropleth-map")
      .attr("width", width)
      .attr("height", height);
  
    // Set up color scale
    const colorScale = d3.scaleThreshold()
      .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
      .range(d3.schemeSpectral[9]);
  
    // Bind county data to path elements
    svg.selectAll("path")
      .data(topojson.feature(countyData, countyData.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("d", d3.geoPath())
      .attr("data-fips", d => d.id)
      .attr("data-education", d => {
        const county = educationData.find(c => c.fips === d.id);
        return county ? county.bachelorsOrHigher : 0;
      })
      .attr("fill", d => {
        const county = educationData.find(c => c.fips === d.id);
        return county ? colorScale(county.bachelorsOrHigher) : colorScale(0);
      })
      .on("mouseover", (event, d) => {
        const county = educationData.find(c => c.fips === d.id);
        if (county) {
          const tooltip = document.getElementById("tooltip");
          tooltip.style.display = "block";
          tooltip.style.left = event.pageX + "px";
          tooltip.style.top = event.pageY + "px";
          tooltip.setAttribute("data-education", county.bachelorsOrHigher);
          tooltip.innerHTML = `
            <strong>${county.area_name}, ${county.state}</strong><br>
            Education: ${county.bachelorsOrHigher}%
          `;
        }
      })
      .on("mouseout", () => {
        const tooltip = document.getElementById("tooltip");
        tooltip.style.display = "none";
      });
  
    // Create legend
const legend = d3.select("#legend")
.append("svg")
.attr("width", 300)
.attr("height", 60); // Increased height to accommodate text

const legendScale = d3.scaleLinear()
.domain([2.6, 75.1])
.range([0, 240]);

const legendBlocks = colorScale.range().map(function(d, i) {
d = colorScale.invertExtent(d);
if (d[0] === null) {
  d[0] = legendScale.domain()[0];
}
if (d[1] === null) {
  d[1] = legendScale.domain()[1];
}

// Adjust the first and last extent values
if (i === 0) {
  d[0] = legendScale.domain()[0];
}
if (i === colorScale.range().length - 1) {
  d[1] = legendScale.domain()[1];
}

return d;
});

const legendBlockGroup = legend.selectAll(".legend-block")
.data(legendBlocks)
.enter()
.append("g")
.attr("class", "legend-block")
.attr("transform", (d, i) => `translate(${30 + i * 30}, 0)`);

legendBlockGroup.append("rect")
.attr("x", 0)
.attr("y", 15)
.attr("width", 30)
.attr("height", 15)
.attr("fill", d => colorScale(d[0]));

legendBlockGroup.append("text")
.attr("class", "legend-text")
.attr("x", 0)
.attr("y", 40) // Adjust the y-position of the text
.text(d => `${Math.round((d[0] + d[1]) / 2)}%`);


});
  