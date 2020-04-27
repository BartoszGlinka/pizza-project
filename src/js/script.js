/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };
  
  class Product{
    constructor(id, data){
      const thisProduct = this;
      
      thisProduct.id = id;
      thisProduct.data = data;
      
      thisProduct.rednderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      
      console.log('new Product:', thisProduct);
    }
    
    rednderInMenu(){
      const thisProduct = this;
      
      /*generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /*create element using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      
      /*find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);
      
      /*add element to menu*/
      menuContainer.appendChild(thisProduct.element);
      
    }
    
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      //console.log('thisProduct.imageWrapper',thisProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      console.log(thisProduct.amountWidgetElem);
    }
    
    initAccordion(){
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      const buttonOpen = thisProduct.accordionTrigger;

      /* START: click event listener to trigger */
      buttonOpen.addEventListener('click', function(){
          
        /* prevent default action for event */
        event.preventDefault();
          
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');
          
        /* find all active products */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        //console.log('activeProducts',activeProducts);
        /* START LOOP: for each active product */
        for(let activeProduct of activeProducts){
          /* START: if the active product isn't the element of thisProduct */
          
          if(activeProduct != thisProduct.element){
            /* remove class active for the active product */
            activeProduct.classList.remove('active');
          /* END: if the active product isn't the element of thisProduct */
          }
        /* END LOOP: for each active product */
        }
      /* END: click event listener to trigger */
      });
    }
    
    initOrderForm(){
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    
    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);
      
      /* find the data price */
      let price = thisProduct.data.price;
      
      /* START LOOP: for each paramId in thisProduct.data.params */
      for(let paramId in thisProduct.data.params){
        
        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];
        
        /* START LOOP: for each optionId in param.options */
        for(let optionId in param.options){
          
          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          
          /* START IF: if option is selected and option is not default */
          if(optionSelected && !option.default){
            
            /* add price of option to variable price */
            price = price + option.price;

          /* END IF: if option is selected and option is not default */
          }
          /* START ELSE IF: if option is not selected and option is default */
          else if(!optionSelected && option.default){
            
            /* deduct price of option from price */
            price = price - option.price;

            /* END ELSE IF: if option is not selected and option is default */
          }
          /* END LOOP: for each optionId in param.options */
                  
          const addImages = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          
          //console.log('addImages', addImages);
                    
          if(optionSelected){
            for(let addImage in addImages){
              addImages.classList.add(classNames.menuProduct.imageVisible);
            }
          }
                    
          if(!optionSelected){
            for(let addImage in addImages){
              addImages.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
          
        }
        /* END LOOP: for each paramId in thisProduct.data.params */
      }
      /*multiply price by amount*/
      price *= thisProduct.amountWidget.value;
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = price;
    }
    
    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
      
    }
  }
  
  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element); 
    }
    
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    
    setValue(value){
      const thisWidget = this;
      
      const newValue = parseInt(value);
      
      /*TODO Add Validation*/
      if((thisWidget.value != newValue) && (newValue >= settings.amountWidget.defaultMin) && (newValue <= settings.amountWidget.defaultMax)){
        thisWidget.value = newValue;
        thisWidget.announce();
      }
    
      thisWidget.input.value = thisWidget.value;
    }
  
    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    
    announce(){
      const thisWidget = this;
      
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }
  
  const app = {
      
    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);
      
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    
    initData: function(){
      const thisApp = this;
      
      thisApp.data = dataSource;
    },
        
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}