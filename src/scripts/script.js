"use strict";

// browser-sync start --server --files '**/*.css, **/*.html, **/*.js

const myApp = Object.create(null);

// ======================================================================
// App
// ======================================================================

myApp.main = function main() {
  // Creates an isolated event sandbox around a element
  // Any elements insdie the Event sandbox will be passed to the EventDelegator
  const eventSandbox = EventDelegator();

  myApp.count = 0;

  const eventSandbox1 = document.getElementById("eventSandbox1");
  eventSandbox.initEvent(eventSandbox1, "click", { tags: ["BUTTON"] });

  // Create a event Observer
  myApp.subscribers = EventObservers();
  myApp.subscribers.init();

  createObserversById(["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "pickX", "pickO"]);

  // Elements with no Events on them
  myApp.Elems = EventObservers();
  myApp.Elems.init();

  elementObjectById(
    [
      "mainTitle",
      "scoreFrame",
      "playerScoreB",
      "aiScoreB",
      "aiWins",
      "aiLosses",
      "playerWins",
      "playerLosses",
      "playerTied",
      "aiTied"
    ],
    myApp.Elems
  );

  // Handles all events within the Event sandbox
  eventSandbox.addEvent(eventController);
};

// ======================================================================
// Events
// ======================================================================

function initGame() {
  // [“O”,1 ,”X”,”X”,4 ,”X”, 6 ,”O”,”O”];
  const newBoard = [["na", "na", "na"], ["na", "na", "na"], ["na", "na", "na"]];

  myApp.board = newBoard;
  myApp.moves = [];
  myApp.count = 0;

  myApp.lastGame = undefined;

  console.log("new");

  myApp.playerTurn = true;

  // // There are only 9 turns possible
  // for (let i = 0; i < 9; i += 1) {
  //   const myTurn = selectTurn();

  //

  // if (myApp.lastGame === undefined) {
  // const bestMove = game(board, myApp.ai);
  //   console.log(bestMove);
  // }

  // const bestMove = game(board, myApp.player1);

  // console.log(bestMove);

  // console.log(myApp.count);
}

function selectTurn() {
  let turn;
  if (myApp.playerTurn) {
    turn = myApp.player1;
  } else {
    turn = myApp.ai;
  }
  myApp.playerTurn = !myApp.playerTurn;
  return turn;
}

function turnAction(id) {
  let elemId = id;

  // As long as the observer exists
  if (myApp.subscribers.observers[elemId]) {
    const boardPositions = {
      s1: [0, 0],
      s2: [0, 1],
      s3: [0, 2],
      s4: [1, 0],
      s5: [1, 1],
      s6: [1, 2],
      s7: [2, 0],
      s8: [2, 1],
      s9: [2, 2]
    };

    const boardId = [["s1", "s2", "s3"], ["s4", "s5", "s6"], ["s7", "s8", "s9"]];

    const marker = selectTurn();

    if (marker === myApp.ai) {
      const bestMove = game(myApp.board, myApp.ai);
      console.log("Out BESTMOVE", bestMove);
      const pos = bestMove.index;
      myApp.board[pos[0]][[pos[1]]] = marker;
      elemId = boardId[pos[0]][[pos[1]]];
      console.log("Elem", elemId);
    } else {
      const boardPos = boardPositions[id];
      myApp.board[boardPos[0]][[boardPos[1]]] = marker;
    }

    myApp.subscribers.observers[elemId].add(marker);

    // Remove the space so cannot be clicked again
    myApp.subscribers.unsubscribe(elemId);

    const gameResult = isGameWin();
    const result = whoWins(gameResult);
    if (result) gameOver(result);

    console.log(myApp.board);
  }
}

function gameOver(result) {
  console.log("gameOver", result);

  // Unsubscribe all spaces
  const keys = Object.keys(myApp.subscribers.observers);
  myApp.subscribers.unsubscribe(keys);

  // Reset Game?
}

function isGameWin() {
  const condition = gameCondition(myApp.board);
  // X wins
  if (condition[0][0] === true) {
    return ["X", condition[0][1]];
    // O wins
  } else if (condition[1][0] === true) {
    return ["O", condition[1][1]];
  } else if (condition[2].length === 0) {
    return ["Tie", "Tie"];
  }
  return false;
}

function whoWins(result) {
  if (result) {
    if (result[0] === myApp.player1) {
      return [`Player: ${myApp.player1}`, result[1]];
    } else if (result[0] === myApp.ai) {
      return [`AI: ${myApp.ai}`, result[1]];
    } else if (result[0] === "Tie") {
      return ["Tie", "Tie"];
    }
  }
  return false;
}

// ======================================================================
// Events
// ======================================================================

function eventController(args, e) {
  // Note: Function has access to this.elem via "this"
  // "this" being what element the event sandbox is attached to and
  // it's children.
  // To know what button was pressed just use console.log(id).
  // let {arg1, arg2, arg3} = args;
  // args: comes from when the event was first init. It's not to be defined directly
  //      ex: NOT LIKE eventController(args) "THIS WON'T WORK"

  // Only Passes events of with tagNames defined in the array
  const id = getTargetId(e, args.tags);

  if (id) {
    if (id.match(/(pickX|pickO)/)) {
      selectChoice(id);
    } else if (id.match(/(s1|s2|s3|s4|s5|s6|s7|s8|s9)/)) {
      turnAction(id);
    }
  }

  // Stop the event from going further up the DOM
  e.stopPropagation();
}

function selectChoice(id) {
  const obs = myApp.subscribers.observers[id];
  let choice;
  const selected = obs.elem.id;
  if (selected === "pickO") {
    choice = "O";
  } else {
    choice = "X";
  }

  myApp.player1 = choice;
  myApp.ai = getAiLetter(myApp.player1);
  setVisiblity();
  scoreBoard();
  initGame();
}

function createObserversById(ids) {
  ids.forEach(_id => {
    const elem1 = document.getElementById(_id);
    btnEventObserver(_id, elem1, myApp.subscribers);
  });
}

// ======================================================================
// Tic Tac Toe
// ======================================================================

function scoreBoard() {
  const spaces = document.querySelectorAll(".spaceStart");

  const elems = myApp.Elems.observers;
  elems.scoreFrame.elem.className = "visible";

  for (let i = 0; i < spaces.length; i += 1) {
    spaces[i].className = "space center spaceDefaultColour";
  }

  elems.playerScoreB.elem.className = "X scoreBoard";
  elems.aiScoreB.elem.className = "O scoreBoard";

  const fadeIns = ["aiTitle", "aiWins", "aiLosses", "playerWins", "playerLosses", "playerTied", "aiTied"];
  const elemKeys = Object.keys(elems);

  fadeIns.forEach(toFade => {
    if (elemKeys.includes(toFade)) {
      elems[toFade].elem.className = "center visible fadeIn";
    }
  });
}

function setVisiblity() {
  const frame = document.getElementById("frame");
  const board = document.getElementById("board");
  const menu = document.getElementById("menu");
  frame.className = "visible";
  board.className = "visible";
  menu.className = "notVisible";
}

function getAiLetter(input) {
  if (input === "X") {
    return "O";
  }
  return "X";
}

function getBoardState(board) {
  const xPos = [];
  const oPos = [];
  const nullPos = [];

  for (let id = 0; id < board.length; id += 1) {
    const row = board[id];
    for (let space = 0; space < row.length; space += 1) {
      if (row[space] === "X") {
        xPos.push([id, space]);
      } else if (row[space] === "O") {
        oPos.push([id, space]);
      } else {
        nullPos.push([id, space]);
      }
    }
  }
  return [xPos, oPos, nullPos];
}

function diagonalWin(diagonals) {
  const middleExists = diagonals.indexOf("11") !== -1;
  if (middleExists) {
    if (diagonals.indexOf("00") !== -1 && diagonals.indexOf("22") !== -1) {
      return true;
    } else if (diagonals.indexOf("20") !== -1 && diagonals.indexOf("02") !== -1) {
      return true;
    }
  }
  return false;
}

function checkWin(dict) {
  for (let i = 0; i < 3; i += 1) {
    if (dict[i] !== undefined) {
      if (dict[i].length === 3) {
        return true;
      }
    }
  }
  return false;
}

function checkWinType(states) {
  const rowWin = checkWin(states[0]);
  const colWin = checkWin(states[1]);
  const dwin = diagonalWin(states[2]);

  if (rowWin === true) {
    return [true, "rowWin"];
  } else if (colWin === true) {
    return [true, "colWin"];
  } else if (dwin === true) {
    return [true, "diaWin"];
  }
  return [false];
}

function gameCondition(theBoard) {
  const board = theBoard;
  const state = getBoardState(board);
  const condition = [isWin(state[0]), isWin(state[1]), state[2]];
  return condition;
}

function game(newBoard, player) {
  const board = newBoard;
  const state = gameCondition(board);

  const positions = state[2];
  const XWins = state[0][0];
  const OWins = state[1][0];

  let playerWins;
  let aiWins;

  if (myApp.player1 === "O") {
    playerWins = OWins;
    aiWins = XWins;
  } else {
    playerWins = XWins;
    aiWins = OWins;
  }

  const gameScore = minMaxState(playerWins, aiWins, positions);

  if (gameScore) {
    return gameScore;
  }

  let result;
  const moves = [];

  for (let i = 0; i < positions.length; i += 1) {
    const move = {};
    move.index = positions[i];
    const resetValue = board[positions[i][0]][positions[i][1]];
    board[positions[i][0]][positions[i][1]] = player;
    if (player === myApp.ai) {
      result = game(board, myApp.player1);
      if (result) {
        move.score = result.score;
      }
    } else if (player === myApp.player1) {
      result = game(board, myApp.ai);
      if (result) {
        move.score = result.score;
      }
    }
    board[positions[i][0]][positions[i][1]] = resetValue;
    moves.push(move);
  }

  const bestMove = getBestMove(moves, player);
  return bestMove;
}

function getBestMove(moves, player) {
  let bestMove;
  if (player === myApp.ai) {
    let bestScore = -10000;

    for (let i = 0; i < moves.length; i += 1) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;

    for (let i = 0; i < moves.length; i += 1) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}

function minMaxState(player1Wins, player2Wins, positions) {
  if (player1Wins) {
    return { score: -10 };
  } else if (player2Wins) {
    return { score: 10 };
  } else if (positions.length === 0) {
    return { score: 0 };
  }
  return undefined;
}

function isWin(state) {
  let rows = Object.create(null);
  let cols = Object.create(null);
  const diagonals = [];

  state.forEach(elem => {
    rows = defaultDict(rows, elem[0], [elem[0], elem[1]]);
    cols = defaultDict(cols, elem[1], [elem[0], elem[1]]);
    diagonals.push(`${elem[0]}${elem[1]}`);
  });
  return checkWinType([rows, cols, diagonals]);
}

// ======================================================================
// Utilities
// ======================================================================

function defaultDict(inputDict, i, values) {
  const dict = inputDict;
  if (dict[i] === undefined) {
    dict[i] = [values];
  } else {
    dict[i].push(values);
  }
  return dict;
}

// ======================================================================
// Element Controller
// ======================================================================

function elementDelegator() {
  // These can be accessed via the subscriptions or
  // directly by calling myApp.subscribers.observers[id]
  // which you can use dot notation on any property or method
  const Element = {
    init(btnId, elem) {
      this.id = btnId;
      this.elem = elem;
    },
    newProp(propName) {
      if (this[propName] === undefined) {
        this[propName] = Object.create(null);
      }
    }
  };
  return Element;
}

function elementObjectById(ids, holder) {
  ids.forEach(eid => {
    const holderObj = holder;
    const elem1 = document.getElementById(eid);
    const newElem = elementDelegator();
    newElem.init(eid, elem1);
    holderObj.subscribe(newElem);
  });
}

// ======================================================================
// Event Controller
// ======================================================================

function btnEventDelegator() {
  // Here you can define properties that will be shared between all defined within
  // the subscription
  // These can be accessed via the subscriptions or
  // directly by calling myApp.subscribers.observers[id]
  // which you can use dot notation on any property or method
  const Observer = {
    init(btnId, elem) {
      this.id = btnId;
      this.elem = elem;
      this.actionId = elem.id;
      this.count = 0;
    },
    newProp(propName) {
      if (this[propName] === undefined) {
        this[propName] = Object.create(null);
      }
    },
    add(marker) {
      this.elem.textContent = marker;
      this.elem.className = `space center ${marker}`;
    },
    clear() {
      this.elem.textContent = "";
      this.count = 0;
    }
  };
  return Observer;
}

// ======================================================================
// Event Utilities
// ======================================================================

function createEvent() {
  const CreateEvent = {
    setup: function init(elem, type, args) {
      // The Element to bind the event handler too
      this.elem = elem;
      // The type of event
      this.eventType = type;
      // Additional arguments that will be passed to the bound function as an object
      this.args = args;
      // If Array convert to object
      if (Array.isArray(args)) {
        this.args = Object.assign({}, args);
      }
    },
    addListener: function addListener(func, options) {
      // func: Bound an Function to an Event
      // (options): Optional parameter for passing options to event listener ex: "once: true"
      this.boundFunc = func.bind(this.elem, this.args);
      // this.bound prevents binding loss for options
      this.boundOptions = options;
      this.elem.addEventListener(this.eventType, this.boundFunc, this.boundOptions);
    },
    removeListener: function removeListener() {
      // Remove the listener, do not have to pass the options since it is bound
      this.elem.removeEventListener(this.eventType, this.boundFunc, this.boundOptions);
    }
  };
  return CreateEvent;
}

function EventDelegator() {
  const Event = Object.create(createEvent());

  Event.initEvent = function setup(elem, type, targetTags) {
    this.setup(elem, type, targetTags);
  };
  Event.addEvent = function add(func, options) {
    this.addListener(func, options);
  };
  Event.removeEvent = function remove() {
    this.removeListener();
  };
  return Event;
}

function getTargetId(e, tags) {
  // Returns the target Id of event for allowed tags
  //    Prevents events on the parent
  //    Returns False if no target match
  if (e.target !== e.currentTarget) {
    if (tags.indexOf(e.target.tagName) > -1) {
      return e.target.id;
    }
  }
  e.stopPropagation();
  return false;
}

function btnEventObserver(btnId, elem, observers) {
  // We just return true, because the observers holds the object
  const observer = btnEventDelegator();
  observer.init(btnId, elem);
  observers.subscribe(observer);
  return true;
}

function EventObservers() {
  // Delegator
  const Event = Object.create(null);

  Event.init = function init() {
    this.observers = Object.create(null);
  };
  Event.subscribe = function subscribe(observer) {
    this.observers[observer.id] = observer;
  };
  Event.unsubscribe = function unsubscribe(observer) {
    // Can unsubscribe one observer, or an array of observers
    if (typeof observer === "string") {
      delete this.observers[observer];
    } else {
      observer.forEach(key => delete this.observers[key]);
    }
  };
  Event.inform = function inform(id, func, args) {
    // Sent to only one observer
    this.observers[id][func](id, args);
  };
  Event.broadcast = function broadcast(func) {
    // On each object called func
    const keys = Object.keys(this.observers);
    for (let i = 0; i < keys.length; i += 1) {
      this.observers[keys[i]][func]();
    }
  };
  return Event;
}
// ======================================================================

myApp.initApplication = function init() {
  myApp.main();
};

// Handler when the DOM is fully loaded
document.onreadystatechange = function onreadystatechange() {
  if (document.readyState === "complete") {
    myApp.initApplication(document.readyState);
  } else {
    // Do something during loading [opitional]
  }
};

// ======================================================================
