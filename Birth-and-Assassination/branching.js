var width = 1000, height = 600;

var tree = d3.layout.tree()

var root = [{}], nodes = [];

nodes = tree(root[0]);

root[0].parent = root[0];
root[0].px = root[0].x;
root[0].py = root[0].y;
root[0].id = [0]

var diagonal = d3.svg.diagonal();

var svg = d3.select("#canvas").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(10,10)");

var borderPath = svg.append("rect")
  .attr("x", -10)
  .attr("y", -10)
  .attr("width", width - 2)
  .attr("height", height - 2)
  .style("stroke", "black")
  .style("fill", "white")
  .style("stroke-width", 2);

var node = {}, link = {};

for(i = 0; i < root.length; i++){
  node[i] = svg.selectAll(".node")
  link[i] = svg.selectAll(".link")
}

var duration, birth_rate, killing_rate
var death_id = []

function recompute(){
  // Recompute the layout and data join.
  for(var i = 0, r_len = root.length; i < r_len; i++){
    node[i] = svg.selectAll(".node"),
    link[i] = svg.selectAll(".link");

    var tree = d3.layout.tree()
                .size([width / 5, height / 5])

    node[i] = node[i].data(tree.nodes(root[i]), function(d) { return d.id; }); 
    link[i] = link[i].data(tree.links(nodes), function(d) { return d.source.id + "-" + d.target.id; });

    // Move trees around when there are more than 1 tree.
    for(var j = 0, n_len = nodes.length; j < n_len; j++){
      var is_descedant = allDeepEqual([nodes[j].id.slice(0, root[i].id.length), root[i].id])
      if(is_descedant){
        nodes[j].x += width / 5 * (i % 5)
        nodes[j].y += height / 4 * Math.floor(i / 5)
      }
    }
  }

  // Add entering nodes in the parent’s old position.
  for(var i = 0, r_len = root.length; i < r_len; i++){
    node[i].enter().append("circle")
        .attr("class", "node")
        .attr("id", function(d) { return d.id; })
        .attr("r", 3.5)
        .attr("cx", function(d) { return d.parent.px; })
        .attr("cy", function(d) { return d.parent.py; })
       
    // Add entering links in the parent’s old position.
    link[i].enter().insert("path", ".node")
        .attr("class", "link")
        .attr("id", function(d) { return d.source.id; })
        .attr("d", function(d) {
          var o = {x: d.source.px, y: d.source.py};
          return diagonal({source: o, target: o});
        });
  }

  // Transition nodes and links to their new positions.
  var t = svg.transition()
      .duration(duration);

  t.selectAll(".link")
      .attr("d", diagonal);

  t.selectAll(".node")
      .attr("cx", function(d) { return d.px = d.x; })
      .attr("cy", function(d) { return d.py = d.y; });
}

// Producing offsprings
function bitrh() {
  var death_index = [];
  var death_root_index = [];
  var len = nodes.length

  // for (var m = 0; m < len; m++) { 
  for (var m = 0; m < len & m < 10; m++) { 
    if (Math.random() < birth_rate / 50) { 
      n = {id: []};
      // Add a new node to a random parent.
      var p_index = Math.random() * nodes.length,
      p = nodes[p_index | 0];

      // // Add a new node to this certain parent.
      // p = nodes[m];

      // add a node to the parent and assign id to the child node
      if (p.children) {
        n.id = flatten([p.id, Object.keys(p.children).length])
        p.children.push(n); 
      }
        
      else{
        n.id = flatten([p.id, 0])
        p.children = [n];
      } 

      // add the new node to the array
      nodes.push(n);

      // recompute the shape of the tree
      recompute()
    }
  }
}

// The killing process
function kill() {
  for (var m = 0, r_len = root.length; m < r_len; m++) { 
    if(Math.random() < killing_rate / 50){  
    
      death_id = root[m].id

      // indentify the index of the root in the array nodes
      for(j = 0; j < nodes.length; j++){
        if(allDeepEqual([nodes[j].id, death_id]))
          death_index = j;
      }
      
      // indentify the index of the root in the array root
      for(j = 0; j < root.length; j++){
        if(allDeepEqual([root[j].id, death_id]))
          death_root_index = j;
      }

      // remove the killed index 
      nodes.splice(death_index, 1)
      root.splice(death_root_index, 1)
      
      // remove the DOM
      svg.selectAll("[id='" + death_id + "']").remove();
    
      // change the root array in order to call 'tree' function on it  
      for(j = nodes.length - 1; j >= 0; j--){
        var is_children = allDeepEqual([nodes[j].id.slice(0, death_id.length), death_id])
        if(is_children & nodes[j].id.length == death_id.length + 1){
          root.splice(death_root_index, 0, nodes[j])
        }
      }

      for(var j = 0, r_len = root.length; j < r_len; j++){
        root[j].parent = root[j];
      }
    }
  }

  // Assertion at the end of the process
  if(nodes.length == 0){
      var warning = "All particles get killed. Please click 'Clear' and start again."
      var text = svg.append("text")
                    .attr("x", 30)
                    .attr("y", 30)
                    .attr("id", "endingText")
                    .text( function (d) { return warning;})
      clearInterval(timer1)
      return clearInterval(timer2);
  }

  if(nodes.length > 1000){
      var warning = "There are more than 1000 particles now. Maximum reached. Please click 'Clear' and start again."
      var text = svg.append("text")
                    .attr("x", 30)
                    .attr("y", 30)
                    .style("fill", "red")
                    .attr("id", "endingText")
                    .text( function (d) { return warning;})
      clearInterval(timer1)
      return clearInterval(timer2);
  }
}

var timer1, timer2

// Start an updating
function start(){
  recompute()
  timer1 = setInterval(bitrh, duration)
  timer2 = setInterval(kill, duration)
}

// Stop an updating
function stop(){
  clearInterval(timer1);
  clearInterval(timer2);
}

// Clear the screen and initialize again
function clearScreen(){
  svg.selectAll(".node").remove();
  svg.selectAll(".link").remove();
  svg.selectAll("#endingText").remove();
  
  root = [{}], nodes = [];

  nodes = tree(root[0]);

  root[0].parent = root[0];
  root[0].px = root[0].x;
  root[0].py = root[0].y;
  root[0].id = [0];

  node = {}, link = {};

  for(i = 0; i < root.length; i++){
    node[i] = svg.selectAll(".node")
    link[i] = svg.selectAll(".link")
  }
  clearInterval(timer1);
  clearInterval(timer2)
}
