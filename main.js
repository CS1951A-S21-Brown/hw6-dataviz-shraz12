const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 70, left: 175};

let region_sales_width = MAX_WIDTH / 2, region_sales_height = 575;
let top_games_width = (MAX_WIDTH / 2) - 10, top_games_height = 250;
let top_publishers_width = (MAX_WIDTH / 2) - 10, top_publishers_height = 275;



/*GENRE SALES GRAPH */

//Handles the event that the dropdown menu is pressed
function genre_sales_handler(){
  let region = document.getElementById("sales_region").value;
  set_genre_sales(region);
}

//Making the region sales graphic
var svg_region_sales = d3.select("#regional_sales")
    .append("svg")
    .attr("width", region_sales_width)
    .attr("height", region_sales_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let y_scale_sales = d3.scaleLinear()
  .range([region_sales_height - margin.top - margin.bottom, 0]);
let y_axis_sales = svg_region_sales.append("g");

let x_scale_sales = d3.scaleBand()
  .range([0, region_sales_width - margin.left - margin.right])
  .padding(0.1);
let x_axis_sales = svg_region_sales.append("g");

let title_region_sales = svg_region_sales.append("text")
    .attr("transform", `translate(${region_sales_width/3},-10)`)
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .attr("font-weight", 700);
let x_axis_text_region_sales = svg_region_sales.append("text")
    .attr("transform", `translate(${region_sales_width/3},${region_sales_height-margin.top - 5})`)
    .style("text-anchor", "middle")
    .style("font-size", 12)
    .attr("font-weight", 700)
    .text("Genre");
let y_axis_text_region_sales = svg_region_sales.append("text")
    .attr("transform", `translate(-40,${(region_sales_height-margin.top)/2}) rotate(-90)`)
    .style("text-anchor", "middle")
    .style("font-size", 12)
    .attr("font-weight", 700)
    .text("Total Sales (Millions of units)");

//Sets the Genre Sales for a given region
function set_genre_sales(region){
  d3.csv("../data/video_games.csv").then(function(data) {
    data = get_genre_sales(data, region);

    x_scale_sales.domain(data.map(function(d){return d['genre'];}))
    y_scale_sales.domain([0,40 +d3.max(data, function(d){return d['sales']})]);

    let translate_x = region_sales_height - margin.top - margin.bottom
    x_axis_sales.attr("transform", `translate(0,${translate_x})`)
      .call(d3.axisBottom(x_scale_sales))
      .selectAll("text")
      .attr("transform", "translate(-10,0) rotate(-45)")
      .style("text-anchor", "end");

    y_axis_sales.transition().duration(1000).call(d3.axisLeft(y_scale_sales));

    switch (region) {
      case 'Global_Sales':
        title_region_sales.text('Video Game Sales by Genre (Global)');
        break;
      case 'NA_Sales':
        title_region_sales.text('Video Game Sales by Genre (North America)');
        break;
      case 'EU_Sales':
        title_region_sales.text('Video Game Sales by Genre (Europe)');
        break;
      case "JP_Sales":
        title_region_sales.text('Video Game Sales by Genre (Japan)');
        break;
      case 'Other_Sales':
        title_region_sales.text('Video Game Sales by Genre (Other Regions)');
        break;
    }

    function color_picker(d){
      if (d['sales'] == d3.max(data, function(d){return d['sales']})){
        return "#e2725a";
      } else{
        return "#4a6274"
      }
    }
    let bars = svg_region_sales.selectAll("rect").data(data);
    bars.enter()
      .append("rect")
      .merge(bars)
      .transition()
      .duration(1000)
      .attr("x", function(d) {return x_scale_sales(d['genre']); })
      .attr("y", function(d) { return  y_scale_sales(d['sales']) ;})
      .attr("width", x_scale_sales.bandwidth())
      .attr("height", function(d) {return  region_sales_height - margin.top - margin.bottom - y_scale_sales(d['sales']);})
      .attr("fill", color_picker)
    bars.exit().remove();
    });
}

//Gets the Genre Sales for a specific region
function get_genre_sales(data, region){
  let genre_sales = {};
   function add_sale(d){
     if (!(d['Genre'] in genre_sales)){
       genre_sales[d['Genre']] = 0;
     }
     genre_sales[d['Genre']] += parseFloat(d[region]);
   }

   data.forEach(add_sale)

   data = [];
   for (key in genre_sales){
     data.push({'genre': key, "sales": genre_sales[key]});
   }
   return data;
}




/*TOP PUBLISHERS GRAPH */

//Handles the event that the dropdown menu is pressed
function top_publishers_handler(){
  let genre = document.getElementById("genre").value;
  set_top_publishers(genre);
}

//Making the top publishers graphic and settin the data
function set_top_publishers(genre){
  d3.csv("../data/video_games.csv").then(function(data) {
    data = get_top_publishers(data, genre);

    d3.select("#top_publishers").select("svg").remove();

    var svg_top_publishers = d3.select("#top_publishers")
      .append("svg")
      .attr("width", top_publishers_width)
      .attr("height", top_publishers_height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //Setting axis names and titles
    let x_axis_text_top_publishers = svg_top_publishers.append("text")
        .attr("transform", `translate(${top_publishers_width/3},${top_publishers_height-margin.top - 35})`)
        .style("text-anchor", "middle")
        .style("font-size", 12)
        .attr("font-weight", 700)
        .text("Total Games Produced");
    let y_axis_text_top_publishers = svg_top_publishers.append("text")
        .attr("transform", `translate(-40,${(top_publishers_height-margin.top)/3}) rotate(-90)`)
        .style("text-anchor", "middle")
        .style("font-size", 12)
        .attr("font-weight", 700)
        .text("Total Sales (Millions of units)");
    let title_top_publishers = svg_top_publishers.append("text")
        .attr("transform", "translate(225,-20)")
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .attr("font-weight", 700);

    if (genre == 'All'){
      title_top_publishers.text('Top Publishers by Sales and Games Produced (All Genres)');
    } else {
      title_top_publishers.text('Top Publishers by Sales and Games Produced (' + genre +')');
    }

    //Formatting the y axis
    let y_scale_publishers = d3.scaleLog()
      .range([top_publishers_height - margin.top - margin.bottom, 0]);
    let y_axis_publishers = svg_top_publishers.append("g");
    y_scale_publishers.domain([d3.min(data, function(d){return d['sales']}),d3.max(data, function(d){return d['sales']})]);
    let y_ticks = [1,2.5,5,10,25,50,100,250,500,1000].filter(num => num < d3.max(data, function(d){return d['sales']}));
    y_axis_publishers.transition().duration(1000).call(d3.axisLeft(y_scale_publishers)
    .tickValues(y_ticks)
    .tickFormat(function(d){ return d;}));

    //Formatting the x axis
    let x_scale_publishers = d3.scaleLog()
      .range([0, top_publishers_width - margin.left - margin.right]);
    let x_axis_publishers = svg_top_publishers.append("g")
      .attr("transform", `translate(0,${top_publishers_height-margin.top-margin.bottom})`);
    x_scale_publishers.domain([5,d3.max(data, function(d){return d['num_games']})])
    let x_ticks = [5,10,25,50,75,100,250,500,750,1000].filter(num => num < d3.max(data, function(d){return d['num_games']}));
    x_axis_publishers.transition().duration(1000).call(d3.axisBottom(x_scale_publishers)
    .tickValues(x_ticks)
    .tickFormat(function(d){ return d;}));



    var tooltip = d3.select("#top_publishers")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("padding", "10px");

    var mouseover = function(d) {
      tooltip.style("opacity", 1)
    }

    var mousemove = function(d) {
      tooltip.html("<u>Publisher</u>:" + d['publisher'] + "<br><u>Games Produced</u>: "
                  + d['num_games'] + "<br><u>Sales</u>: " + d['sales'].toFixed(2) + ' million')
        .style("left", (d3.mouse(this)[0]+90) + "px")
        .style("top", (d3.mouse(this)[1]) + "px")
    }

    var mouseleave = function(d) {
      tooltip.transition()
        .duration(1000)
        .style("opacity", 0)
    }

    let dots = svg_top_publishers.append('g').selectAll("dot").data(data);
    dots.enter()
      .append("circle")
      .attr("cx", function (d) {return x_scale_publishers(d['num_games']);})
      .attr("cy", function (d) {return y_scale_publishers(d['sales']);})
      .attr("r", 7)
      .attr("fill", "#e2725a")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);
  });
}

function get_top_publishers(data, genre){
  function filter_genre(data) {
    return data.filter(function (d){return d['Genre'] == genre;});
  }

  if (genre != 'All'){
    data = filter_genre(data);
  }

  let dict = {};
  function add_vals(d){
    if (!(d['Publisher'] in dict)){
      dict[d['Publisher']] = [0,0];
    }
    dict[d['Publisher']][0] ++;
    dict[d['Publisher']][1] += parseFloat(d['Global_Sales']);
  }
  data.forEach(add_vals);

  data = [];
  for(key in dict){
    data.push({'publisher': key, 'num_games':dict[key][0], 'sales':dict[key][1]});
  }
  data = data.filter(function(d){return d['num_games'] > 10;});

  return data;
}





/*TOP VIDEO GAMES GRAPH */

//Handles the event that the "All time" button is pressed
function top_video_games_handler_all(){
  set_top_games('All');
}

//Handles the event that the "Get top games" button is pressed
function top_video_games_handler_years(){
  let year = document.getElementById("year").value;
  set_top_games(year);
}


//Making the top games graphic
let svg_top_games = d3.select("#top_games")
    .append("svg")
    .attr("width", top_games_width)
    .attr("height", top_games_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let x_scale_top_games = d3.scaleLinear()
    .range([0,top_games_width - margin.left - margin.right]);
let x_axis_top_games = svg_top_games.append("g")
      .attr("transform", `translate(0,${top_games_height - margin.top - margin.bottom})`);

let y_scale_top_games = d3.scaleBand()
    .range([0,top_games_height - margin.top - margin.bottom])
    .padding(0.1);
let y_axis_top_games = svg_top_games.append("g");

svg_top_games.append("text")
    .attr("transform", "translate(225,350)")
    .style("text-anchor", "middle")
    .text("Count");

let x_axis_text_top_games = svg_top_games.append("text")
    .attr("transform", `translate(${top_games_width/3},${top_games_height -margin.top - 30})`)
    .style("text-anchor", "middle")
    .style("font-size", 12)
    .attr("font-weight", 700)
    .text("Global Sales (Millions of units)");

let y_axis_text_top_games = svg_top_games.append("text")
    .attr("transform", `translate(-30,-5)`)
    .style("text-anchor", "middle")
    .style("font-size", 12)
    .attr("font-weight", 700)
    .text("Game");

let title_top_games = svg_top_games.append("text")
    .attr("transform", "translate(225,-10)")
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .attr("font-weight", 700);

//Sets the data for the top year
function set_top_games(year) {
  d3.csv(`../data/video_games.csv`).then(function(data) {
      data = get_top_games(data,year,10);

      x_scale_top_games.domain([0, d3.max(data, function(d){return parseFloat(d['Global_Sales'])})]);
      y_scale_top_games.domain(data.map(function(d){return d['Name'];}));

      x_axis_top_games.transition().duration(1000).call(d3.axisBottom(x_scale_top_games));
      y_axis_top_games.call(d3.axisLeft(y_scale_top_games).tickSize(0).tickPadding(10));

      let bars = svg_top_games.selectAll("rect").data(data);

      let colors = d3.scaleOrdinal()
        .domain(data.map(function(d){return d['Name'];}))
        .range(["#003f5c","#2f4b7c","#665191","#a05195","#d45087","#f95d6a","#ff7c43","#ffa600","#cd6600","#952a00"])

      bars.enter()
          .append("rect")
          .merge(bars)
          .transition()
          .duration(1000)
          .attr("x", x_scale_top_games(0))
          .attr("y", function(d){return y_scale_top_games(d['Name'])})
          .attr("width",  function(d){return x_scale_top_games(parseFloat(d['Global_Sales']))})
          .attr("height", y_scale_top_games.bandwidth())
          .attr("fill", function(d) { return colors(d['Name']) });

      if (year == 'All'){
        title_top_games.text('Top Video Games of All Time (by Sales)');
      } else {
        title_top_games.text('Top Video Games in ' + year + " (by Sales)");
      }


      bars.exit().remove();
    });
}

//Filters and cleans data by year
function get_top_games(data, year, numExamples) {

  if (year != "All") {
    data = data.filter(function (d){return d['Year'] == year});
  }
  data = data.sort(function(a,b){return parseFloat(b['Global_Sales']) -parseFloat(a['Global_Sales'])});

  return data.slice(0,numExamples);
}


//Initial state of the graphs
set_top_games('All')
set_top_publishers("All");
set_genre_sales('Global_Sales')
