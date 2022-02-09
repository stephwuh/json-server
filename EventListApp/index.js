import { appApi } from "./appApi.js";
import { fromUnixDate, toUnixDate } from "./utils.js";

//View

const View = ((convertDate) => {
  const domstr = {
    eventList: ".event-list__entry-container",
    addBtn: ".event-list__addBtn",
    pagination: ".event-list__pagination",
    nextPageBtn: ".event-list__next-page-button",
    previousPageBtn: ".event-list__previous-page-button",
  };
  const render = (element, tmp) => {
    $(element).html(tmp);
  };
  const createTmp = (arr) => {
    let tmp = "";
    arr.forEach((ele) => {
      tmp += `
              <tr id=${ele.id} class="event-list__table-row">

                <td><input type="text" class="event-list__name-${
                  ele.id
                }" value=${ele.eventName} disabled></td>
                <td><input type="date" class="event-list__start-date-${
                  ele.id
                }" value=${convertDate(ele.startDate)} disabled></td>
                <td><input type="date" class="event-list__end-date-${
                  ele.id
                }" value=${convertDate(ele.endDate)} disabled></td>
                <td><div class="button-container-${ele.id}"> 
                    <button id=${
                      ele.id
                    } class="event-list__btn_edit">EDIT</button>
                    <button id=${
                      ele.id
                    } class="event-list__btn_delete">DELETE</button>
                </div></td>
         
              
            </tr>
            `;
    });
    return tmp;
  };

  const paginationTmp = (num) => {
    let tmp = "";

    for (let i = 0; i < num; i++) {
      tmp += `
      <a class="event-list_pagination-page-number">${i + 1}</a>
      `;
    }

    return tmp;
  };

  const addRowTmp = () => {
    return `

      <td><input class="event-list__name-new" type="text"></td>
      <td><input class="event-list__start-date-new" type="date"></td>
      <td><input class="event-list__end-date-new" type="date"></td>
      <td>
        <div>
          <button id="new" class="event-list__btn_save">SAVE</button>
          <button id="new" class="event-list__btn_close">CLOSE</button>
        </div>
      </td>

    `;
  };

  const saveCloseBtnTmp = (id) => {
    return `
    <button id=${id} class="event-list__btn_save">SAVE</button>
     <button id=${id} class="event-list__btn_close">CLOSE</button>
    `;
  };

  const editDeleteBtnTmp = (id) => {
    return `
      <button id=${id} class="event-list__btn_edit">EDIT</button>
      <button id=${id} class="event-list__btn_delete">DELETE</button>
    `;
  };

  return {
    domstr,
    render,
    createTmp,
    addRowTmp,
    saveCloseBtnTmp,
    editDeleteBtnTmp,
    paginationTmp,
  };
})(fromUnixDate);

//Model

const Model = ((appApi, view) => {
  class Event {
    constructor(eventName, startDate, endDate) {
      this.eventName = eventName;
      this.startDate = startDate;
      this.endDate = endDate;
    }
  }

  class State {
    #eventList = [];

    static pageNumber = 1;
    static pagesNeeded = 1;

    get eventList() {
      return this.#eventList;
    }

    set eventList(newData) {
      this.#eventList = newData;

      const ele = $(view.domstr.eventList);
      const tmp = view.createTmp(this.#eventList);
      view.render(ele, tmp);
    }

    set pagination(pages) {
      this.pagesNeeded = pages;

      const ele = $(view.domstr.pagination);
      const tmp = view.paginationTmp(this.pagesNeeded);
      view.render(ele, tmp);
    }
  }

  const getEvents = appApi.getEvents;
  const deleteEvent = appApi.deleteEvent;
  const saveEvent = appApi.saveEvent;
  const updateEvent = appApi.updateEvent;

  return {
    Event,
    State,
    getEvents,
    deleteEvent,
    saveEvent,
    updateEvent,
  };
})(appApi, View);

//Controller

const Controller = ((model, view, convertDate) => {
  const state = new model.State();

  const eventListContainer = $(view.domstr.eventList);
  const nextPageBtn = $(view.domstr.nextPageBtn);
  const previousPageBtn = $(view.domstr.previousPageBtn);

  const init = async () => {
    let events = await model.getEvents();

    let pagesNeeded = Math.ceil(events.length / 4);

    let renderEventArr = [];

    for (let i = 1; i <= pagesNeeded; i++) {
      let startIndex = (i - 1) * 4;

      renderEventArr.push(events.slice(startIndex, startIndex + 4));
    }

    state.eventList = renderEventArr[model.State.pageNumber - 1];

    state.pagination = pagesNeeded;

    if (model.State.pageNumber === renderEventArr.length) {
      nextPageBtn.attr("disabled", "true");
    } else {
      nextPageBtn.removeAttr("disabled");
    }

    if (model.State.pageNumber === 1) {
      previousPageBtn.attr("disabled", "true");
    } else {
      previousPageBtn.removeAttr("disabled");
    }
  };

  const addEvent = () => {
    const addBtn = $(view.domstr.addBtn);

    const tableRow = $("<tr>")
      .addClass("event-list__table-row event-list__table-row_add")
      .attr("id", "new")
      .html(view.addRowTmp());

    addBtn.on("click", () => {
      eventListContainer.append(tableRow);
    });
  };

  const closeEvent = () => {
    eventListContainer.on("click", (event) => {
      if ($(event.target).attr("class") === "event-list__btn_close")
        if ($(event.target).attr("id") === "new") {
          $(".event-list__table-row_add").remove();
        } else {
          $(`.button-container-${$(event.target).attr("id")}`).html(
            view.editDeleteBtnTmp($(event.target).attr("id"))
          );

          $(`.event-list__name-${$(event.target).attr("id")}`).attr(
            "disabled",
            true
          );

          $(`.event-list__start-date-${$(event.target).attr("id")}`).attr(
            "disabled",
            true
          );

          $(`.event-list__end-date-${$(event.target).attr("id")}`).attr(
            "disabled",
            true
          );
        }
    });
  };

  const deleteEvent = () => {
    eventListContainer.on("click", (event) => {
      if ($(event.target).attr("class") === "event-list__btn_delete") {
        const buttonId = $(event.target).attr("id");
        model.deleteEvent(buttonId);

        state.eventList = state.eventList.filter((event) => {
          +event.id !== +buttonId;
        });
      }
    });
  };

  const saveEvent = () => {
    eventListContainer.on("click", (event) => {
      if ($(event.target).attr("class") === "event-list__btn_save") {
        const eventName = $(
          `.event-list__name-${$(event.target).attr("id")}`
        ).val();

        const startDate = convertDate(
          $(`.event-list__start-date-${$(event.target).attr("id")}`).val()
        );

        const endDate = convertDate(
          $(`.event-list__end-date-${$(event.target).attr("id")}`).val()
        );

        if (!eventName || !+startDate || !+endDate) {
          alert("Input all of the required fields");
          return;
        }

        const newEvent = new model.Event(eventName, startDate, endDate);

        if ($(event.target).attr("id") === "new") {
          model.saveEvent(newEvent);
        } else {
          model.updateEvent(newEvent, $(event.target).attr("id"));
        }
      }
    });
  };

  const editEvent = () => {
    eventListContainer.on("click", async (event) => {
      if ($(event.target).attr("class") === "event-list__btn_edit") {
        const buttonId = $(event.target).attr("id");

        $(`.event-list__name-${buttonId}`).removeAttr("disabled");

        $(`.event-list__start-date-${buttonId}`).removeAttr("disabled");

        $(`.event-list__end-date-${buttonId}`).removeAttr("disabled");

        $(`.button-container-${buttonId}`).html(view.saveCloseBtnTmp(buttonId));
      }
    });
  };

  const pagination = () => {
    const paginationContainer = $(view.domstr.pagination);

    paginationContainer.on("click", (event) => {
      if (
        $(event.target).attr("class") === "event-list_pagination-page-number"
      ) {
        model.State.pageNumber = +$(event.target).html();
        init();
      }
    });
  };

  const nextPage = () => {
    nextPageBtn.on("click", () => {
      model.State.pageNumber++;
      init();
    });
  };

  const previousPage = () => {
    previousPageBtn.on("click", () => {
      model.State.pageNumber--;

      init();
    });
  };

  const bootstrap = () => {
    init();
    addEvent();
    closeEvent();
    deleteEvent();
    saveEvent();
    editEvent();
    pagination();
    nextPage();
    previousPage();
  };

  return { bootstrap };
})(Model, View, toUnixDate);

Controller.bootstrap();
