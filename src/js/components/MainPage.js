import {select, templates} from './../settings.js';
import {utils} from './../utils.js';


class mainPage {
  constructor(id, data){
    const thisPage = this;
    
    thisPage.id = id;
    thisPage.data = data;

    thisPage.rednderInMenu();
  }

  rednderInMenu(){
    const thisPage = this;

    /*generate HTML based on template*/
    const generatedHTML = templates.mainPage(select.containerOf.mainPage);
    console.log('generatedHTML',generatedHTML);

    /*create element using utils.createElementFromHTML*/
    thisPage.element = utils.createDOMFromHTML(generatedHTML);

    /*find menu container*/
    const menuContainer = document.querySelector(select.containerOf.mainPage);

    /*add element to menu*/
    menuContainer.appendChild(thisPage.element);
  }}
  
export default mainPage; 