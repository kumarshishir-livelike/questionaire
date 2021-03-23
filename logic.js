const firstWidgetId = "9c90e292-be08-4563-921f-ad0e463e24cd";
const widgetAOne = "53ccba1b-d9dc-48b9-90bf-6c87401da674";
const widgetATwo = "98d389d2-9894-4c3a-bd03-89766e8b6b99";
const widgetAThree = "24d27f6d-265e-4fc9-b95f-391c8214fb01";
const widgetBOne = "2365a302-3696-4026-867f-22e85c1696e2";
const widgetBTwo = "0cf2e0da-510f-4404-93a0-4bae8795590b";
const widgetBThree = "18c034d6-ff75-42bb-8458-8085d5167f16";

const widgetAnswers = {
  [firstWidgetId]: [widgetAOne, widgetBOne],
  [widgetAOne]: widgetATwo,
  [widgetATwo]: widgetAThree,
  [widgetBOne]: widgetBTwo,
  [widgetBTwo]: widgetBThree,
};

const endState = {
  WIN: "win",
  LOSE: "lose",
};

let nextWidgetId, currentWidgetEl, widgetContainer, nextButton, loadingNextEl;

function handleEndAnimation(kind) {
  const winGif = "https://media0.giphy.com/media/iJUw3w6p25pHEwnegr/giphy.gif";
  const gifSrc = kind === endState.WIN ? winGif : "./tryagain.gif";
  nextButton.setAttribute("disabled", true);

  if (kind === endState.LOSE) {
    const animationContainer = document.querySelector(".animation-container");
    animationContainer && animationContainer.remove();
  }
  const tryAgain = `
        <div class="try-again-container">
          <div class="try-again-wrap">
            <img src="${gifSrc}">
            <button id="restartButton">Restart</button>
          </div>
        </div>
      `;
  document.body.insertAdjacentHTML("afterbegin", tryAgain);
  // Add event listener to capture restart button click
  document
    .querySelector("#restartButton")
    .addEventListener("click", () => location.reload());
}

const createWidget = (id, kind) =>
  widgetContainer.createWidgetElement({ id, kind });

function handleWidgetCreation(widgetId) {
  if (widgetId === undefined) {
    handleEndAnimation(endState.WIN);
  } else {
    nextWidgetId = null;
    currentWidgetEl = null;
    nextButton.setAttribute("disabled", true);
    createWidget(widgetId, "text-quiz");
  }
}

function handleInteraction(e) {
  // `widget` is the widgetPayload object
  // `item` is the widget option that was selected
  // `element` is the actual widget element.
  const { widget, item, element } = e.detail;
  if (item && item.id) {
    nextButton.removeAttribute("disabled");
    // We'll save the current widget element here so we can easily remove it later.
    currentWidgetEl = element;

    const selectionArr = widget.options || widget.choices;
    const selectedOptionIndex = selectionArr.findIndex((o) => o.id === item.id);

    nextWidgetId =
      widget.id === firstWidgetId
        ? widgetAnswers[widget.id][selectedOptionIndex]
        : widgetAnswers[widget.id];
  }
}

function handleNextWidget() {
  if (nextWidgetId === widgetAOne || nextWidgetId === widgetBOne) {
    currentWidgetEl.detach();
    handleWidgetCreation(nextWidgetId);
  } else {
    currentWidgetEl.results();
  }
}

function handleResults(e) {
  const elStr = `
  <div class="animation-container">
    <img src="./${e.detail.result}.gif" alt="Result animation">
  </div>
`;
  const widgetRoot = currentWidgetEl.querySelector("livelike-widget-root");
  widgetRoot.style.position = "relative";
  widgetRoot.insertAdjacentHTML("beforeend", elStr);
  setTimeout(() => {
    if (e.detail.result === "correct") {
      currentWidgetEl.detach();
      handleWidgetCreation(nextWidgetId);
    } else {
      handleEndAnimation(endState.LOSE);
    }
  }, 3300);
}

function handleWidgetDetached() {
  loadingNextEl = document.createElement("div");
  loadingNextEl.setAttribute("class", "loading-question");
  loadingNextEl.innerHTML = "Loading Next Widget";
  widgetContainer.insertAdjacentElement("afterend", loadingNextEl);
}

function handleWidgetAttached() {
  if (loadingNextEl) {
    loadingNextEl.remove();
    loadingNextEl = null;
  }
}

document.addEventListener("interacted", handleInteraction);
document.addEventListener("results", handleResults);
document.addEventListener("widgetdetached", handleWidgetDetached);
document.addEventListener("beforewidgetattached", handleWidgetAttached);
document.addEventListener("DOMContentLoaded", function() {
  // Register the custom mode, so that there's no timer.
  widgetContainer = document.querySelector("livelike-widgets");
  nextButton = document.querySelector("#nextButton");
  nextButton.addEventListener("click", handleNextWidget);
  widgetContainer.registerWidgetMode("customWidgetMode", ({ widget }) => {
    widget.widgetPayload.timeout = null;
    widget.hide_dismiss_button = true;
    return widgetContainer
      .attach(widget)
      .then(() => widget.interactive({ timeout: null }));
  });
  // Initialize the first widget when the page loads
  createWidget(firstWidgetId, "text-poll");
});
