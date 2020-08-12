

var socket=io("http://localhost:3000")


socket.on("server-send-dki-thatbai",function(){
   alert("Sai Username (Co nguoi dang ky roi!!)");
});
socket.on("server-send-dki-thanhcong", function(data){
   $("#currentUser").html(data);
   $("#loginForm").hide(2000);
   $("#chatForm").show(1000);
})

socket.on("server-send-danhsach-Users", function(data){
   $("#boxContent").html("");
   data.forEach(function(i){
      $("#boxContent").append("<div class='user'>" + i +"</div>");
   })
});

socket.on("server-send-message",function(data){
   $("#ListMessage").append("<div class='ms'>"+ data.un+": "+data.nd+"</div>");
});

socket.on("ai-do-dang-go-chu",function(data){
   $("#thongbao").html("<img width='20px' src='giphy.gif'>" +data);
});
socket.on("ai-do-STOP-go-chu",function(){
   $("#thongbao").html("");
});


$(document).ready(function(){
   
   $("#btnSend").click(function(){
      socket.emit("user-send-message",$("#message").val());
      
   })

   

})