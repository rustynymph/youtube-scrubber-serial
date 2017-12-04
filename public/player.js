var player;
var socket = io();

function onYouTubeIframeAPIReady() {
    player = new YT.Player('video-placeholder', {
        width: 600,
        height: 400,
        videoId: 'mZxxhxjgnC0',
        playerVars: {
            color: 'white',
            playlist: 'GpBFOJ3R0M4,cWKi6F5jMjo'
        },
        events: {
            onReady: initialize
        }
    });

}

function initialize(){

    // Update the controls on load
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

    socket.on('osc', function(msg){
        var osc_address = msg["address"];
        var osc_values = msg["payload"];
        console.log(osc_address, osc_values);
        switch(osc_address) {
            case "/play":
                player.playVideo();
                break;
            case "/pause":
                player.pauseVideo();
                break;                
            case "/stop":
                player.stopVideo();
                break;
            case "/seek":
                player.seekTo(parseFloat(osc_values[0]));
                break;
            case "/rewind":
                var time = player.getCurrentTime();
                player.seekTo(time - parseFloat(osc_values[0]));
                break;
            case "/fastforward":
                var time = player.getCurrentTime();
                player.seekTo(time + parseFloat(osc_values[0]));
                break;                
            case "/speed":
                player.setPlaybackRate(parseFloat(osc_values[0]));
                break;
            case "/id":
                player.cueVideoById(osc_values[0]);
                break;
            case "/volume":
                player.setVolume(osc_values[0]);
                break;
            case "/mute":
                switch(osc_values[0]) {
                    case 1:
                    case "1":
                        player.mute();
                        break;
                    default:
                        player.unMute();
                }
                break;
            case "/next":
                player.nextVideo();
                break;
            case "/previous":
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
