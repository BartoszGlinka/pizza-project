import {select, templates, settings, classNames} from './../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import {utils} from './../utils.js';

class Booking {
  constructor(element){
    const thisBooking = this;
    
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.reservation();
    
    thisBooking.booked = [];
    thisBooking.form = thisBooking.dom.wrapper.querySelector(select.booking.bookingForm);
    
    thisBooking.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });
  } 
  
  getData(){
    const thisBooking = this;
    
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);   
    
    const params = {
      booking: [
        startDateParam,
        endDateParam, 
      ],    
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam, 
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam, 
      ], 
    };
    
    //console.log('getData params', params);
    
    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking 
                                    + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event   
                                    + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event   
                                    + '?' + params.eventsRepeat.join('&'),
    };
    //console.log('getData urls', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(), 
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    
    thisBooking.booked = {};
    
    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    
    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    //console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }
  
  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }
    
    const startHour = utils.hourToNumber(hour);
    
    if(typeof thisBooking.booked[date][startHour] == 'undefined'){
      thisBooking.booked[date][startHour] = [];
    }
    
    thisBooking.booked[date][startHour].push(table);
    
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop', hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
    
      thisBooking.booked[date][hourBlock].push(table);
    }  
  }
  
  updateDOM(){
    const thisBooking = this;
    
    thisBooking.amountPeople = document.querySelector(select.booking.valueOfPeopleAmount);
    thisBooking.hoursAmount = document.querySelector(select.booking.valueOfHoursAmount);
    thisBooking.starters = document.querySelectorAll(select.booking.starters);
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    thisBooking.adress = document.querySelector(select.booking.adress);
    thisBooking.phone = document.querySelector(select.booking.phone);
    
    let allAvailable = false;
    
    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }
    
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        thisBooking.selectedTable = {};
      }
    }
  }
  
  render(element){
    const thisBooking = this;
    /*generate HTML by templates.bookingWidget */
    const generatedHTML = templates.bookingWidget();

    /*create empty object thisBooking.dom */
    thisBooking.dom = {};
    /*add to thisBooking.dom property wrapper equal to element  */
    thisBooking.dom.wrapper = element;

    /*change content of wrapper to code HTML by templates.bookingWidget  */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    /*in thisBooking.dom.peopleAmount register element find in property wrapper and matching to selector select.booking.peopleAmount  */
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    /*in thisBooking.dom.hoursAmount register element find in property wrapper and matching to selector select.booking.hoursAmount */
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    
    thisBooking.selectedTable = {};
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount= new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  }
  
  reservation(){
    const thisBooking = this;
    
    for(let i = 0 ; i < thisBooking.dom.tables.length; i++ )
      thisBooking.dom.tables[i].addEventListener('click', function(event){
        event.preventDefault();
        //const selectedTable = thisBooking.dom.tables[i].getAttribute(settings.booking.tableIdAttribute);
    
        const classOfTable = thisBooking.dom.tables[i].getAttribute('class');
        
        if(!classOfTable.includes('booked')){ 
          thisBooking.dom.tables[i].classList.add(classNames.booking.tableBooked);

          thisBooking.selectedTable = thisBooking.dom.tables[i].getAttribute(settings.booking.tableIdAttribute);
        }
      });
  }
  
  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      dayBooked: thisBooking.date,
      timeBooked: thisBooking.hour,
      tableBooked: thisBooking.selectedTable,
      amountPeople: thisBooking.amountPeople.value,
      amountHours : thisBooking.hoursAmount.value,
      starters: thisBooking.starters,
      address: thisBooking.adress.value,
      phone: thisBooking.phone.value,
      
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();      
      }).then(function(parsedResponse){
        console.log('parsedResponse',parsedResponse);
      });
     
  }
}

export default Booking;