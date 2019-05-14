let frame = document.getElementsByClassName("you");
// alert("you got it!")
Array.from(frame).forEach(function(element) {
      element.addEventListener('click', function(){

          let picture = this.getAttribute("data-pictures")

        console.log("source: ", picture)

        document.getElementById("main").src = picture;

      });
});
