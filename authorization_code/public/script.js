$(document).ready(function() {
      $('#betaTT').tipsy();

      // Global var
      var widgetTxt = '<iframe src="https://embed.spotify.com/?uri=spotify:trackset:TIMER%20TUNES:'; 
      var wl=0, wcnt=0, reset=0, btr=0;
      var access_token = '';
      var hr = 0, 
          min = 1, 
          sec = 1;

      // THREE
      function three(){
        $('#three').empty();
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 5000);
        var renderer = new THREE.WebGLRenderer();

        renderer.setSize(window.innerWidth, window.innerHeight);
        $('#three').append(renderer.domElement);

        var geometry = new THREE.BoxGeometry(1400, 1400, 1400, 10, 10, 10);
        var material = new THREE.MeshBasicMaterial({color: "rgb(50, 50, 50)", wireframe: true});
        var cube = new THREE.Mesh(geometry, material);

        scene.add(cube);
        camera.position.z = 1000;        
        function render() {
          requestAnimationFrame(render);
          cube.rotation.x += 0.0004;
          cube.rotation.y += 0.0004;
          renderer.render(scene, camera);
        };
        render();
      }
      three();

      window.onresize = three;

      // Set up drop-downs
      function dropDowns() {
        $('#secondUL').append('<li value="0"><a href="#">'+0+'</a></li>');
        for(var i=1; i<60; i++){
          $('#minuteUL').append('<li value="'+i+'"><a href="#">'+i+'</a></li>');
          $('#secondUL').append('<li value="'+i+'"><a href="#">'+i+'</a></li>');
        }
        for(var i=0; i<8; i++){
          $('#hourUL').append('<li value="'+i+'"><a href="#">'+i+'</a></li>');
        }
      }
      dropDowns();

      $(function() {
        // Set up output box
        var hrSel = new sel($('#hour')),
            minSel = new sel($('#minute')),
            secSel = new sel($('#second'));

        $(document).click(function() {
          $('.drop').removeClass('active');
        });
      });

      function sel(el) {
          this.v = el;
          this.opts = this.v.find('ul.dropUL > li');
          this.param = this.v.find('.drop').text();
          this.initEvents();
      }
      sel.prototype = {
          initEvents : function() {
              var obj = this;
              obj.v.on('click', function(event){
                  $(this).toggleClass('active');
                  event.stopPropagation();
              }); 
              obj.opts.on('click', function(event){
                  switch(obj.v.attr('id')){
                    case "hour":
                      hr = $(this).text();
                      $('#hr-text').text(function(){
                        return String(hr);
                      });
                      break;
                    case "minute":
                      min = $(this).text();
                      $('#min-text').text(function(){
                        return String(min);
                      });
                      break;
                    case "second":
                      sec = $(this).text();
                      $('#sec-text').text(function(){
                        return String(sec);
                      });
                      break;
                  }
              }); 
          }
      }

      // Fisher-Yates shuffle
      function shuffle(array) {
        var rnd, tmp, ind = array.length;
        while(ind!==0){
          rnd = Math.floor(Math.random() * ind);
          ind--;
          tmp = array[ind];
          array[ind] = array[rnd];
          array[rnd] = tmp;
        }
        return array;
      }

      // Function from David Walsh: http://davidwalsh.name/css-animation-callback
      function whichTransitionEvent(){
        var t,
            el = document.createElement("fakeelement");

        var transitions = {
          "transition"      : "transitionend",
          "OTransition"     : "oTransitionEnd",
          "MozTransition"   : "transitionend",
          "WebkitTransition": "webkitTransitionEnd"
        }

        for (t in transitions){
          if (el.style[t] !== undefined){
            return transitions[t];
          }
        }
      }

      var selectTracks = function(rs, len, totTime, selHot, selEnergy, firsttime, callback) {
        var times = [];
        var totLen = 0;
        for (var r=0; r<len; r++){
          times[r] = Math.round(rs[r].audio_summary.duration);
          totLen += times[r];
        }

        // Do we have enough songs?
        if (totLen < totTime){
          if(!firsttime){
            moreSongs(totTime, selHot, selEnergy, rs, len, callback);
            return;
          } else {
             $('#output').append("Apologies -- we did not grab enough music. Try a different request.");
          }
        }

        // Assuming we have enough, let's get close
        var M = [],
            m2 = [],
            R = [],
            r2 = [],
            o1, o2,
            tracks = [];

        totTime++;

        for(var i=0; i<totTime; i++){
          m2[i] = 0;
          r2[i] = "0";
        }
        M.push(m2);
        R.push(r2);

        for(var i=1; i<len; i++){
          m2 = [];
          r2 = [];
          for(var j=0; j<totTime; j++){
            if(j < times[i]){
              m2[j] = M[i-1][j];
              r2[j] = R[i-1][j] + "0";
            } else {
              o1 = M[i-1][j];
              o2 = times[i] + M[i-1][j-times[i]];
              if (o1 >= o2){
                m2[j] = o1;
                r2[j] = R[i-1][j] + "0";
              } else {
                m2[j] = o2;
                r2[j] = R[i-1][j-times[i]] + "1";
              }
            }
          }
          M.push(m2);
          R.push(r2);
        }
        for(var j=0; j<totTime; j++){
          if (R[len-1][totTime-1].charAt(j) == "1"){
            tracks.push(rs[j]);
          }
        }
        callback(shuffle(tracks));
      }

      var printTrack = function(r, r_dur) {
        var r_img = r.album.images[r.album.images.length - 1].url || "http://dreamatico.com/data_images/music/music-7.jpg",
          r_album_URI = r.album.uri || 0,
          r_album_name = r.album.name || "Unknown",
          r_artist_name = r.artists[0].name || "Unknown",
          r_artist_URI = r.artists[0].uri || "Unknown",
          r_song_URI = r.uri || 0,
          r_id = r.id || 0,
          r_song_name = r.name || "Unknown";
        var txt = '<div class="media">' +
          '<a class="pull-left" href="#"><img class="media-object" src="' + r_img + '" /></a>' +
          '<div class="media-body">' +
          '<h4 class="media-heading song-name"><a href="' + r_song_URI + '">' + r_song_name + ' (' + r_dur + ' sec)' + '</a></h4>' +
          'Artist: <a href="' + r_artist_URI + '">' + r_artist_name +'</a><br>' +
          'Album: <a href="' + r_album_URI + '">' + r_album_name + '</a>' +
          '</div>' +
          '</div><br>\n';        

        $('#output').append(txt);
        widgetTxt += r_id + ',';
      }


      var showTracks = function(rs, callback) {
        var k=0;
        for(var i in rs){
          var en_r = rs[i];
          var url = 'https://api.spotify.com/v1/search?type=track&limit=1&q='+en_r.title +' '+ en_r.artist_name;

          $.ajax(url, {
            dataType: 'json',
            success: function(res) {
              callback(res.tracks.items[0], Math.round(rs[wcnt++].audio_summary.duration));
            },
            error: function(res) {
              $('#output').append("Sorry! An error has occurred. Please try again with a different request.");
              callback(null, null);
            }
          });
        }
      }


      var findSongs = function(totTime, selHot, selEnergy, callback) {
        var minEnergy = Number(selEnergy) - 0.1,
            maxEnergy = Number(selEnergy) + 0.1;
        minEnergy = (minEnergy > 0) ? minEnergy : 0;
        maxEnergy = (maxEnergy < 1) ? maxEnergy : 1;

        var buckets = '&bucket=audio_summary&bucket=artist_discovery_rank&bucket=artist_familiarity_rank';

        var url = 'http://developer.echonest.com/api/v4/song/search?api_key=TCBNV01L0WKIP1NDF&format=json&results=100&rank_type=familiarity&sort=song_hotttnesss-desc&song_min_hotttnesss='+selHot+'&min_duration=60&max_duration='+totTime+'&min_energy='+minEnergy+'&max_energy='+maxEnergy+buckets;

        $.ajax(url, {
          format: 'json',
          api_key: 'TCBNV01L0WKIP1NDF',
          success: function(r) {
            var len = r.response.songs.length;
            callback(r.response.songs, len, totTime, selHot, selEnergy, 0);
          },
          error: function(r) {
            $('#output').append("Sorry! An error has occurred. Please try again with a different request.");
            callback(null, null, null, null, null, null);
          }
        });
      }

      var moreSongs = function(totTime, selHot, selEnergy, rs, len, callback) {
        var moreResults = [],
            moreLen = 0;

        var minEnergy = Number(selEnergy) - 0.3,
            maxEnergy = Number(selEnergy) - 0.1;
        minEnergy = (minEnergy > 0) ? minEnergy : 0;
        maxEnergy = (maxEnergy < 1) ? maxEnergy : 1;

        var buckets = '&bucket=audio_summary&bucket=artist_discovery_rank&bucket=artist_familiarity_rank';

        for (var i=0; i<2; i++){
          var url = 'http://developer.echonest.com/api/v4/song/search?api_key=TCBNV01L0WKIP1NDF&format=json&results=100&rank_type=familiarity&sort=duration-asc&song_min_hotttnesss='+selHot+'&max_duration='+totTime+'&min_energy='+minEnergy+'&max_energy='+maxEnergy+buckets;

          $.ajax(url, {
            format: 'json',
            api_key: 'TCBNV01L0WKIP1NDF',
            success: function(r) {
              moreLen = r.response.songs.length;
              if(moreLen != 0){
                moreResults = r.response.songs;
                for(r in rs){
                  moreResults.push(rs[r]);
                }
                selectTracks(moreResults, len+moreLen, totTime, selHot, selEnergy, 1, callback);
                return;
              } else{
                minEnergy = Number(selEnergy) + 0.1;
                maxEnergy = Number(selEnergy) + 0.3;
              }
            },
            error: function(r) {
              console.log("Echonest error");
            }
          });
        }        
      }

      var setJQ = function(r, r_dur, tracks, callback) {
        printTrack(r, r_dur);
        if(wcnt>=tracks.length && wl==0){
            $('.onSel').show();
            $('#info').addClass('small');
            $('#over').css({top: '2%'});
            $('#output').css({border: '0.5px dashed #bbb'});
            $('.br-below').css({'margin-bottom': '0px'});
        }
        if(btr==0){
          $('#btrig').css({height: '4px'});
        } else{
          $('#btrig').css({height: '3px'});
        }
        callback();
      }

      var resizeOutput = function(){
        var innHt = Number(window.innerHeight);
        var offsetRes = $('#output').offset().top;
        var htRes = Number(innHt - offsetRes - 10);
        $('#output').css({height: htRes +'px'});
        wl=1;
        var wWidth = $('#widget').css('width');
        wWidth = Number(wWidth.substring(0, wWidth.length - 2));
        var plWidth = 200;
        if (wWidth > 300 && htRes > 380){
          plWidth = 300;
        }
        widgetTxt = widgetTxt.substring(0, widgetTxt.length - 1) +'&view=coverart" width="'+
          plWidth+'" height="'+(plWidth+80)+'" frameborder="0" allowtransparency="true"></iframe>';
        $('#widget').empty();
        $('#widget').append(widgetTxt);

      }

      $('#timer-val').submit(function (e) {
          e.preventDefault();
          $('#output').empty();
          wl=0;
          wcnt=0;
          widgetTxt = '<iframe src="https://embed.spotify.com/?uri=spotify:trackset:TIMER%20TUNES:'; 

          var inHr = Number(hr) || 0,
              inMin = Number(min) || 1,
              inSec = Number(sec) || 1,
              inEnergy = $('#energy').val();
          var inputSecs = inSec + (inMin * 60) + (inHr * 3600);
          if(inputSecs==60 || inputSecs == 61){
            inputSecs = 61;
            $('#hr-text').text('0');
            $('#min-text').text('1');
            $('#sec-text').text('1');
          }

          function run (callback) {
            findSongs(inputSecs, 0.2, inEnergy, function(rs, len, totTime, selHot, selEnergy, firsttime){
                selectTracks(rs, len, totTime, selHot, selEnergy, firsttime, function(tracks){
                  showTracks(tracks, function(r, r_dur){
                      setJQ(r, r_dur, tracks, function(){
                        return;
                      });
                  });
                });
            });
            callback();
          }

          run(function(){
            // Set up output box
            if (btr==0){
              btr=1;
            } else{
              btr=0;
            }
            var transitionEvent = whichTransitionEvent();
            if (reset==1){
              $('#btrig').one(transitionEvent, resizeOutput);
            } else {
              $('#info').one(transitionEvent, resizeOutput);
            }
            reset = 1;
          });
      });
    });