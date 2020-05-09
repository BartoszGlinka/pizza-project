import {select, templates} from './../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
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
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount= new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  } 
}

export default Booking;