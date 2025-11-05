const wrapper = document.querySelector(".sliderWrapper");
const menuItems = document.querySelectorAll(".menuItem");

const products = [
  {
    id: 1,
    title: "BOBA ICE CREAM",
    price: 6,
    colors: [
      {
        code: "black",
        img: "./img/Product/Boba ice cream.png"
      },
    ],
  },
  {
    id: 2,
    title: "BOBA PASSION FRUIT JUICE",
    price: 5,
    colors: [
      {
        code: "lightgray",
        img: "./img/Product/Boba Passion Fruit Juice.png"
      },
    ],
  },
  {
    id: 3,
    title: "BOBA + CHOCOLATE ICE CREAM",
    price: 9.99,
    colors: [
      {
        code: "lightgray",
        img: "./img/Product/Boba + Chocolate Ice Cream.png"
      },
    ],
  },
  {
    id: 4,
    title: "LEMONADE JUICE",
    price: 4.50,
    colors: [
      {
        code: "black",
        img: "./img/Product/Lemonade Juice.png"
      },
    ],
  },
  {
    id: 5,
    title: "MANGO + KIWI ICE CREAM",
    price: 6.66,
    colors: [
      {
        code: "gray",
        img: "./img/Product/Mango + Kiwi Ice Cream.png"
      },
    ],
  },
];

let choosenProduct = products[0];

const currentProductImg = document.querySelector(".productImg");
const currentProductTitle = document.querySelector(".productTitle");
const currentProductPrice = document.querySelector(".productPrice");
const currentProductColors = document.querySelectorAll(".color");
const currentProductSizes = document.querySelectorAll(".size");

menuItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    //change the current slide
    wrapper.style.transform = `translateX(${-100 * index}vw)`;

    //change the choosen product
    choosenProduct = products[index];

    //change texts of currentProduct
    currentProductTitle.textContent = choosenProduct.title;
    currentProductPrice.textContent = "RM" + choosenProduct.price;
    currentProductImg.src = choosenProduct.colors[0].img;

    //assign new colors
    currentProductColors.forEach((color, colorIndex) => {
      if (choosenProduct.colors[colorIndex]) {
        color.style.backgroundColor = choosenProduct.colors[colorIndex].code;
        color.style.display = "inline-block";
      } else {
        color.style.display = "none";
      }
    });
  });
});

currentProductColors.forEach((color, index) => {
  color.addEventListener("click", () => {
    if (choosenProduct.colors[index]) {
      currentProductImg.src = choosenProduct.colors[index].img;
    }
  });
});

currentProductSizes.forEach((size, index) => {
  size.addEventListener("click", () => {
    currentProductSizes.forEach((s) => {
      s.style.backgroundColor = "white";
      s.style.color = "black";
    });
    size.style.backgroundColor = "black";
    size.style.color = "white";
  });
});

const productButton = document.querySelector(".productButton");
const payment = document.querySelector(".payment");
const close = document.querySelector(".close");

productButton.addEventListener("click", () => {
  payment.style.display = "flex";
});

close.addEventListener("click", () => {
  payment.style.display = "none";
});