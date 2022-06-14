const contentContainer = document.getElementsByClassName("contentContainer")[0];
const itemListContainerTemplate = document.getElementById("itemListContainerTemplate");
const itemListTemplate = document.getElementById("itemListTemplate");
const productPageTemplate = document.getElementById("productPageTemplate");
const shoppingCartTemplate = document.getElementById("shoppingCartTemplate");
const cartItemTemplate = document.getElementById("cartItemTemplate");

const backBtn = document.getElementById("backBtn");
const cartBtn = document.getElementById("cartBtn");

let jsonData;
let shoppingCart = [];
let shoppingCartSave = localStorage.getItem("shoppingCart");

if(shoppingCartSave) shoppingCart = shoppingCartSave.split(",");

// Noen endringer her 

backBtn.style.visibility = "hidden";

fetch('https://fakestoreapi.com/products')
.then(res=>res.json())
.then(json=>{
    console.log(json);
    jsonData = json;
    
    let currentPage = localStorage.getItem("currentPage");
    
    if(currentPage){
        
        if(currentPage == "0") 
            loadProductListPage(json);

        else if (currentPage == "1"){

            if(localStorage.getItem("currentProductID")) 
                loadProductScreen(localStorage.getItem("currentProductID"));
            
            else
                loadProductListPage(json);

        }else if(currentPage == "2"){

            if(localStorage.getItem("shoppingCart")) loadShoppingCartPage();
            else loadProductListPage(json);

        }
    }else{
        loadProductListPage(json);
    }
    
});

function loadProductListPage(json){
    localStorage.setItem('currentPage', '0');
    contentContainer.innerHTML = "";
    backBtn.style.visibility = "hidden";

    let containerClone = itemListContainerTemplate.content.cloneNode(true);
    containerClone.innerHTML = "";

    for(i = 0; i < json.length; i++){
        let tempClone = itemListTemplate.content.cloneNode(true);
        tempClone.querySelector("img").src = json[i].image;
        tempClone.querySelector("h3").innerHTML = json[i].title;
        tempClone.querySelectorAll("p")[0].innerHTML = "<b>Category</b> " + json[i].category;
        tempClone.querySelectorAll("p")[1].innerHTML = "$ " + json[i].price;
        
        let itemDiv = tempClone.querySelector("div");
        itemDiv.id = json[i].id;
        itemDiv.onclick = function(){
            loadProductScreen(itemDiv.id)
            localStorage.setItem('previousPage', '0');
        }
        containerClone.querySelector("div").appendChild(tempClone);
    }
    contentContainer.appendChild(containerClone);
    
}

function loadProductScreen(productId){
    localStorage.setItem('currentPage', '1');
    localStorage.setItem('currentProductID', productId);
    contentContainer.innerHTML = "";
    backBtn.style.visibility = "visible";
    let productIndex = productId -1;
    let productPage = productPageTemplate.content.cloneNode(true);
    productPage.querySelector("img").src = jsonData[productIndex].image;
    productPage.querySelector("h1").innerHTML = jsonData[productIndex].title;
    productPage.querySelectorAll("p")[0].innerHTML = "<b>Category</b> " + jsonData[productIndex].category;
    productPage.querySelectorAll("p")[1].innerHTML = "$ " + jsonData[productIndex].price;
    productPage.querySelectorAll("p")[2].innerHTML = "Reviews (" + jsonData[productIndex].rating.count + ") " + jsonData[productIndex].rating.rate;
    
    let starContainer = productPage.querySelectorAll("div")[3];
    let visualStars = starContainer.querySelectorAll("span");
    
    for(let i = 0; i < visualStars.length; i++){
        visualStars[i].style.color = "whitesmoke";
    }

    let productRating = Math.round(jsonData[productIndex].rating.rate);

    for(let i = 0; i < productRating; i++){
        visualStars[i].style.color = "black";
    }
    
    productPage.querySelectorAll("p")[3].innerHTML = jsonData[productIndex].description;
    productPage.querySelectorAll("button")[0].onclick = function(){
        shoppingCart.push(jsonData[productIndex].id);
        localStorage.setItem("shoppingCart", shoppingCart);
        loadShoppingCartPage()
        localStorage.setItem('previousPage', '1');
    }
    let addToCartButton = productPage.querySelectorAll("button")[1];

    let addedToCart = false;

    addToCartButton.onclick = function(){
        if(!addedToCart){
            addedToCart = true;
            shoppingCart.push(jsonData[productIndex].id);
            localStorage.setItem("shoppingCart", shoppingCart);
            addToCartButton.style.transition = "1s";
            addToCartButton.style.backgroundColor = "whitesmoke";
            addToCartButton.style.color = "rgb(53, 53, 53)";
            addToCartButton.innerHTML += " Added to cart"
        }else{
            loadShoppingCartPage();
            localStorage.setItem('previousPage', '1');
        }
    }
    contentContainer.appendChild(productPage);
}

function loadShoppingCartPage(){
    localStorage.setItem('currentPage', '2');
    contentContainer.innerHTML = "";
    backBtn.style.visibility = "visible";

    let cartTempClone = shoppingCartTemplate.content.cloneNode(true);
    
    let totalPrice = 0;

    for(let i = 0; i < shoppingCart.length; i++){
        let cartItemContainer = cartItemTemplate.content.cloneNode(true);
        loadShoppingCartItem(cartItemContainer, shoppingCart[i]-1, i);
        cartTempClone.querySelectorAll("div")[1].appendChild(cartItemContainer);
        totalPrice += jsonData[shoppingCart[i]-1].price;
    }

    if(shoppingCart.length == 0){
        cartTempClone.querySelectorAll("div")[1].innerHTML = "<h3>The shooping cart is currently empty.</h3>";
        cartTempClone.querySelectorAll("div")[2].style.visibility = "hidden";
    }

    cartTempClone.querySelector("sub").innerHTML = "Subtotal: $" + totalPrice.toFixed(2);
    
    cartTempClone.querySelector("button.emptyCartBtn").onclick = function(){
        let checker = confirm("All items in the cart will be removed");
        if(checker){
            shoppingCart = [];
            localStorage.setItem("shoppingCart", "");
            loadShoppingCartPage();
        }
    }

    contentContainer.appendChild(cartTempClone);
}

function loadShoppingCartItem(container, productIndex, shoppingCartIndex){
    container.id = shoppingCartIndex;
    container.querySelector("img").src = jsonData[productIndex].image;
    container.querySelectorAll("p")[0].innerHTML = jsonData[productIndex].title;
    container.querySelectorAll("p")[1].innerHTML = "$ " + jsonData[productIndex].price;
    container.querySelector("button").onclick = function(){
        shoppingCart.splice(container.id, 1);
        localStorage.setItem("shoppingCart", shoppingCart);
        loadShoppingCartPage();
    }
}

// --- Eventlistners ----

backBtn.onclick = function(){
    let previousPage = localStorage.getItem("previousPage");
    let currentPage = localStorage.getItem("currentPage");

    if(previousPage == "0" || previousPage == currentPage) loadProductListPage(jsonData);
    else if(previousPage == "1") loadProductScreen(localStorage.getItem("currentProductID"));
}

cartBtn.onclick = function(){
    loadShoppingCartPage();
}
