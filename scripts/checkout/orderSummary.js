import {cart, 
  removeFromCart, 
  calculateCartQuantity,
  updateQuantity,
  updateDeliveryOption} from '../../data/cart.js';
 import {products, getProduct} from '../../data/products.js';
 import {formatCurrency} from '../Utils/money.js';
 import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
 import {deliveryOptions, getdeliveryOption} from '../../data/deliveryOptions.js';
 import { renderPaymentSummary } from './paymentSummary.js';

 
 export function renderOrderSummary(){
 
   updateCartQuantity();
 
   let cartSummaryHTML = '';
 
   cart.forEach((cartItem) => {
     const productId = cartItem.productId;
 
     const matchingProduct = getProduct(productId);
 
     const deliveryOptionId = cartItem.deliveryOptionId;

     const deliveryOption = getdeliveryOption(deliveryOptionId);
 
     const today = dayjs();
     const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
     const dateString = deliveryDate.format('dddd,MMMM D');   
 
     cartSummaryHTML += `
     <div class="cart-item-container 
     js-cart-item-container-${matchingProduct.id}">
       <div class="delivery-date">
         Delivery date: ${dateString}
       </div>
 
       <div class="cart-item-details-grid">
         <img class="product-image"
           src="${matchingProduct.image}">
 
         <div class="cart-item-details">
           <div class="product-name">
             ${matchingProduct.name}
           </div>
           <div class="product-price">
             $${formatCurrency(matchingProduct.priceCents)}
           </div>
           <div class="product-quantity">
             <span>
               Quantity: <span class="quantity-label
               js-quantity-label-${matchingProduct.id}">
               ${cartItem.quantity}</span>
             </span>
             <span class="update-quantity-link
             js-update-quantity-link link-primary"
             data-product-id="${matchingProduct.id}">
               Update
             </span>
             <input class="quantity-input js-quantity-input-${matchingProduct.id}">
             <span class="js-save-quantity-link save-quantity-link link-primary"
             data-product-id="${matchingProduct.id}">Save</span>
             <span class="delete-quantity-link link-primary js-delete-link"
             data-product-id="${matchingProduct.id}">
               Delete
             </span>
           </div>
         </div>
 
         <div class="delivery-options">
           <div class="delivery-options-title">
             Choose a delivery option:
           </div>              
           ${deliveryOptionHTML(matchingProduct, cartItem)}
         </div>
       </div>
     </div>
     `;
   });
 
   function deliveryOptionHTML(matchingProduct, cartItem){
     let html = '';
     deliveryOptions.forEach((deliveryOption) => {
       const today = dayjs();
       const deliveryDate = today.add(deliveryOption.deliveryDays, 'days')
       const dateString = deliveryDate.format('dddd,MMMM D');
       const priceString = deliveryOption.priceCents
       === 0
         ? 'Free'
         : `$${formatCurrency(deliveryOption.priceCents)}`;
         
       const isChecked = deliveryOption.id === cartItem.deliveryOptionId 
 
       html += `
       <div class="delivery-option js-delivery-option"
       data-product-id = ${matchingProduct.id}
       data-delivery-option-id = ${deliveryOption.id}>
         <input type="radio"
           ${isChecked ?'checked' :''}
           class="delivery-option-input"
           name="delivery-option-${matchingProduct.id}">
         <div>
           <div class="delivery-option-date">
             ${dateString}
           </div>
           <div class="delivery-option-price">
             ${priceString} - Shipping
           </div>
         </div>
       </div>
     `
     })
     return html;  
   }
 
   document.querySelector('.js-order-summary')
     .innerHTML = cartSummaryHTML;
 
   document.querySelectorAll('.js-delete-link')
     .forEach((link) => {
       link.addEventListener('click', () => {
         const productId = link.dataset.productId;

         removeFromCart(productId);         
         renderOrderSummary();        
         updateCartQuantity();
         renderPaymentSummary();
       });  
     });
 
     function updateCartQuantity(){
       const cartQuantity = calculateCartQuantity();
 
         document.querySelector('.js-checkout-items')
         .innerHTML = `${cartQuantity} items`;           
     }
 
     document.querySelectorAll('.js-update-quantity-link')
       .forEach((link) => {
         link.addEventListener('click', () => {
           const productId = link.dataset.productId;  
           
           const container = document.querySelector(
             `.js-cart-item-container-${productId}`
           );
           container.classList.add('is-editing-quantity')
           ;
           const quantityInput = document.querySelector
           (`.js-quantity-input-${productId}`);
           quantityInput.addEventListener('keydown',(event) => {
             if(event.key === 'Enter'){
               newQuantityInput(productId);
             }
           })           
         });  
     });  
   
     document.querySelectorAll('.js-save-quantity-link')
       .forEach((link) => {
         link.addEventListener('click', () => {
           const productId = link.dataset.productId;
           newQuantityInput(productId);
           renderPaymentSummary();
       });
     });
 
     function newQuantityInput(productId){
       const container = document.querySelector(
         `.js-cart-item-container-${productId}`
       );
       container.classList.remove('is-editing-quantity');
 
       const quantityInput = document.querySelector
       (`.js-quantity-input-${productId}`);
 
       const newQuantity = Number(quantityInput.value);
       updateQuantity(productId, newQuantity);
 
       const quantityLabel = document.querySelector(`.js-quantity-label-${productId}`); 
 
       if(newQuantity <0 || newQuantity > 1000){
         alert('Updated quantity is invalid');
         return;
       } 
         quantityLabel.innerHTML = newQuantity;      
         updateCartQuantity();
         renderOrderSummary();                                 
     }
 
     document.querySelectorAll('.js-delivery-option')
       .forEach((element) => {
         element.addEventListener('click', () =>{
           const {productId,deliveryOptionId} = element.dataset;
           updateDeliveryOption(productId, deliveryOptionId);
           //recursion
           renderOrderSummary();
           renderPaymentSummary();
         });
       });
 }    
 
 
 
    
     
     
   
   
   