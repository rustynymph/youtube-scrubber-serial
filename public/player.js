var player;
var socket = io();

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); 
window.onYouTubeIframeAPIReady = this.onYTready;
window.onYouTubeIframeAPIReady = this.onYTready.bind(this);

select = document.createElement("select");
refresh = document.createElement("button");
refresh.value = "refresh";
document.body.appendChild(select);
document.body.appendChild(refresh);

refresh.onclick = function(){
    for (i=0;i<select.length;  i++) {
        select.remove(i);
     }
    socket.emit("getportinfo", {});
};
select.onchange = function(){
    socket.emit("portselected", {'name':this.value});
};

socket.on('port', function(msg){
  select.add(new Option(msg["name"].toString(),msg["name"].toString()) );
});

function onYTready() {console.log("testing yo");}

function onYouTubeIframeAPIReady() {
    console.log("testing bitch");
    player = new YT.Player('video-placeholder', {
        width: window.innerWidth/2,
        height: window.innerHeight/2,
        videoId: '9p_Si21ig7c',
        playerVars: {
            color: 'white',
            playlist: ''
        },
        events: {
            onReady: initialize
        }
    });
}

function initialize(){

    updateTimerDisplay();
    updateProgressBar();

    // Clear any old interval.
    //clearInterval(time_update_interval);

    // Start interval to update elapsed time display and
    // the elapsed part of the progress bar every second.
    time_update_interval = setInterval(function () {
        updateTimerDisplay();
        updateProgressBar();
    }, 1000)

    socket.on('video', function(msg){
        var key = msg["key"];
        var value = msg["value"];
        console.log("key: " + key + " value: " + value);
        switch(key) {
            case "play":
                console.log("play testttt");
                player.playVideo();
                break;
            case "pause":
                player.pauseVideo();
                break;                
            case "stop":
                player.stopVideo();
                break;
            case "seek":
                player.seekTo(parseFloat(value[0]));
                break;
            case "rewind":
                var time = player.getCurrentTime();
                player.seekTo(time - parseFloat(value[0]));
                break;
            case "fastforward":
                var time = player.getCurrentTime();
                player.seekTo(time + parseFloat(value[0]));
                break;                
            case "speed":
                player.setPlaybackRate(parseFloat(value[0]));   
                break; 
            case "scaledspeed":
                player.setPlaybackRate(parseFloat(value[0])/100);   
                break;                                   
            case "id":
                player.cueVideoById(value[0]);
                break;
            case "volume":
                player.setVolume(value[0]);
                break;
            case "mute":
                switch(value[0]) {
                    case 1:
                    case "1":
                        player.mute();
                        break;
                    default:
                        player.unMute();
                }
                break;
            case "next":
                player.nextVideo();
                break;
            case "previous":
                player.previousVideo();
                break;
            default:
                break;          
        }
    });
}

function updateTimerDisplay(){
    $('#current-time').text(formatTime( player.getCurrentTime() ));
    $('#duration').text(formatTime( player.getDuration() ));
}

function formatTime(time){
    time = Math.round(time);
    var minutes = Math.floor(time / 60),
    seconds = time - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ":" + seconds;
}

$('#progress-bar').on('mouseup touchend', function (e) {
    var newTime = player.getDuration() * (e.target.value / 100);
    player.seekTo(newTime);
});

function updateProgressBar(){
    $('#progress-bar').val((player.getCurrentTime() / player.getDuration()) * 100);
}

$('#play').on('click', function () {
    player.playVideo();
});

$('#pause').on('click', function () {
    player.pauseVideo();
});

$('#mute-toggle').on('click', function() {
    var mute_toggle = $(this);
    if(player.isMuted()){
        player.unMute();
        mute_toggle.text('volume_up');
    }
    else{
        player.mute();
        mute_toggle.text('volume_off');
    }
});

$('#volume-input').on('change', function () {
    player.setVolume($(this).val());
});

$('#speed').on('change', function () {
    player.setPlaybackRate($(this).val());
});

$('#quality').on('change', function () {
    player.setPlaybackQuality($(this).val());
});

$('.thumbnail').on('click', function () {
    var url = $(this).attr('data-video-id');
    player.cueVideoById(url);
});
