



const getEventList = (async () => {

    let response = await axios.get("http://localhost:3000/events");
  
    const eventListContainer = document.querySelector(".event-list__entry-container");

  
    let tmp = "";

    const convertDate = (unixDate)=>{

        const startDate = new Date(unixDate/1000)
    
        return startDate.toISOString().split("").splice(0,10).join("")
    
    }
  
    response.data.forEach((event) => {

        const startDate = convertDate(event.startDate);
        const endDate = convertDate(event.endDate)

        tmp += `
        <tr class="event-list__table-row">
        <form>
          <td><input type="text" value=${event.eventName} disabled></td>
          <td><input type="date" value=${startDate} disabled></td>
          <td><input type="date" value=${endDate} disabled></td>
          <td><div>
              <button>EDIT</button>
              <button>DELETE</button>
          </div></td>
        </form>
        
      </tr>
      `;
      

    //   tmp += `
    //   <li>
    //       <span class="todo-list__item todo-list__item_completed" id="${todo.id}">${todo.title}</span
    //       ><span class="todo-list__delete" id="${todo.id}">x</span>
    //   </li>
//   `;
      
  
    });
  
    eventListContainer.innerHTML = tmp;
  })()