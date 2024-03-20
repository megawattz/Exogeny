// can you make this actually get the file names by doing a directory list of the files in the media/mp4 directory and
// keep them cached in vidarray, like this
// vidArray = getFileList("media/mp4/*.mp4") only you can do that with just javascript, python has to be used.
//. That way we can dynamically add and remove images without having to be concerned with this
// javascript.

var vidArray = <py>userfuncs.dirlist("gallery",".*.mp4$")</py>

rotateVid(); // load one immediately

setInterval(rotateVid, 20000);  // setInterval was being called 

function rotateVid(){
	const coverVid = document.getElementById('cover-vid')
	$(document).ready(function() {
		$("#cover-vid").css('opacity', 0).animate( { opacity: 1 }, 1500)
	});
	const randomVid = Math.floor(Math.random() * vidArray.length);
	coverVid.src = "../gallery/"+vidArray[randomVid];
}
