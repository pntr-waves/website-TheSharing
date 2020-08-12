// khai báo
var input =  document.getElementById("sl");
var bt1 = document.getElementById("btn1");
var bt2 = document.getElementById("btn2");
var prev = document.getElementsByClassName("prev");
var next = document.getElementsByClassName("next");
// slice show
var slideIndex = 1;
showSlices(slideIndex);
// thao tác
// click vào nút trừ
bt1.addEventListener("click", bt1function);
// click vào nút cộng
bt2.addEventListener("click", bt2function);
// click vao mui ten trái phải


//thực thi
function bt1function(){
    if(input.value == 1){
        alert("Giá trị tối thiểu là 1");
    }
    else{
        input.value--;
    }
}
function bt2function(){
    input.value++;
}
// function show slices
function showSlices(n){
    var slide = document.getElementsByClassName("main-img");
    console.log(slide);
    if(n > slide.length){
        slideIndex = 1;
    }
    if(n < 1){
        slideIndex = slide.length;
    }
    for(var i = 0; i < slide.length; i++)
    {
        slide[i].style.display = "none";
    }
    slide[slideIndex -1].style.display = "block";
}
function plusSlides(n){
    showSlices(slideIndex += n);
}
