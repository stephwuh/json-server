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
    element.innerHTML = tmp;
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

      const ele = document.querySelector(view.domstr.eventList);
      const tmp = view.createTmp(this.#eventList);
      view.render(ele, tmp);
    }

    set pagination(pages) {
      this.pagesNeeded = pages;

      const ele = document.querySelector(view.domstr.pagination);
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

  const eventListContainer = document.querySelector(view.domstr.eventList);
  const nextPageBtn = document.querySelector(view.domstr.nextPageBtn);
  const previousPageBtn = document.querySelector(view.domstr.previousPageBtn);

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
      nextPageBtn.setAttribute("disabled", "true");
    } else {
      nextPageBtn.removeAttribute("disabled");
    }

    if (model.State.pageNumber === 1) {
      previousPageBtn.setAttribute("disabled", "true");
    } else {
      previousPageBtn.removeAttribute("disabled");
    }
  };

  const addEvent = () => {
    const addBtn = document.querySelector(view.domstr.addBtn);

    const tableRow = document.createElement("tr");
    tableRow.className = "event-list__table-row";
    tableRow.id = "new";
    tableRow.innerHTML = view.addRowTmp();

    addBtn.addEventListener("click", () => {
      eventListContainer.appendChild(tableRow);
    });
  };

  const closeEvent = () => {
    eventListContainer.addEventListener("click", (event) => {
      if (event.target.classList[0] === "event-list__btn_close")
        if (event.target.getAttribute("id") === "new") {
          //code for pre-existing event
          eventListContainer.removeChild(eventListContainer.lastChild);
        } else {
          document.querySelector(
            `.button-container-${event.target.getAttribute("id")}`
          ).innerHTML = view.editDeleteBtnTmp(event.target.getAttribute("id"));

          document
            .querySelector(
              `.event-list__name-${event.target.getAttribute("id")}`
            )
            .setAttribute("disabled", true);

          document
            .querySelector(
              `.event-list__start-date-${event.target.getAttribute("id")}`
            )
            .setAttribute("disabled", true);

          document
            .querySelector(
              `.event-list__end-date-${event.target.getAttribute("id")}`
            )
            .setAttribute("disabled", true);
        }
    });
  };

  const deleteEvent = () => {
    eventListContainer.addEventListener("click", (event) => {
      if (event.target.classList[0] === "event-list__btn_delete") {
        const buttonId = event.target.getAttribute("id");
        model.deleteEvent(buttonId);

        state.eventList = state.eventList.filter((event) => {
          +event.id !== +buttonId;
        });
      }
    });
  };

  const saveEvent = () => {
    eventListContainer.addEventListener("click", (event) => {
      if (event.target.classList[0] === "event-list__btn_save") {
        const eventName = document.querySelector(
          `.event-list__name-${event.target.getAttribute("id")}`
        ).value;

        const startDate = convertDate(
          document.querySelector(
            `.event-list__start-date-${event.target.getAttribute("id")}`
          ).value
        );

        const endDate = convertDate(
          document.querySelector(
            `.event-list__end-date-${event.target.getAttribute("id")}`
          ).value
        );

        if (!eventName || !+startDate || !+endDate) {
          alert("Input all of the required fields");
          return;
        }

        const newEvent = new model.Event(eventName, startDate, endDate);

        if (event.target.getAttribute("id") === "new") {
          model.saveEvent(newEvent);
        } else {
          model.updateEvent(newEvent, event.target.getAttribute("id"));
        }
      }
    });
  };

  const editEvent = () => {
    eventListContainer.addEventListener("click", async (event) => {
      if (event.target.classList[0] === "event-list__btn_edit") {
        const buttonId = event.target.getAttribute("id");

        document
          .getElementById(buttonId)
          .querySelector(`.event-list__name-${buttonId}`)
          .removeAttribute("disabled");

        document
          .getElementById(buttonId)
          .querySelector(`.event-list__start-date-${buttonId}`)
          .removeAttribute("disabled");

        document
          .getElementById(buttonId)
          .querySelector(`.event-list__end-date-${buttonId}`)
          .removeAttribute("disabled");

        document.querySelector(`.button-container-${buttonId}`).innerHTML =
          view.saveCloseBtnTmp(buttonId);
      }
    });
  };

  const pagination = () => {
    const paginationContainer = document.querySelector(view.domstr.pagination);

    paginationContainer.addEventListener("click", (event) => {
      if (event.target.classList[0] === "event-list_pagination-page-number") {
        model.State.pageNumber = +event.target.innerHTML;

        init();
      }
    });
  };

  const nextPage = () => {
    nextPageBtn.addEventListener("click", () => {
      model.State.pageNumber++;
      init();
    });
  };

  const previousPage = () => {
    previousPageBtn.addEventListener("click", () => {
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// const eventListContainer = document.querySelector(
//   ".event-list__entry-container"
// );
// const paginationContainer = document.querySelector(".event-list__pagination");
// const nextPageBtn = document.querySelector(".event-list__next-page-button");
// const previousPageBtn = document.querySelector(
//   ".event-list__previous-page-button"
// );

// let pageNumber = 1;

// const getEventList = async (appApi, convertDate) => {
//   //events from JSON server
//   const events = await appApi.getEvents();

//   let tmpEvent = "";
//   let tmpPagination = "";

//   let pagesNeeded = Math.ceil(events.length / 4);

//   let renderEventArr = [];

//   for (let i = 1; i <= pagesNeeded; i++) {
//     let startIndex = (i - 1) * 4;

//     renderEventArr.push(events.slice(startIndex, startIndex + 4));
//   }

//   renderEventArr[pageNumber - 1].forEach((event) => {
//     const startDate = convertDate(event.startDate);
//     const endDate = convertDate(event.endDate);

//     tmpEvent += `
//         <tr id=${event.id} class="event-list__table-row">
//         <form>
//           <td><input type="text" class="event-list__name-${event.id}" value=${event.eventName} disabled></td>
//           <td><input type="date" class="event-list__start-date-${event.id}" value=${startDate} disabled></td>
//           <td><input type="date" class="event-list__end-date-${event.id}" value=${endDate} disabled></td>
//           <td><div class="button-container-${event.id}">
//               <button id=${event.id} class="event-list__btn_edit">EDIT</button>
//               <button id=${event.id} class="event-list__btn_delete">DELETE</button>
//           </div></td>
//         </form>

//       </tr>
//       `;
//   });

//   renderEventArr.forEach((event, index) => {
//     tmpPagination += `
//     <a class="event-list_pagination-page-number">${index + 1}</a>
//     `;
//   });

//   if (pageNumber === 1) {
//     previousPageBtn.setAttribute("disabled", "true");
//   } else {
//     previousPageBtn.removeAttribute("disabled");
//   }

//   if (pageNumber === renderEventArr.length) {
//     nextPageBtn.setAttribute("disabled", "true");
//   } else {
//     nextPageBtn.removeAttribute("disabled");
//   }

//   eventListContainer.innerHTML = tmpEvent;
//   paginationContainer.innerHTML = tmpPagination;
// };

// getEventList(appApi, fromUnixDate);

// const pagination = (() => {
//   const paginationContainer = document.querySelector(".event-list__pagination");

//   paginationContainer.addEventListener("click", (event) => {
//     pageNumber = +event.target.innerHTML;
//     getEventList(appApi, fromUnixDate);
//   });
// })();

// const nextPage = (() => {
//   nextPageBtn.addEventListener("click", () => {
//     pageNumber++;
//     getEventList(appApi, fromUnixDate);
//   });
// })();

// const previousPage = (() => {
//   previousPageBtn.addEventListener("click", () => {
//     pageNumber--;

//     getEventList(appApi, fromUnixDate);
//   });
// })();

// const addEvent = (() => {
//   const addBtn = document.querySelector(".event-list__addBtn");

//   //creating a table row for new event
//   const tableRow = document.createElement("tr");
//   tableRow.className = "event-list__table-row event-list__table-row_add";
//   tableRow.innerHTML = `
//     <form>
//             <td><input class="new-event-name" type="text"></td>
//             <td><input class="new-event-start-date" type="date"></td>
//             <td><input class="new-event-end-date" type="date"></td>
//             <td><div>
//                 <button class="event-list__btn_save">SAVE</button>
//                 <button class="event-list__btn_close">CLOSE</button>
//             </div></td>
//           </form>
//     `;

//   addBtn.addEventListener("click", () => {
//     eventListContainer.appendChild(tableRow);
//   });
// })();

// const closeEvent = (() => {
//   eventListContainer.addEventListener("click", (event) => {
//     if (event.target.classList[0] === "event-list__btn_close") {
//       //code for pre-existing event
//       if (event.target.getAttribute("id")) {
//         window.location.reload();

//         // const buttonContainer = (document.querySelector(
//         //   `.button-container-${event.target.getAttribute("id")}`
//         // ).innerHTML = `
//         //       <button id=${event.target.getAttribute(
//         //         "id"
//         //       )} class="event-list__btn_edit">EDIT</button>
//         //       <button id=${event.target.getAttribute(
//         //         "id"
//         //       )} class="event-list__btn_delete">DELETE</button>
//         //         `);

//         // const eventName = document
//         //   .querySelector(`.event-list__name-${event.target.getAttribute("id")}`)
//         //   .setAttribute("disabled", true);

//         // const startDate = document
//         //   .querySelector(
//         //     `.event-list__start-date-${event.target.getAttribute("id")}`
//         //   )
//         //   .setAttribute("disabled", true);

//         // const endDate = document
//         //   .querySelector(
//         //     `.event-list__end-date-${event.target.getAttribute("id")}`
//         //   )
//         //   .setAttribute("disabled", true);
//       } else {
//         //code for new event
//         eventListContainer.removeChild(eventListContainer.lastChild);
//       }
//     }
//   });
// })();

// class Event {
//   constructor(eventName, startDate, endDate) {
//     this.eventName = eventName;
//     this.startDate = startDate;
//     this.endDate = endDate;
//   }
// }

// const saveEvent = ((appApi, convertDate) => {
//   eventListContainer.addEventListener("click", async (event) => {
//     if (event.target.classList[0] === "event-list__btn_save") {
//       // code for updating event
//       if (event.target.getAttribute("id")) {
//         const eventName = document.querySelector(
//           `.event-list__name-${event.target.getAttribute("id")}`
//         ).value;

//         const startDate = convertDate(
//           document.querySelector(
//             `.event-list__start-date-${event.target.getAttribute("id")}`
//           ).value
//         );

//         const endDate = convertDate(
//           document.querySelector(
//             `.event-list__end-date-${event.target.getAttribute("id")}`
//           ).value
//         );

//         if (!eventName || !+startDate || !+endDate) {
//           alert("Input all of the required fields");
//           return;
//         }

//         const updateEvent = {
//           eventName,
//           startDate,
//           endDate,
//           id: event.target.getAttribute("id"),
//         };
//         appApi.updateEvent(updateEvent);
//       } else {
//         //code for saving new event
//         const eventName = document.querySelector(".new-event-name").value;

//         let startDate = convertDate(
//           document.querySelector(".new-event-start-date").value
//         );

//         let endDate = convertDate(
//           document.querySelector(".new-event-end-date").value
//         );

//         if (!eventName || !+startDate || !+endDate) {
//           alert("Input all of the required fields");
//           return;
//         }
//         const event = new Event(eventName, startDate, endDate);

//         await appApi.saveEvent(event);
//       }
//     }
//   });
// })(appApi, toUnixDate);

// const deleteEvent = ((appApi) => {
//   eventListContainer.addEventListener("click", async (event) => {
//     if (event.target.classList[0] === "event-list__btn_delete") {
//       const buttonId = event.target.getAttribute("id");

//       await appApi.deleteEvent(buttonId);
//     }
//   });
// })(appApi);

// const editEvent = (() => {
//   eventListContainer.addEventListener("click", async (event) => {
//     if (event.target.classList[0] === "event-list__btn_edit") {
//       const buttonId = event.target.getAttribute("id");

//       const eventName = document
//         .getElementById(buttonId)
//         .querySelector(`.event-list__name-${buttonId}`)
//         .removeAttribute("disabled");

//       const startDate = document
//         .getElementById(buttonId)
//         .querySelector(`.event-list__start-date-${buttonId}`)
//         .removeAttribute("disabled");

//       const endDate = document
//         .getElementById(buttonId)
//         .querySelector(`.event-list__end-date-${buttonId}`)
//         .removeAttribute("disabled");

//       const buttonContainer = (document.querySelector(
//         `.button-container-${buttonId}`
//       ).innerHTML = `
//         <button id=${buttonId} class="event-list__btn_save">SAVE</button>
//          <button id=${buttonId} class="event-list__btn_close">CLOSE</button>
//         `);
//     }
//   });
// })();
