// khai báo
var input =  document.getElementById("sl");
var bt1 = document.getElementById("btn1");
var bt2 = document.getElementById("btn2");
// thao tác
// click vào nút trừ
bt1.addEventListener("click", bt1function);
// click vào nút cộng
bt2.addEventListener("click", bt2function);

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