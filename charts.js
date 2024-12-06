// Set dimensions and margins
var margin = { top: 50, right: 50, bottom: 50, left: 50 };
var width = 850 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

// Append SVG to the chart container and set styles for centering
var svg = d3.select('#chart1') // 选择特定的图表容器
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var colorScale = d3.scaleQuantize()
    .domain([0, 100])
    .range([
      '#e0c3fc', // 淡紫色
      '#e4c8f0', // 柔和的紫色
      '#f0d49f', // 柔和的米黄色
      '#f6e1a8', // 淡米黄色
      '#fce38a'  // 明亮的米黄色
    ]);

// 添加标题
svg.append("text")
    .attr("x", width / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Heatmap of sleep status versus time of day");

// 添加 X 轴标题
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("X - Date");

// 添加 Y 轴标题
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .text("Y - Time of Day");

// 添加颜色标题
svg.append("text")
    .attr("x", width + 50)
    .attr("y", height / 2)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(90)")
    .text("Color - % Percentage of Sleep per Time Period");

// 加载 CSV 文件并绘制 heatmap
d3.csv('sleep_Data.csv').then(function(data) {
  var squareSize = Math.min(width / data.length, height / (data.columns.slice(1).length));

  var xScale = d3.scaleBand()
    .domain(data.map(d => d.Date))
    .range([0, width])
    .paddingInner(0); // 减少内部填充
  
  var yScale = d3.scaleBand()
    .domain(data.columns.slice(1))
    .range([0, squareSize * data.columns.slice(1).length])
    .paddingInner(0); // 减少内部填充

  // Tooltip
  var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

  var groups = svg.selectAll('.group')
    .data(data)
    .enter().append('g')
    .attr('class', 'group')
    .attr('transform', d => 'translate(' + xScale(d.Date) + ', 0)'); // 设置x轴位置

  groups.each(function(d) {
    var group = d3.select(this);
    
    var rects = group.selectAll('rect')
      .data(data.columns.slice(1).map(key => ({
        key: key,
        value: parseFloat(d[key]), // 确保这是数字类型
        Date: d.Date,
        notes: d.Notes // 保存注释
      })))
      .enter().append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.key))
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', d => {
        // 检查 d.key 是否不等于 "Date" 和不等于 "Notes"
        if (d.key !== "Date" && d.key !== "Notes") {
          return colorScale(d.value); // 如果不是 "Date" 和 "Notes"，则应用颜色映射
        }
        return '#e0c3fc'; // 如果是 "Date" 或 "Notes"，则使用白色填充
      })
      .on("mouseover", function(event, datum) {
        if (datum.key !== "Date" && datum.key !== "Notes"){ 
        // Save the original color
        d3.select(this).attr("data-original-color", d3.select(this).attr("fill"));
        
        // Change color on hover
        d3.select(this).attr("fill", "orange");

        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html("Date: " + datum.Date + "<br>Time: " + datum.key + "<br>Value: " + datum.value + "<br>Note: " + datum.notes)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      }})
      .on("mouseout", function(event, datum) {
        if (datum.key !== "Date" && datum.key !== "Notes"){
        // Revert to the original color
        d3.select(this).attr("fill", d3.select(this).attr("data-original-color"));

        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      }});
});
});