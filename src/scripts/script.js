"use strict";

// browser-sync start --server --files '**/*.css, **/*.html, **/*.js

const myApp = Object.create(null);

// ======================================================================
// App
// ======================================================================

myApp.initApplication = function init() {
  // Creates an isolated event sandbox around a element
  // Any elements inside the Event sandbox will be passed to the EventDelegator
  const eventSandbox = EventDelegator();
  const eventSandboxElem = document.getElementById("eventSandbox1");
  // Events are only triggered on defined tags
  eventSandbox.initEvent(eventSandboxElem, "click", { tags: ["BUTTON"] });

  // Create a event Observer
  myApp.subscribers = SubscribersDelegator();
  myApp.subscribers.init();

  myApp.Elems = SubscribersDelegator();
  myApp.Elems.init();

  myApp.ScoreBoard = SubscribersDelegator();
  myApp.ScoreBoard.init();

  createObserversById(["Wins", "Losses", "Tied"], ScoreBoardDelegator, myApp.ScoreBoard);

  // You can change out the Delegator used if needed
  // Elements part of the same delegator share the same properites
  createObserversById(["mainTitle", "scoreFrame", "scoreB", "Wins", "Losses", "Tied"], ElementDelegator, myApp.Elems);

  createObserversById(
    ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "pickX", "pickO"],
    btnEventDelegator,
    myApp.subscribers
  );

  // Add the event to the event sandbox area
  // EventController Handles all events within the Event sandbox
  eventSandbox.addEvent(eventController);
};

// ======================================================================
// Game
// ======================================================================

function selectChoice(id) {
  const obs = myApp.subscribers.observers[id];
  let choice;
  const selected = obs.elem.id;
  if (selected === "pickO") {
    choice = "O";
  } else {
    choice = "X";
  }

  myApp.score = { wins: 0, losses: 0, tied: 0 };
  myApp.player1 = choice;
  myApp.ai = getOppositeMarker(myApp.player1);
  setVisiblity();
  scoreBoard();
  initGame();
}

function getOppositeMarker(input) {
  if (input === "X") {
    return "O";
  }
  return "X";
}

function setVisiblity() {
  const frame = document.getElementById("frame");
  const board = document.getElementById("board");
  const menu = document.getElementById("menu");
  frame.className = "visible";
  board.className = "visible";
  menu.className = "notVisible";
}

function resetSpaces(selector) {
  const spaces = document.querySelectorAll(selector);

  for (let i = 0; i < spaces.length; i += 1) {
    spaces[i].className = "space center spaceDefaultColour";
  }
}

function scoreBoard() {
  const elems = myApp.Elems.observers;
  elems.scoreFrame.elem.className = "visible";

  resetSpaces(".spaceStart");

  elems.scoreB.elem.className = `${myApp.player1} scoreBoard`;

  const fadeIns = ["aiTitle", "Wins", "Losses", "Tied"];
  const elemKeys = Object.keys(elems);

  fadeIns.forEach(toFade => {
    if (elemKeys.includes(toFade)) {
      elems[toFade].elem.className = "center visible fadeIn";
    }
  });
}

function initGame() {
  const newBoard = [["na", "na", "na"], ["na", "na", "na"], ["na", "na", "na"]];

  myApp.board = newBoard;
  myApp.moves = [];

  myApp.playerTurn = true;

  resetSpaces(".space");

  myApp.unregistered = [];
}

function turnAction(id) {
  let elemId = id;
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
    const pos = bestMove.index;
    myApp.board[pos[0]][[pos[1]]] = marker;
    elemId = boardId[pos[0]][[pos[1]]];
  } else {
    const boardPos = boardPositions[id];
    myApp.board[boardPos[0]][[boardPos[1]]] = marker;
  }

  myApp.subscribers.observers[elemId].add(marker);

  // Remove the space so cannot be clicked again
  myApp.unregistered.push(elemId);

  const gameResult = isGameWin();
  const result = whoWins(gameResult);
  if (result) gameOver(result);
  // Trigger the AI to play
  else if (marker === myApp.player1) {
    turnAction(undefined);
  }
}

function gameOver(result) {
  // Unsubscribe all spaces
  const keys = Object.keys(myApp.subscribers.observers);

  keys.forEach(key => myApp.unregistered.push(key));

  tallyScores(result);
  displayScores();

  // Reset Game
  setTimeout(() => {
    initGame();
  }, 2500);
}

function displayScores() {
  const sBoard = myApp.ScoreBoard.observers;
  sBoard.Wins.elem.textContent = `Wins: ${myApp.score.wins}`;
  sBoard.Losses.elem.textContent = `Losses: ${myApp.score.losses}`;
  sBoard.Tied.elem.textContent = `Tied: ${myApp.score.tied}`;
}

function tallyScores(result) {
  if (result[0] === "Tie") {
    myApp.score.tied += 1;
  } else if (result[1] === myApp.player1) {
    myApp.score.wins += 1;
  } else {
    myApp.score.losses += 1;
  }
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
    return ["Tie"];
  }
  return false;
}

function whoWins(result) {
  if (result) {
    if (result[0] === myApp.player1) {
      return ["Player", myApp.player1, result[1]];
    } else if (result[0] === myApp.ai) {
      return ["AI", myApp.ai, result[1]];
    } else if (result[0] === "Tie") {
      return ["Tie"];
    }
  }
  return false;
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

function gameCondition(theBoard) {
  const board = theBoard;
  const state = getBoardState(board);
  const condition = [isWin(state[0]), isWin(state[1]), state[2]];
  return condition;
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

// ======================================================================
//  Delegators
//
//      - Create new Delegators for elements that should operate similarly
// ======================================================================

function ElementDelegator() {
  // Here you can define properties that will be shared between all defined within
  // the subscription
  // These can be accessed via the subscriptions or
  // directly by calling myApp.subscribers.observers[id]
  // which you can use dot notation on any property or method
  const Element = {
    init(elemId, elem) {
      this.id = elemId;
      this.elem = elem;
    },
    // Can add new properties on the fly
    // But these will only apply to the "this" element and not all
    // under the same delegator
    newProp(propName) {
      if (this[propName] === undefined) {
        this[propName] = Object.create(null);
      }
    }
  };
  return Element;
}

function ScoreBoardDelegator() {
  // Here you can define properties that will be shared between all defined within
  // the subscription
  // These can be accessed via the subscriptions or
  // directly by calling myApp.subscribers.observers[id]
  // which you can use dot notation on any property or method
  const Element = {
    init(elemId, elem) {
      this.id = elemId;
      this.elem = elem;
    },
    // Can add new properties on the fly
    // But these will only apply to the "this" element and not all
    // under the same delegator
    newProp(propName) {
      if (this[propName] === undefined) {
        this[propName] = Object.create(null);
      }
    }
  };
  return Element;
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
// Handle Events
// ======================================================================

function eventController(args, e) {
  // To know what button was pressed just use console.log(id).
  // let {arg1, arg2, arg3} = args;
  // args: comes from when the event was first init. It's not to be defined directly
  //      ex: NOT LIKE eventController(args) "THIS WON'T WORK"
  // It is defined where the EventDelegator was initialized
  // You can access the event directly with "e", such as console.log(e.target)

  // Only Passes events of with tagNames defined in the array
  const id = getTargetId(e, args.tags);

  if (id) {
    if (id.match(/(pickX|pickO)/)) {
      selectChoice(id);
    } else if (id.match(/(s1|s2|s3|s4|s5|s6|s7|s8|s9)/)) {
      if (myApp.unregistered.indexOf(id) === -1) {
        turnAction(id);
      }
    }
  }
  // Stop the event from going further up the DOM
  e.stopPropagation();
}

// ======================================================================
// Delegators
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
      this.elem.className = `space center ${marker}`;
    },
    clear() {
      this.count = 0;
    }
  };
  return Observer;
}

// ======================================================================
// Observer Pattern
// ======================================================================

function createObserversById(ids, delegator, holder) {
  ids.forEach(elemId => {
    const elem = document.getElementById(elemId);
    const observer = delegator();
    observer.init(elemId, elem);
    holder.subscribe(observer);
  });
}

function SubscribersDelegator() {
  // Delegator
  const Subscribe = Object.create(null);

  Subscribe.init = function init() {
    this.observers = Object.create(null);
  };
  Subscribe.subscribe = function subscribe(observer) {
    this.observers[observer.id] = observer;
  };
  Subscribe.unsubscribe = function unsubscribe(observer) {
    // Can unsubscribe one observer, or an array of observers
    if (typeof observer === "string") {
      delete this.observers[observer];
    } else {
      observer.forEach(key => delete this.observers[key]);
    }
  };
  Subscribe.broadcast = function broadcast(func) {
    // On each object called func
    const keys = Object.keys(this.observers);
    for (let i = 0; i < keys.length; i += 1) {
      this.observers[keys[i]][func]();
    }
  };
  return Subscribe;
}

// ======================================================================
// Event Utilities
// ======================================================================

function createEvent() {
  const Event = {
    setup: function init(elem, type, args) {
      // The Element to bind the event handler too
      this.elem = elem;
      // The type of event ex: "Click"
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
      // this.bound prevents binding loss for arguments and options
      this.boundOptions = options;
      this.elem.addEventListener(this.eventType, this.boundFunc, this.boundOptions);
    },
    removeListener: function removeListener() {
      // Remove the listener, do not have to pass the "options" since it is bound
      this.elem.removeEventListener(this.eventType, this.boundFunc, this.boundOptions);
    }
  };
  return Event;
}

function EventDelegator() {
  // Creates an Event object on the element
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
  // Prevents events triggering on the parent
  if (e.target !== e.currentTarget) {
    // Returns the target Id of event for allowed tags
    if (tags.indexOf(e.target.tagName) > -1) {
      e.stopPropagation();
      return e.target.id;
    }
  }
  e.stopPropagation();
  // Returns false if no target match
  return false;
}

// Handler when the DOM is fully loaded
document.onreadystatechange = function onreadystatechange() {
  if (document.readyState === "complete") {
    myApp.initApplication(document.readyState);
  } else {
    // Do something during loading [optional]
  }
};

// ======================================================================
