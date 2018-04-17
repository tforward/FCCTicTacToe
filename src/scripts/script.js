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

  const eventSandbox1 = document.getElementById("eventSandbox1");
  eventSandbox.initEvent(eventSandbox1, "click");

  // Create a event Observer
  myApp.subscribers = EventObservers();
  myApp.subscribers.init();

  const action1 = document.getElementById("clicks1");
  btnEventObserver("btn1", action1, myApp.subscribers);

  const action2 = document.getElementById("clicks2");
  btnEventObserver("btn2", action2, myApp.subscribers);

  // console.log(myApp.subscribers);

  defineEvents();

  // Handles all events within the Event sandbox
  eventSandbox.addEvent(eventController);
};

myApp.initApplication = function init() {
  myApp.main();
};

// ======================================================================
// Event Actions
// ======================================================================

function alertMe(x) {
  const testX = x;
  // walert("HELLO");
  console.log("finally!!!f!");
  return testX;
}

// removeIf(production)
module.exports = alertMe;
// endRemoveIf(production)

function defineEvents() {
  // Event Types:
  // Broadcast: Sends to all observers
  // Inform: Sends to only one observer, but can still share informaition within the class
  // Func: Independent function call
  myApp.events = Object.create(null);
  myApp.events["btnClear"] = { type: "broadcast", action: "clear" };
  myApp.events["btn1"] = { type: "inform", action: "add" };
  myApp.events["btn2"] = { type: "inform", action: "add" };
  myApp.events["btnAlert"] = { type: "func", action: alertMe };
}

// ======================================================================
// Event Controller
// ======================================================================

function eventController(args, e) {
  // Note: Function has access to this.elem via "this"
  // "this" being what element the event sandbox is attached to and
  // it's children.
  // To know what button was pressed just use console.log(id).
  // let {arg1, arg2, arg3} = args;

  // Only Passes events of with tagNames defined in the array
  const id = getTargetId(e, ["BUTTON"]);
  const currentEvent = myApp.events[id];

  if (currentEvent["type"] === "broadcast") {
    myApp.subscribers.broadcast(currentEvent["action"]);
  } else if (currentEvent["type"] === "inform") {
    const action = myApp.subscribers.observers[id];
    myApp.subscribers.inform(action.id, "", currentEvent["action"]);
  } else if (currentEvent["type"] === "func") {
    myApp.events[id].action();
  }

  // Stop the event from going further up the DOM
  e.stopPropagation();
}

function btnEventDelegator() {
  const Observer = {
    init(btnId, elem) {
      this.id = btnId;
      this.elem = elem;
      this.actionId = elem.id;
    },
    props() {
      this.count = 0;
    },
    add(num, data) {
      this.count += 1;
      this.elem.textContent = this.count;
      this.data = data;
    },
    clear() {
      this.elem.textContent = 0;
      this.count = 0;
    }
  };
  return Observer;
}

function btnEventObserver(btnId, elem, observers) {
  const observer = btnEventDelegator();
  observer.init(btnId, elem);
  observer.props();
  observers.subscribe(observer);
  return observer;
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

  Event.initEvent = function setup(elem, type, args) {
    this.setup(elem, type, args);
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
  if (e.target !== e.currentTarget) {
    if (tags.indexOf(e.target.tagName) > -1) {
      return e.target.id;
    }
  }
  e.stopPropagation();
  return null;
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
    const i = this.observers.indexOf(observer);
    if (i > -1) {
      this.observers.splice(i, 1);
    }
  };
  Event.inform = function inform(id, data, func) {
    // Sent to only one observer
    this.observers[id][func](id, data);
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

// Handler when the DOM is fully loaded
document.onreadystatechange = function onreadystatechange() {
  if (document.readyState === "complete") {
    myApp.initApplication(document.readyState);
  } else {
    // Do something during loading [opitional]
  }
};

// ======================================================================
