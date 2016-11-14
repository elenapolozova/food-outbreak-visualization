// known bugfixes to implement:
// currently prior pmf not showing up when should? unclear. not a priority though
// make source toggle move
// make whole visual move
// finish play button functionality

var grid;

var isSmallRun = true;

// small test files
var adjMatFile_t = 'testSmallNetwork.csv';
var varElimTBFile_t = 'testSmallIterationsOutput.csv';
var nodesContam_t = 'testSmallNodesContamInEachIteration.csv';
var stageInfo_t = 'testSmallStageInfo.csv';
var parentInfo_t = 'testSmallParents.csv';

var regNet1FlowsFile = 'regNetwork1Flows2.csv';
var regNet1LocsFile = 'regNetwork1locs2.csv';
var regNet1OutbreakFile = 'regNet1Outbreak2.csv';
var regNet1PMFFile = 'reg1NetPriorPMF.csv';
var pmfOverTimeFile = 'regNet1PMFOverTime2.csv'
var regNet1PriorPMFFile = 'regNet1PriorPMF2.csv'

var regNet1FlowsFile2 = 'regNetwork1flows.csv';
var regNet1LocsFile2 = 'regNetwork1locs.csv';
var regNet1OutbreakFile2 = 'regNet1Outbreak.csv';
var regNet1PMFFile2 = 'reg1NetPriorPMF.csv';
var pmfOverTimeFile2 = 'regNet1PMFOverTime.csv';
var regNet1PriorPMFFile2 = 'reg1NetPriorPMF.csv';

//var regNet1FlowsFile = 'regNetBigAdjList.csv';
//var regNet1LocsFile = 'regNetBigLocs.csv';

// variables to hold the information that's currently onscreen ("explore" network)
var expAdjMat;
var expTBResults; 
var expNodesContam;
var expStageInfo;
var expParentInfo;
// "watch" first network
var reg1FlowsMat;
var reg1Locs;
var reg1ContamReports;
var regNet1PMF;
var watch1Nodes;
var watch1numNodes;
var regNet1PriorPMF;

var reg1FlowsMat2;
var reg1Locs2;
var reg1ContamReports2;
var regNet1PMF2;
var watch2Nodes;
var watch2numNodes;
var regNet1PriorPMF2;
var pmfOverTime2;

var expNodes;
var expNumNodes;

// variables for convenience data structures generated as the program runs
var numNodes;
var locs;

// default colors for things
var unselectedNodeColor;
var stage4SelectedColors = []; // will hold array of colors
var baseNodeColor;
var HLcolor;
var greenGradient = []; // more intense = first
var lighterGreenGradient = [];
var contamColor;
var sourceColor;

// interactivity
var nodes = [];
var emphNodeInds = [];
var currentScreen;
var buttons = [];

// GUI settings
var networkWidth = 610;
var networkHeight = 420;
var networkXOffset = 105;
var networkYOffset = 155;

var hoveredInLastFrame;
var farmLookedAtInLastFrame;
var sOutbreakFrame;
var dOutbreakFrame;

var sourceToggleButton;
var playButton;
var dPmfGraph;
var sPmfGraph;
var currentPMF;
var screenPMFOverTime;

function setup() {
  createCanvas(1275, 650); // size subject to change
  currentScreen = "intro"; // default, bring people to the connectivity screen
  hoveredInLastFrame = false;
  farmLookedAtInLastFrame = -1;
  
  //colors
  unselectedNodeColor = color(153, 204, 204);
  stage4SelectedColors = [color(201, 150, 200), color(223, 101, 176), 
      color(231, 41, 138), color(206, 18, 86)];
  baseNodeColor = color(153, 204, 204);
  HLcolor = color(223, 101, 176);
  hoverColor = color(201, 150, 200);
  contamColor = color(255, 94, 61);
  sourceColor = color(205, 50, 255);
  //greenGradient = [color(49, 163, 84, 100), color(116, 196, 118, 100), color(161, 217, 155, 100), color(199, 233, 192, 100)];
  //greenGradient = [color(0, 109, 44), color(49, 163, 84, 100), color(116, 196, 118, 100), color(186, 228, 179, 100), color(199, 233, 192, 100)];
  //greenGradient = [color(2, 201, 2, 150), color(22, 226, 133, 100), color(21, 220, 192, 100), color(29, 167, 220, 100)];
  greenGradient = [color(10, 129, 44), color(49, 163, 84, 180), color(100, 196, 118, 120), color(29, 167, 220, 70)];
  //lighterGreenGradient = [color(0, 109, 44, 50), color(49, 163, 84, 50), color(100, 196, 118, 30), color(29, 167, 220, 10)];
  //lighterGreenGradient = [color(60, 200), color(120, 150), color(200, 100), color(220, 50)];
  lighterGreenGradient = [color(220, 100), color(220, 100), color(220, 100), color(220, 100)];
  // convert everything from tables to arrays, easier to deal
  expAdjMat = expAdjMat.getArray();
  expTBResults = expTBResults.getArray();
  expNodesContam = expNodesContam.getArray();
  expStageInfo = expStageInfo.getArray();
  expParentInfo = expParentInfo.getArray();
  reg1FlowsMat = reg1FlowsMat.getArray();
  reg1Locs = reg1Locs.getArray();
  reg1ContamReports = reg1ContamReports.getArray();
  regNet1PMF = regNet1PMF.getArray();
  pmfOverTime = pmfOverTime.getArray();
  regNet1PriorPMF = regNet1PriorPMF.getArray();
  reg1FlowsMat2 = reg1FlowsMat2.getArray();
  reg1Locs2 = reg1Locs2.getArray();
  reg1ContamReports2 = reg1ContamReports2.getArray();
  regNet1PriorPMF2 = regNet1PriorPMF2.getArray();
  pmfOverTime2 = pmfOverTime2.getArray();
  
  lastStage = expStageInfo[expStageInfo.length - 1];
  expNumNodes = parseInt(lastStage[lastStage.length - 1]);
  
  locs = assignNodeLocations(595, 460, 115, 95);
  expNodes = Array(expNumNodes);
  watch1Nodes = Array(1151); // number of nodes in watch1 network
  watch1numNodes = 1151;
  watch2Nodes = Array(1151);
  watch2numNodes = 1151;
  // create array of node objects

  // Fill out explore graph
  // should really just do the int parsing to the matrices themselves but #roughsketch
  for (n = 0; n < expNumNodes; n++){
    outgoingEdgesTo = [];
    for (m = 0; m < expAdjMat.length; m++){ // add nonzero edge ends to here
      if (parseFloat(expAdjMat[n][m])!==0){outgoingEdgesTo.push(m);}
    }

    // fill out edgeEnds;
    edgeEndLocs = Array(2);
    edgeEndLocs[0] = Array(outgoingEdgesTo.length);
    edgeEndLocs[1] = Array(outgoingEdgesTo.length);
    for (i = 0; i < outgoingEdgesTo.length; i++){
      edgeEndLocs[0][i] = locs[0][outgoingEdgesTo[i]];
      edgeEndLocs[1][i] = locs[1][outgoingEdgesTo[i]];
    }
    nodeColor = greenGradient[3];
    deEmphCol = lighterGreenGradient[3];
    if (n < 30){
      nodeColor = greenGradient[2];
      deEmphCol = lighterGreenGradient[2];
      if (n < 20){
        nodeColor = greenGradient[1];
        deEmphCol = lighterGreenGradient[1];
        if (n < 10){
          nodeColor = greenGradient[0];
          deEmphCol = lighterGreenGradient[0];
        } // end if
      } // end if
    } // end if
    
    expNodes[n] = new ExpNode(n+1,locs[0][n], locs[1][n], 15, 15, outgoingEdgesTo, edgeEndLocs, nodeColor, deEmphCol, false);
    
    
  } // end for that fills out "explore" graph
  
  // add grid
    grid = new Grid(36, // px, top margin
    36, // px, bottom margin
    40, // px, left margin
    40, // px, right margin
    8, // # columns
    12, // px, gutter width
    20 // # rows
    );
  
  // FILL OUT WATCH1 GRAPH
  for (n = 0; n < watch1numNodes; n++){
    outgoingEdgesTo = [];
    for (m = 0; m < reg1FlowsMat.length; m++){ // add nonzero edge ends to here
      if (parseFloat(reg1FlowsMat[n][m])!==0){outgoingEdgesTo.push(parseFloat(m));}
    }

    // fill out edgeEnds;
    edgeEndLocs = Array(2);
    edgeEndLocs[0] = Array(outgoingEdgesTo.length);
    edgeEndLocs[1] = Array(outgoingEdgesTo.length);
    for (i = 0; i < outgoingEdgesTo.length; i++){
      edgeEndLocs[0][i] = map(reg1Locs[outgoingEdgesTo[i]][0], 0, 2500, 0, networkWidth) + networkXOffset;
      edgeEndLocs[1][i] = map(reg1Locs[outgoingEdgesTo[i]][1], 0, 1250, networkHeight, 0) + networkYOffset;
    }
    nodeMappedX = map(reg1Locs[n][0], 0, 2500, 0, networkWidth) + networkXOffset;
    nodeMappedY = map(reg1Locs[n][1], 0, 1250, networkHeight, 0) + networkYOffset;
    nodeColor = greenGradient[3];
    if (n < 518){
      nodeColor = greenGradient[2];
      if (n < 138){
        nodeColor = greenGradient[1];
        if (n < 100){
          nodeColor = greenGradient[0];
        } // end if
      } // end if
    } // end if
  
    //watch1Nodes[n] = new Node(n+1, nodeMappedX, nodeMappedY, 5, 5, outgoingEdgesTo, edgeEndLocs, nodeColor, true);
    watch1Nodes[n] = new ExpNode(n+1, nodeMappedX, nodeMappedY, 5, 5, outgoingEdgesTo, edgeEndLocs, nodeColor,color(220, 50), true)  
  }
    // FILL OUT WATCH2 GRAPH
  for (n = 0; n < watch2numNodes; n++){
    outgoingEdgesTo = [];
    for (m = 0; m < reg1FlowsMat2.length; m++){ // add nonzero edge ends to here
      if (parseFloat(reg1FlowsMat2[n][m])!==0){outgoingEdgesTo.push(parseFloat(m));}
    }

    // fill out edgeEnds;
    edgeEndLocs = Array(2);
    edgeEndLocs[0] = Array(outgoingEdgesTo.length);
    edgeEndLocs[1] = Array(outgoingEdgesTo.length);
    for (i = 0; i < outgoingEdgesTo.length; i++){
      edgeEndLocs[0][i] = map(reg1Locs2[outgoingEdgesTo[i]][0], 0, 2500, 0, networkWidth) + networkXOffset;
      edgeEndLocs[1][i] = map(reg1Locs2[outgoingEdgesTo[i]][1], 0, 1250, networkHeight, 0) + networkYOffset;
    }
    nodeMappedX = map(reg1Locs2[n][0], 0, 2500, 0, networkWidth) + networkXOffset;
    nodeMappedY = map(reg1Locs2[n][1], 0, 1250, networkHeight, 0) + networkYOffset;
    nodeColor = greenGradient[3];
    if (n < 518){
      nodeColor = greenGradient[2];
      if (n < 138){
        nodeColor = greenGradient[1];
        if (n < 100){
          nodeColor = greenGradient[0];
        } // end if
      } // end if
    } // end if
    
    //watch1Nodes[n] = new Node(n+1, nodeMappedX, nodeMappedY, 5, 5, outgoingEdgesTo, edgeEndLocs, nodeColor, true);
    watch2Nodes[n] = new ExpNode(n+1, nodeMappedX, nodeMappedY, 5, 5, outgoingEdgesTo, edgeEndLocs, nodeColor,color(220, 100), true);
  }
  
  // manage buttons
  
  var scootLeft = 30;
  
  bbox0 = openSansBold.textBounds("intro", 794 - scootLeft, 162, 12);
  var introButton = new LabeledButton("intro", 794- scootLeft, 162, bbox0.w + 8, 20, 200, greenGradient[1]);
  buttons.push(introButton);
  bbox1 = openSansBold.textBounds("structure", 794 - scootLeft, 162, 12);
  var exploreButton = new LabeledButton("structure", 794 + bbox0.w + 20 - scootLeft, 162, bbox1.w + 8, 20, 200, greenGradient[1]);
  buttons.push(exploreButton);
  bbox2 = openSansBold.textBounds("dense outbreak", 794 + bbox0.w + bbox1.w + 40 - scootLeft, 162, 12);
  var watchButton = new LabeledButton("dense outbreak", 794 + bbox0.w +bbox1.w + 40 - scootLeft, 162, bbox2.w + 8, 20, 200, greenGradient[1]);
  buttons.push(watchButton);
  bbox3 = openSansBold.textBounds("sparse outbreak", 794 + bbox0.w + bbox1.w + bbox2.w + 60 - scootLeft, 162, 12);
  var sparseButton = new LabeledButton("sparse outbreak", 794 + bbox0.w +bbox1.w + bbox2.w + 60 - scootLeft, 162, bbox3.w + 8, 20, 200, greenGradient[1]);
  buttons.push(sparseButton);
}

function draw() {
  background(255);
  frameRate(5);
 // grid.display();
  // always display the interface
  for (b = 0; b < buttons.length; b++){
    buttons[b].display();
  }
  
  if (currentScreen == "intro"){ // just put a greyed-out network w intro text
    nodes = watch1Nodes;
    numNodes = watch1numNodes;
    sOutbreakFrame = -1;
    dOutbreakFrame = -1;

    for (b = 0; b < buttons.length; b++){
      if (buttons[b].label !== "intro"){buttons[b].deselect();}
      else {buttons[b].select()}
    }
    
    for (n = 0; n < watch1numNodes; n++){
      watch1Nodes[n].deEmph();
    } // end for
    
    for(reportInd = 0; reportInd < reg1ContamReports.length; reportInd++){
      nodes[reg1ContamReports[reportInd][0]-1].contaminate();
    }
    
    for (n = 0; n < watch1numNodes; n++){
      watch1Nodes[n].display();
    } // end for
          
    
    push();
    noStroke();
    fill(75);
    textFont(openSansReg);
    //textFont(crimson);
    textSize(13);
    textAlign(CENTER,TOP);
    moveDown = 38;
    text("Outbreaks of foodborne illnesses\nregularly strike the USA, damaging\n both the economy and public health.", 415, 184);
    text("Current investigative methods are slow\nand resource-intensive: most outbreaks\nare never traced back to a source.", 415, 270);
    text("But taking advantage of modern \ndata and analytics can help.", 415, 318+moveDown);
    textAlign(LEFT, TOP);
    textFont(openSansItalic);
    shiftDown = 442-396-7-16;
    text("Click through", 282, 422)
    textFont(openSansReg);
    text("to see how new research lets us", 360, 422);
    text("a) identify outbreak origins more quickly\nb) better prioritize our response efforts.", 293, 438);
    pop();
  }
  
  if (currentScreen == "dense outbreak"){
    sOutbreakFrame = -1; // reset the sparse outbreak, if one was underway
    nodes = watch1Nodes;
    numNodes = watch1numNodes;
    screenPMFOverTime = pmfOverTime;
    screenPriorPMF = regNet1PriorPMF;
    for (b = 0; b < buttons.length; b++){
      if (buttons[b].label !== "dense outbreak"){buttons[b].deselect();}
      else {buttons[b].select()}
    }
    //playButton = new PlayPauseButton(1020, 204, 15, 15, 200, contamColor); // uncomm
    playButton.display(); // uncomm
    
    if (dOutbreakFrame < 0){ // initialize
      dOutbreakFrame = 0;
      for (retailer = 0; retailer < 1151; retailer++){
        nodes[retailer].reEmph();
      }
      dPmfGraph = new PMF(783, 440, 380, 120);
    } 
    var daysSoFar = dOutbreakFrame / 5;
    reportInd = 0;
    reportFrequencies = zeros(633);
    
    var distinctContamNodes = [];
    
    // this is inefficient but I think I have to do it, so the USA doesn't bleed into oblivion
    for (retailer = 518; retailer < 1151; retailer++){
      nodes[retailer].clearContam();
    }
    
    while(reportInd < reg1ContamReports.length && reg1ContamReports[reportInd][1] < daysSoFar){
      nodes[reg1ContamReports[reportInd][0]-1].addContamReport();
      if (!contains(distinctContamNodes, reg1ContamReports[reportInd][0])){
        distinctContamNodes.push(reg1ContamReports[reportInd][0]);
      }
      reportInd = reportInd + 1;
    }
    
    if (reportInd > 0){ // only do pmf if outbreak has started
//    print("OPTION ONE")
      currentPMF = screenPMFOverTime[reportInd - 1];
//     print(currentPMF.length)
//      print(currentPMF[1].length)
      for (farm = 0; farm < 100; farm++){
        nodes[farm].setPMF(parseFloat(currentPMF[farm]));
      }
    }
    else {
      currentPMF = screenPriorPMF;
//      print(currentPMF.length)
//      print(currentPMF[0].length)
      //print(screenPriorPMF)
   //   print("OPTION TWO")
      for (farm = 0; farm < 100; farm++){
        //print(farm)
        //print(screenPriorPMF[0][farm])
        //print(parseFloat(screenPriorPMF[0][farm]))
        nodes[farm].setPMF(parseFloat(currentPMF[0][farm]));
      }
    }
    dPmfGraph.display();
    
    for (n = 0; n < watch1numNodes; n++){
      watch1Nodes[n].display();
    } // end for
    
    //create key
    push();
    noFill();
    textSize(12);
    textFont(openSansReg);
    textAlign(LEFT, CENTER);
    stroke(greenGradient[0]);
    fill(greenGradient[0]);
    ellipse(100, 470, 5, 5)
    noStroke();
    text("100 Farmers", 110, 470)
    stroke(greenGradient[1]);
    fill(greenGradient[1]);
    ellipse(100, 490, 5, 5);
    noStroke();
    text("38 Processors", 110, 490)
    stroke(greenGradient[2]);
    fill(greenGradient[2])
    ellipse(100, 510, 5, 5)
    noStroke();
    text("380 Distributors", 110, 510)
    stroke(greenGradient[3]);
    fill(greenGradient[3])
    ellipse(100, 530, 5, 5)
    noStroke();
    text("633 Retailers", 110, 530)
    stroke(contamColor);
    fill(contamColor)
    ellipse(100, 550, 5, 5)
    noStroke();
    text(distinctContamNodes.length + " Contaminated Retailers", 110, 550)
    text("(" + reportInd + " cases)", 110, 562)
    fill(0)
    var digitsToLeft = 1;
    if (daysSoFar >= 10){digitsToLeft = 2;}
    text(nf(daysSoFar, digitsToLeft, 1) + " days since initial contamination", 110, 582);
    pop();
    
    push();
    noStroke()
    textSize(17.5);
    //textFont(robotoSlab);
    textFont(crimson)
    fill(75);
    textAlign(LEFT, TOP);
    text("Simulating a Tomato Network", 783, 198);
    textFont(openSansReg)
    fill(0)
    textSize(12);
    text("Outbreak investigators must contend with a reality of \nlimited access to data, due to the complexity of the food \nsupply and the absence of comprehensive distribution \nrecords. As a result, to test our traceback algorithms \nwe had to simulate both the networks and the outbreak \nevents on the networks based on the little data\nthat was available. ", 794, 220);
    text("Above: output from a graph-theoretic traceback algorithm \nevaluated over the set of contaminated nodes after each \nadditional report. Note that the algorithm converges long \nbefore the outbreak has ended.", 794, 480);
    textFont(openSansItalic);
    text("Use left, right arrow keys\n to select a farm.", 1098, 326)
    text("Up arrow key to reset.", 1098, 338+16)
    pop();
    
    textAlign(LEFT, TOP);
    //tgBounds = openSansBold.textBounds("toggle show real source", 885, 405);
    //sourceToggleButton = new LabeledButton("toggle show real source", 794, 571, tgBounds.w+8, tgBounds.h+4, 200);
    //sourceToggleButton.display();
    
    // do hover effects
  hovering = false;
  for (n = 0; n < watch1numNodes; n++){
    if (watch1Nodes[n].containsCursor()){
      hovering = true;
      if (!hoveredInLastFrame){ // only update if need to
        for (m = 0; m < watch1numNodes; m++){
          watch1Nodes[m].deEmph();
        }
        watch1Nodes[n].hoverEmph();
      }// end if
    }
  } // end for
  if (dPmfGraph.cursorOver() > -1){
    hovering = true;
    if (farmLookedAtInLastFrame != dPmfGraph.cursorOver()){ // only update if need to
        for (m = 0; m < watch1numNodes; m++){
          watch1Nodes[m].deEmph();
        }
        watch1Nodes[dPmfGraph.cursorOver()].hoverEmph();
    }// end if
  }
  // if we deselected, reemphasize entire graph
  if (!hovering && hoveredInLastFrame){
    for (n = 0; n < watch1numNodes; n++){
      watch1Nodes[n].reEmph();
    } // end for
  } // end if
  hoveredInLastFrame = hovering; // end hover effects
    
    //print(playButton.isPlaying)
    if (reportInd < reg1ContamReports.length && playButton.isPlaying){
      dOutbreakFrame = dOutbreakFrame + 1;
    }
    
  } // end outbreak screen 
  
  
  if (currentScreen == "sparse outbreak"){
    dOutbreakFrame = -1;
    nodes = watch2Nodes;
    numNodes = watch2numNodes;
    screenPMFOverTime = pmfOverTime2;
    screenPriorPMF = regNet1PriorPMF2;
    for (b = 0; b < buttons.length; b++){
      if (buttons[b].label !== "sparse outbreak"){buttons[b].deselect();}
      else {buttons[b].select()}
    }
    
    if (sOutbreakFrame < 0){ // initialize
      sOutbreakFrame = 0;
      for (retailer = 0; retailer < 1151; retailer++){
        nodes[retailer].reEmph();
      }
      sPmfGraph = new PMF(783, 440, 380, 120);
    } 
    var daysSoFar = sOutbreakFrame / 5;
    reportInd = 0;
    reportFrequencies = zeros(633);
    
    var distinctContamNodes = [];
    
    // this is inefficient but I think I have to do it, so the USA doesn't bleed into oblivion
    for (retailer = 518; retailer < 1151; retailer++){
      nodes[retailer].clearContam();
    }
    
    while(reportInd < reg1ContamReports2.length && reg1ContamReports2[reportInd][1] < daysSoFar){
      nodes[reg1ContamReports2[reportInd][0]-1].addContamReport();
      if (!contains(distinctContamNodes, reg1ContamReports2[reportInd][0])){
        distinctContamNodes.push(reg1ContamReports2[reportInd][0]);
      }
      reportInd = reportInd + 1;
    }
    
    if (reportInd > 0){ // only do pmf if outbreak has started
//    print("OPTION ONE")
      currentPMF = screenPMFOverTime[reportInd - 1];
//     print(currentPMF.length)
//      print(currentPMF[1].length)
      for (farm = 0; farm < 100; farm++){
        nodes[farm].setPMF(parseFloat(currentPMF[farm]));
      }
    }
    else {
      currentPMF = screenPriorPMF;
//      print(currentPMF.length)
//      print(currentPMF[0].length)
      //print(screenPriorPMF)
   //   print("OPTION TWO")
      for (farm = 0; farm < 100; farm++){
        //print(farm)
        //print(screenPriorPMF[0][farm])
        //print(parseFloat(screenPriorPMF[0][farm]))
        nodes[farm].setPMF(parseFloat(currentPMF[0][farm]));
      }
    }
    sPmfGraph.display();
    
    for (n = 0; n < watch2numNodes; n++){
      watch2Nodes[n].display();
    } // end for
    
    // do hover effects
  hovering = false;
  for (n = 0; n < watch2numNodes; n++){
    if (watch2Nodes[n].containsCursor()){
      hovering = true;
      if (!hoveredInLastFrame){ // only update if need to
        for (m = 0; m < watch2numNodes; m++){
          watch2Nodes[m].deEmph();
        }
        watch2Nodes[n].hoverEmph();
      }// end if
    }
  } // end for
  if (sPmfGraph.cursorOver() > -1){
    hovering = true;
    if (farmLookedAtInLastFrame != sPmfGraph.cursorOver()){ // only update if need to
        for (m = 0; m < watch2numNodes; m++){
          watch2Nodes[m].deEmph();
        }
        watch2Nodes[sPmfGraph.cursorOver()].hoverEmph();
    }// end if
  }
  // if we deselected, reemphasize entire graph
  if (!hovering && hoveredInLastFrame){
    for (n = 0; n < watch2numNodes; n++){
      watch2Nodes[n].reEmph();
    } // end for
  } // end if
  hoveredInLastFrame = hovering; // end hover effects
    
    
    
    //create key
    push();
    noFill();
    textSize(12);
    textFont(openSansReg);
    textAlign(LEFT, CENTER);
    stroke(greenGradient[0]);
    fill(greenGradient[0]);
    ellipse(100, 470, 5, 5)
    noStroke();
    text("100 Farmers", 110, 470)
    stroke(greenGradient[1]);
    fill(greenGradient[1]);
    ellipse(100, 490, 5, 5);
    noStroke();
    text("38 Processors", 110, 490)
    stroke(greenGradient[2]);
    fill(greenGradient[2])
    ellipse(100, 510, 5, 5)
    noStroke();
    text("380 Distributors", 110, 510)
    stroke(greenGradient[3]);
    fill(greenGradient[3])
    ellipse(100, 530, 5, 5)
    noStroke();
    text("633 Retailers", 110, 530)
    stroke(contamColor);
    fill(contamColor)
    ellipse(100, 550, 5, 5)
    noStroke();
    text(distinctContamNodes.length + " Contaminated Retailers", 110, 550)
    text("(" + reportInd + " cases)", 110, 562)
    fill(0)
    var digitsToLeft = 1;
    if (daysSoFar >= 10){digitsToLeft = 2;}
    text(nf(daysSoFar, digitsToLeft, 1) + " days since initial contamination", 110, 582);
    pop();
    
    push();
    noStroke()
    textSize(17.5);
    //textFont(robotoSlab);
    textFont(crimson)
    fill(100);
    textAlign(LEFT, TOP);
    text("Simulating a Tomato Network", 783, 198);
    //playButton = new PlayPauseButton(1020, 204, 15, 15, 200, contamColor); // uncomm
    playButton.display(); // uncomm
    textFont(openSansReg)
    fill(0)
    textSize(12);
    text("Outbreak investigators must contend with a reality of \nlimited access to data, due to the complexity of the food \nsupply and the absence of comprehensive distribution \nrecords. As a result, to test our traceback algorithms \nwe had to simulate both the networks and the outbreak \nevents on the networks based on the little data\nthat was available. ", 794, 220);
    text("Above: output from the same traceback algorithm \nrun on the dense network. Note that it converges to \nthe correct source far faster, after only two reports.", 794, 480);
    textFont(openSansItalic);
    text("Use left, right arrow keys\n to select a farm.", 1098, 326)
    text("Up arrow key to reset.", 1098, 338+16)
    pop();
    
    textAlign(LEFT, TOP);
    //tgBounds = openSansBold.textBounds("toggle show real source", 885, 405);
    //sourceToggleButton = new LabeledButton("toggle show real source", 794, 571, tgBounds.w+8, tgBounds.h+4, 200);
    //sourceToggleButton.display();
    
    if (reportInd < reg1ContamReports.length && playButton.isPlaying){
      sOutbreakFrame = sOutbreakFrame + 1;
    }
    
  } // end outbreak screen 

  
  // draw the structure screen
  if (currentScreen === "structure"){
    for (b = 0; b < buttons.length; b++){
      if (buttons[b].label !== "structure"){buttons[b].deselect();}
      else {buttons[b].select()}
    }
    sOutbreakFrame = -1;
    dOutbreakFrame = -1;
  // this will be redrawing each node each time which is not gr8, but #roughsketch
  nodes = expNodes;
  numNodes = expNumNodes;
  // do hover effects
  hovering = false;
  for (n = 0; n < numNodes; n++){
    if (nodes[n].containsCursor()){
      hovering = true;
      if (!hoveredInLastFrame){ // only update if need to
        for (m = 0; m < numNodes; m++){
          nodes[m].deEmph();
        }
        nodes[n].hoverEmph();
      }// end if
    }
  } // end for
  // if we deselected, reemphasize entire graph
  if (!hovering && hoveredInLastFrame){
    for (n = 0; n < numNodes; n++){
      nodes[n].reEmph();
    } // end for
  } // end if
  hoveredInLastFrame = hovering;
  // show all nodes now
  for (n = 0; n < numNodes; n++){
    nodes[n].display();
  } // end for
  
  // formatting text
  noStroke();
  fill(0);
  push();
  textAlign(CENTER, CENTER);
  textFont(openSansReg);
  text("Hover over a node to see its ancestors and descendants. ", 410, 590);
  textAlign(LEFT, TOP);
  text("The majority of food supply chains in the USA can be\nmodeled with a simple 'layered' network structure. In\nparticular, our traceback algorithm focuses on networks\nwith four layers, though it can be generalized to more.\nEach edge in the network represents a trade relationship.",794, 205);
  textFont(openSansBold);
  fill(greenGradient[0]);
  text("Farmers", 794, 287+12);
  textFont(openSansReg);
  fill(0);
  text("grow the produce in the first stage. They then", 849, 287+12);
  text("send it to", 794, 287+16+12)
  textFont(openSansBold);
  fill(greenGradient[1]);
  text("Processors", 794, 319+32-6+12);
  textFont(openSansReg);
  fill(0);
  text("who perform tasks such as washing and", 863, 319+32-6+12)
  text("packaging. The food is then shipped by truck to ", 794, 335+32-6+12);
  textFont(openSansBold);
  fill(greenGradient[2]);
  text("Distributors", 794, 377+32-6+12);
  textFont(openSansReg);
  fill(0);
  text(" (/warehouses) who store it until it is ready", 870, 377+32-6+12)
  text("for dissemination to", 794, 377+48-6+12)
  textFont(openSansBold);
  fill(greenGradient[3]);
  text("Retailers:", 794, 435+32-4+12)
  textFont(openSansReg);
  fill(0);
  text("any establishment, large or small, where produce", 855, 435+32-4+12);
  text("is typically bought. A customer then purchases the food,\nand if it's contaminated, their symptom onset time is \nsubject to an uncertainty based on when they bought it, the \nincubation time, the storage conditions, etc.", 794, 451+32-6+12)
  pop();
  

  
  } // end "explore" screen code
  
  // draw title always
  push();
  noStroke();
  //textFont(robotoSlab);
  textFont(crimson);
  textSize(32);
  textAlign(LEFT, TOP);
  fill(0)
  var moveUpBy = 63;
  var deIndent = 20;
  text("Contamination Outbreaks", 783 - deIndent, 135-moveUpBy)
  text("in Food Supply Chain Networks", 783 - deIndent, 170-moveUpBy)
  pop();
  
  
}


// take in data from all the files
function preload() {
  robotoSlab = loadFont("assets/RobotoSlab-Regular.ttf"); // imported for no reason, left to be safe
  //PTSerif = robotoSlab = loadFont("assets/PT_Serif-Web-Regular.ttf");
  crimson = loadFont("assets/CrimsonText-Roman.ttf")
  loraReg = loadFont("assets/Lora-Regular.ttf");
  loraBold = loadFont("assets/Lora-Bold.ttf");
  openSansReg = loadFont("assets/OpenSans-Regular.ttf");
  openSansItalic = loadFont("assets/OpenSans-Italic.ttf");
  openSansBold = loadFont("assets/OpenSans-Bold.ttf");
  if (isSmallRun){ // if we're testing on small data, run with only small data
  expAdjMat = loadTable(adjMatFile_t, 'csv');
  expTBResults = loadTable(varElimTBFile_t, 'csv');
  expNodesContam = loadTable(nodesContam_t, 'csv');
  expStageInfo = loadTable(stageInfo_t, 'csv');
  expParentInfo = loadTable(parentInfo_t, 'csv');
  reg1FlowsMat = loadTable(regNet1FlowsFile, 'csv');
  reg1Locs = loadTable(regNet1LocsFile, 'csv');
  reg1ContamReports = loadTable(regNet1OutbreakFile, 'csv');
  regNet1PMF = loadTable(regNet1PMFFile, 'csv');
  pmfOverTime = loadTable(pmfOverTimeFile, 'csv');
  regNet1PriorPMF = loadTable(regNet1PriorPMFFile, 'csv');
  
  reg1FlowsMat2 = loadTable(regNet1FlowsFile2, 'csv');
  reg1Locs2 = loadTable(regNet1LocsFile2, 'csv');
  reg1ContamReports2 = loadTable(regNet1OutbreakFile2, 'csv');
  regNet1PMF2 = loadTable(regNet1PMFFile2, 'csv');
  pmfOverTime2 = loadTable(pmfOverTimeFile2, 'csv');
  regNet1PriorPMF2 = loadTable(regNet1PriorPMFFile2, 'csv');
  //var dispNodesContam;
  //var dispStageInfo;
  //  loadJSON(url, loadCallback, 'jsonp');
  }
}

// returns a 2 x num-nodes matrix such that the nth col is the (x, y) onscreen coords of node with ID n 
// w, h are the dimensions of the space to assign the node locations within. 
function assignNodeLocations(w, h, xOffset, yOffset){
  //preallocate array 
  locations = Array(2);
  locations[0] = Array(numNodes);
  locations[1] = Array(numNodes);
  
  for (r = 0; r < expStageInfo.length; r++){ // for each stage
    nodesInStage = expStageInfo[r]; // array of node IDs in the current stage
    for (n = 0; n < nodesInStage.length; n++){ // for each node, assign it a location on graph
      locations[0][nodesInStage[n]-1] = map(n, 0, nodesInStage.length - 1, 0, w) + xOffset; // x coord based on index within stage
      locations[1][nodesInStage[n]-1] = map(r, 0, expStageInfo.length - 1, 0, h) + yOffset; // y coord stage-based
    }
  }
  return locations;
}

function PMF(x, y, w, h){
  this.selectedNode = -1;
  
  this.display = function(){
    push();
    for (farm = 0; farm < 100; farm++){
      mappedX = map(farm, 0, 99, x, x+w);
      mappedY = map(parseFloat(currentPMF[farm]), 0, 1, y, y-h)
      strokeWeight(3);
      stroke(greenGradient[1])
      if (farm === 38 && nodes[farm].isSource){stroke(contamColor)}
      line(mappedX, y, mappedX, mappedY);
      
      noStroke();
      fill(220);
      textSize(12);
      textFont(openSansReg);
      
      var textX = x - 20; 
      var textY = y;
      push();
      translate(textX, textY); // translate to text pos
      rotate(- PI/2);
      text("Probability", 14, 0);
      pop();
      
    }
    if (this.selectedNode > -1){
      mappedX = map(this.selectedNode, 0, 99, x, x+w);
      stroke(220);
      line(mappedX, y+5, mappedX, y + 30);
      noStroke();
      fill(100);
      textSize(12);
      textAlign(LEFT, BOTTOM)
      farmID = this.selectedNode + 1;
      if (farmID > 50){
        textAlign(RIGHT, BOTTOM);
        text("Farm " + farmID + " has a " + nf(parseFloat(currentPMF[farmID-1]), 1, 2) + " chance of being the source.",mappedX - 5, y+30)
      }
      else {text("Farm " + farmID + " has a " + nf(parseFloat(currentPMF[farmID-1]), 1, 2) + " chance of being the source.",mappedX + 5, y+30);}
    }
    else { // draw farm ID x axis label
      noStroke();
      fill(190);
      textSize(12);
      textFont(openSansReg);
      text("Farm ID", x + w/2 - 20, y + 10);
    }
    pop();
  } // end display
  
  // returns index of farm node that cursor is closest to
  this.cursorOver = function() {
    return this.selectedNode;
  }
  
  this.setSelection = function(nodeInd){
    this.selectedNode = nodeInd;
  }
}

//-----------------OBJECTS----------------------//



// id = integer label
// x, y = onscreen coordinates
// outEdgeIDs = array index of node at which out edges terminate 
// outEdgeEnds = locations of edge termination
// cDef = default fill color of node
function ExpNode(id, x, y, w, h, outEdgeInds, outEdgeEnds, emphCol, deEmphCol, isReg){
  // making the parameters belong to the specific button object
  this.id = id;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.emphCol = emphCol;
  this.deEmphCol = deEmphCol;
  this.outEdgeEnds = outEdgeEnds;
  this.outEdgeInds = outEdgeInds; 
  this.stage = 1; // placeholder
  this.outEdgeColor = 0;
  // private variables
  this.isHighlighted = false;
  this.currentColor = this.emphCol; // initially, color = default color
  this.emphChildrenInds = [];
  this.edgesGray = true; // defaults to true, unless it's an edge that's being specifically called out
  this.numContamReports = 0;
  this.pmfVal = 0;
  this.isSource = false;
  
  // initialize ancestor array. Could prolly do this by passing in the info, 
  // but with "explore" network it's not too big
  ancestorInds = [];
  if (!isReg){
  for (pInd = 0; pInd < expParentInfo[id-1].length; pInd++){
    if (expParentInfo[id-1][pInd] > 0){
      ancestorInds.push(expParentInfo[id-1][pInd]-1);
    }
    else{ // terminate loop if hit a placeholder parent val
      pInd = expParentInfo[id-1].length; 
    }
  }
  }//end if
  this.ancestorInds = ancestorInds;
  
  this.deEmph = function(){
    this.currentColor = this.deEmphCol;
    this.emphChildrenInds = []; // no edges are emphasized
  }
  
  // only called when we leave hover mode
  this.reEmph = function(){
    this.currentColor = this.emphCol;
    this.emphChildrenInds = outEdgeInds; // all edges are emphasized
    this.edgesGray = true;
  }
  
  this.hoverEmph = function(){
    this.edgesGray = false;
    this.currentColor = this.emphCol;
    this.emphChildrenInds = this.outEdgeInds;
    
    // emphasize all ancestors from below
    if (this.ancestorInds.length > 0){
    for (pInd = 0; pInd < this.ancestorInds.length; pInd++){
      nodes[this.ancestorInds[pInd]].emphFromBelow(this.id);
    }
    }
    // emphasize all its descendents from above
    if (this.emphChildrenInds.length > 0){
    for (cInd = 0; cInd < this.emphChildrenInds.length; cInd++){
      nodes[this.emphChildrenInds[cInd]].emphFromAbove();
    }
    }
  }
  
  this.emphFromBelow = function(childID){
    this.edgesGray = false;
    this.currentColor = this.emphCol;
    this.emphChildrenInds.push(childID-1);
    if (this.ancestorInds.length > 0){
      for (qInd = 0; qInd < this.ancestorInds.length; qInd++){
        nodes[this.ancestorInds[qInd]].emphFromBelow1(this.id);
      }
    }
  }
  this.emphFromBelow1 = function(childID){
    this.edgesGray = false;
    this.currentColor = this.emphCol;
    this.emphChildrenInds.push(childID-1);
    if (this.ancestorInds.length > 0){
      for (rInd = 0; rInd < this.ancestorInds.length; rInd++){
        nodes[this.ancestorInds[rInd]].emphFromBelow2(this.id);
      }
    }
  }
  this.emphFromBelow2 = function(childID){
    this.edgesGray = false;
    this.currentColor = this.emphCol;
    this.emphChildrenInds.push(childID-1);
    if (this.ancestorInds.length > 0){
      for (sInd = 0; sInd < this.ancestorInds.length; sInd++){
        nodes[this.ancestorInds[sInd]].emphFromBelow(this.id);
      }
    }
  }
  
  
  //-- there are three versions of this function due to variable scoping issues --//
  this.emphFromAbove = function(){
    this.edgesGray = false;
    this.currentColor = this.emphCol;
    this.emphChildrenInds = this.outEdgeInds; // emphasize all descendents
    if (this.outEdgeInds.length > 0){
      for (dInd = 0; dInd < this.emphChildrenInds.length; dInd++){
        nodes[this.emphChildrenInds[dInd]].emphFromAbove1();
      }
    }
  }// end emphFromAbove
  
  this.emphFromAbove1 = function(){
    this.edgesGray = false;
    this.currentColor = this.emphCol;
    this.emphChildrenInds = this.outEdgeInds; // emphasize all descendents
    if (this.outEdgeInds.length > 0){
      for (eInd = 0; eInd < this.emphChildrenInds.length; eInd++){
        nodes[this.emphChildrenInds[eInd]].emphFromAbove2();
      }
    }
  }// end emphFromAbove
  this.emphFromAbove2 = function(){ // this one's short because we have at most 4 stages
    this.edgesGray = false;
    this.currentColor = this.emphCol;
  }// end emphFromAbove
  
  this.contaminate = function(){
    this.currentColor = contamColor;
  }
  
  this.addContamReport = function(){
    this.currentColor = contamColor;
    this.numContamReports = this.numContamReports + 1;
  }
  
  this.setPMF= function(pmfVal){
    this.pmfVal = pmfVal;
  }
  
  this.clearContam = function(){
    this.numContamReports = 0;
  }
  
  this.toggleSourceStatus = function(){
    this.isSource = !this.isSource;
  }
  
  this.display = function(){
    push();
    
    stroke(0);
    
    // draw edges
    for (i = 0; i < this.outEdgeInds.length; i++){
       // if this is an edge to an emphasized kid
      if (!this.edgesGray && contains(this.emphChildrenInds, this.outEdgeInds[i])){
        stroke(emphCol);
      }
      else{
        stroke(deEmphCol)
      }
      line(x, y, outEdgeEnds[0][i], outEdgeEnds[1][i]);
    } // end for


    stroke(this.currentColor);
    fill(this.currentColor);
    ellipse(this.x, this.y, this.w, this.h);
    
    if (this.numContamReports > 0){
      push();
      strokeWeight(2);
      line(this.x, this.y, this.x, this.y - 2*this.numContamReports);
      pop();
    }
    
    if (this.pmfVal > 0){
      push();
      strokeWeight(2);
      line(this.x, this.y, this.x, this.y - max(100*this.pmfVal,7));
      pop();
    }
    
    if (this.isSource){
      push();
      stroke(contamColor);
      strokeWeight(3);
      noFill();
      ellipse(this.x, this.y, this.w + 5, this.h + 5);
      pop();
    }

    noStroke();
    fill(0);
    if (!isReg){
      textAlign(CENTER, BOTTOM);
      textSize(11);
      textFont(openSansReg)
      text(this.id, this.x, this.y-this.h);
    }
    pop();
  }
  
  // okay this is for a rect rn but I just wanted it to run, fix later
  this.containsCursor = function() {
    return (mouseX > x - w/2 && mouseX < x + w/2 + w && y - h/2 < mouseY && mouseY < y + h/2);
  }
  
  this.setColor = function(newC) {
    this.c = newC;
  }
} // end definition of ExpNode


//-----------------INTERACTION----------------------//


function keyPressed() {
  print("KEY PRESSED")
  // if there's no PMF graph onscreen, do nothing
  if (currentScreen === 'dense outbreak'){
    if (keyCode === LEFT_ARROW) {
      print("LEFT ARROW")
      newSelected = pmfGraph.cursorOver()-1;
      pmfGraph.setSelection(newSelected);
    } else if (keyCode === RIGHT_ARROW) {
      newSelected = pmfGraph.cursorOver() +1;
      pmfGraph.setSelection(newSelected);
    }
    else if (keyCode === UP_ARROW){
      pmfGraph.setSelection(-1);
    }
  }
}

// should let you select nodes!!
// if user clicks, identify which node they clicked and change "isSelected" status of it
mouseClicked = function() {
  for (b = 0; b < buttons.length; b++){ // allow user to click buttons
    if (buttons[b].containsCursor()){
      currentScreen = buttons[b].label; // bring us to a new state
      // initialize the necessary play buttons for the state we just switched to. NEW 11/14/16
      if (buttons[b].label == "dense outbreak" || buttons[b].label == "sparse outbreak") {
          playButton = new PlayPauseButton(1005, 204, 15, 15, 200, contamColor); // uncomm
      }
    }
  } // end for over buttons
  if (typeof sourceToggleButton != 'undefined' && sourceToggleButton.containsCursor()){
    nodes[58].toggleSourceStatus();
  }
  // play button 
  if (currentScreen === "dense outbreak" || currentScreen === "sparse outbreak"){
    if (typeof playButton != "undefined"){
      if (playButton.containsCursor()){
        playButton.changeState();
      }
    }
  }
  
  if (currentScreen === "explore"){
  for (var n = 0; n < numNodes; n++){
    // idk for some reason this statement is here because it didn't work with just nodes[n].containsCursor :(
    if (mouseX > nodes[n].x - nodes[n].w/2 && mouseX < nodes[n].x + nodes[n].w/2 + nodes[n].w && nodes[n].y - nodes[n].h/2 < mouseY && mouseY < nodes[n].y + nodes[n].h/2){
      if (nodes[n].isSelected){ // deselect if had been selected
        var index = selectedNodeInds.indexOf(n);
        if (index > -1) {
          selectedNodeInds.splice(index, 1);
          nodes[n].isSelected = false;
        } // end if
      } // end if
      else{ // select
        selectedNodeInds.push(n);
        nodes[n].isSelected = true;
      } // end else
      n = numNodes; // terminate loop bc we're done
    }     
  }
  } // end explore case
    
  
    // prevent default behavior
    return false;
}



// c = fill color of button
function LabeledButton(label, x, y, w, h, c, cSelected){
  // making the parameters belong to the specific button object
  this.label = label;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.c = c;
  this.cSelected = cSelected;
  this.isSelected = false;
  
  
  this.display = function(){
    push();
    if (!this.isSelected){
      stroke(this.c);
      noFill();
      rect(this.x, this.y, this.w, this.h);
      noStroke();
      fill(this.c);
      textFont(openSansBold)
      textAlign(CENTER, CENTER);
      text(label, this.x+this.w/2, this.y+h/2)
    }
    else{
      stroke(this.cSelected);
      noFill();
      rect(this.x, this.y, this.w, this.h);
      noStroke();
      fill(this.cSelected);
      textFont(openSansBold)
      textAlign(CENTER, CENTER);
      text(label, this.x+this.w/2, this.y+h/2)
    }
    pop();
  }
  
  this.select = function(){
    this.isSelected = true;
  }
  
  this.deselect = function(){
    this.isSelected = false;
  }
  
  this.containsCursor = function() {
    return (mouseX > x && mouseX < x + w && y < mouseY && mouseY < y + h);
  }
}

// c = fill color of button
function PlayPauseButton(x, y, w, h, c, cPlaying){
  // making the parameters belong to the specific button object
  this.x = x;
  this.y = y;
  this.w = w; // artifact variables from before
  this.h = h; // artifact variables from before
  this.c = c;
  this.cPlaying = cPlaying;
  this.isPlaying = false;
  
  this.w_eff = w;
  this.h_eff = h;
  
  this.display = function(){
    padding = 3; // actually, increasing this increases the middle width and shrinks the y
    push();
    if (!this.isPlaying){ // play button
      stroke(this.cPlaying);
      noFill();
      rect(this.x, this.y + 4, this.w + 30, this.h - 1);
      this.w_eff = this.w + 30; // keep track of fact is currently a play button
      this.h_eff = this.h - 1; // keep track of fact is currently a play button
      noStroke();
      fill(this.cPlaying)
      textFont(openSansBold);
      textSize(11);
      textAlign(LEFT,TOP);
      text("PLAY", this.x + 4 + 10, this.y)
      
      // old play button with the little triangle
      //noStroke();
      //fill(this.c);
      triangle(this.x+padding, this.y+padding + 4, this.x+padding, this.y+this.h-padding + 4, this.x+this.w-padding, this.y+this.h/2 + 4); // terrible, to make triangle tho
    }
    else{ // pause button
      stroke(this.cPlaying); // artifact variable: this.c is now not used for anything
      noFill();
      rect(this.x, this.y + 4, this.w + 39, this.h - 1);
      this.w_eff = this.w + 39; // keep track of fact is currently a play button
      this.h_eff = this.h - 1; // keep track of fact is currently a play button
      
      strokeWeight(4);
      line(this.x+this.w/2-padding, this.y + 1.5*padding + 4, this.x+this.w/2-padding, this.y+this.h - 1.5*padding + 3);
      line(this.x+this.w/2+padding, this.y + 1.5*padding + 4, this.x+this.w/2+padding, this.y+this.h - 1.5*padding + 3);
      
      noStroke();
      fill(this.cPlaying)
      textFont(openSansBold);
      textSize(11);
      textAlign(LEFT,TOP);
      text("PAUSE", this.x + 4 + 12, this.y)
    }
    pop();
  }
  
  this.changeState = function(){
    this.isPlaying = !this.isPlaying;
  }
  
  this.containsCursor = function() {
    return (mouseX > this.x && mouseX < this.x + this.w_eff && this.y < mouseY && mouseY < this.y + this.h_eff);
  }
}

// input current value
function AnimatedValue(value) {
  this.value = value; // current value
  var isAnimating = false; // by default not initially animating

  var from, to, step, n;
  
  // if you want to animate use this function
  this.setTarget = function(targetValue, duration) { 
    from = this.value;
    to = targetValue;
    
    n = duration; // number of frames in animation
    step = 0;
    isAnimating = true;
  }
  
  this.update = function() {
    if (isAnimating) {
      this.value = map(step, 0, n, from, to);
      step++;
      if (step > n) {
        isAnimating = false;
      }
    }
  }
}

//-----------------UTILITY----------------------//

function union_arrays (x, y) {
  var obj = {};
  for (var i = x.length-1; i >= 0; -- i)
     obj[x[i]] = x[i];
  for (var i = y.length-1; i >= 0; -- i)
     obj[y[i]] = y[i];
  var res = []
  for (var k in obj) {
    if (obj.hasOwnProperty(k))  // <-- optional
      res.push(obj[k]);
  }
  return res;
}

function intersect(a, b) {
    var d1 = {};
    var d2 = {};
    var results = [];
    for (var i = 0; i < a.length; i++) {
        d1[a[i]] = true;
    }
    for (var j = 0; j < b.length; j++) {
        d2[b[j]] = true;
    }
    for (var k in d1) {
        if (d2[k]) 
            results.push(k);
    }
    return results;
}

function range(start, end) {
    var foo = [];
    for (var i = start; i < end; i++) {
        foo.push(i);
    }
    return foo;
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

function zeros(num){
  return Array.apply(null, Array(num)).map(Number.prototype.valueOf,0);
}