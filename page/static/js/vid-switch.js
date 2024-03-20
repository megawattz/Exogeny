// can you make this actually get the file names by doing a directory list of the files in the media/mp4 directory and
// keep them cached in vidarray, like this
// vidArray = getFileList("media/mp4/*.mp4") only you can do that with just javascript, python has to be used.
//. That way we can dynamically add and remove images without having to be concerned with this
// javascript.

rotateVid(); // load one immediately

setInterval(rotateVid, 20000);

function rotateVid(){
    const coverVid = document.getElementById('cover-vid')
    $.ajax({
	url: `/randomfile?directory=/app/planetor/gallery&mask=.*.mp4&count=2`,
	success: function(data) {
	    console.log(data);
	    console.log(data[0]);
	    coverVid.src = "/gallery/"+data.data[0];
	}	
    });
}
