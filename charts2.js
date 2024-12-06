document.addEventListener("DOMContentLoaded", function () {
    const chartContainer = d3.select("#chart2");
    const width = 800;
    const height = 400;

    const svg = chartContainer.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(50, 50)");

    const colors = ["#A29FF9", "#FBC6C2", "#C4A3F0", "#FAD9D4", "#D7B7F3"];
    const color = d3.scaleOrdinal()
        .domain(colors)
        .range(colors);

    d3.csv("Sleep_Data.csv").then(data => {
        console.log("Raw Data:", data);

        // 标签统计字典
        const tagStats = {};

        data.forEach(row => {
            const notes = row["Notes"] ? row["Notes"].split(",") : []; // 分割标签
            let totalSleep = 0;

            // 计算每行的睡眠总时长
            Object.keys(row).forEach(key => {
                if (key.includes(":") && !isNaN(row[key])) {
                    totalSleep += parseFloat(row[key]);
                }
            });

            // 统计标签数据
            notes.forEach(tag => {
                if (!tagStats[tag]) {
                    tagStats[tag] = { totalSleep: 0, count: 0 };
                }
                tagStats[tag].totalSleep += totalSleep;
                tagStats[tag].count++;
            });
        });

        // 准备柱状图数据
        const chartData = Object.entries(tagStats).map(([key, value]) => ({
            tag: key,
            avgSleep: value.totalSleep / value.count
        }));

        // 定义 X 和 Y 轴
        const x = d3.scaleBand()
            .domain(chartData.map(d => d.tag))
            .range([0, width - 100])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.avgSleep)])
            .nice()
            .range([height - 100, 0]);

        // 添加 X 轴
        svg.append("g")
            .attr("transform", `translate(0, ${height - 100})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // 添加 Y 轴
        svg.append("g")
            .call(d3.axisLeft(y));

        // 绘制柱状图
        svg.selectAll(".bar")
            .data(chartData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.tag))
            .attr("y", d => y(d.avgSleep))
            .attr("width", x.bandwidth())
            .attr("height", d => height - 100 - y(d.avgSleep))
            .attr("fill", (d, i) => colors[i % colors.length]);

        // 添加标签显示平均睡眠时长
        svg.selectAll(".label")
            .data(chartData)
            .enter()
            .append("text")
            .attr("x", d => x(d.tag) + x.bandwidth() / 2)
            .attr("y", d => y(d.avgSleep) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#333") // 设置文字颜色
            .text(d => d.avgSleep.toFixed(2));
    }).catch(error => {
        console.error("Error loading or processing data:", error);
    });
});
