var jetpack = require('fs-jetpack');
$ = jQuery = require('jquery');
var Mustache = require('mustache');
var clipboard = require('electron').clipboard;
var remote = require('electron').remote;
var cron = require('node-schedule');
// require('bootstrap');
var clipHistory = [];
var recentlyUsedSecuredClip = '';

var homeDirectory = process.env.HOME || process.env.USERPROFILE;
//return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
var filePath = homeDirectory + "/.clipManager";
if (!jetpack.exists(filePath)) {
  jetpack.copy(__dirname + '/sample.json', filePath)
}
var valueSet = jetpack.read(filePath, 'json');

var clipTemplate = $('#valueTemplate').html();
var categoryTemplate = $('#categoryTemplate').html();
var recordedClipTemplate = $('#recordedClipTemplate').html();

var loadClips = function(values) {
  if (values) {
    var isRequestForRecentClip = $('#recentClipContainer:visible').length;
    if (isRequestForRecentClip) {
      $.each(values, function(index, valueEntry) {
        valueEntry.index = index;
        var html = Mustache.to_html(recentClipsTemplate, valueEntry);
        $('div#recentClipList').append(html);
      });
    } else {
      $.each(values, function(index, valueEntry) {
        valueEntry.index = index;
        var html = Mustache.to_html(clipTemplate, valueEntry);
        if (index < 5) {
          $('div#clipboardColumn1').append(html);
        } else if (index < 10) {
          $('div#clipboardColumn2').append(html);
        }
      });
    }
  }
};

var loadCategories = function(values) {
  if (values) {
    $.each(values, function(index, value) {
      var valueEntry = {
        "index": String.fromCharCode(97 + index),
        "categoryName": value
      }
      var html = Mustache.to_html(categoryTemplate, valueEntry);
      $('div#clipboardCategory').append(html);
    });
  }
  $('a>#categorya').parent().addClass("active");
};

var onClickEvent = function() {
  var clipsByClassName = document.getElementsByClassName("clipTooltip");
  if (clipsByClassName) {
    for (var i = 0; i < clipsByClassName.length; i++) {
      clipsByClassName[i].addEventListener("click", function() {
        recentlyUsedSecuredClip = '';
        var clipData = this.getElementsByTagName("INPUT")[0].value;
        var securedClip = $(this).find("img.secured");
        if (securedClip && securedClip.length && securedClip.length > 0) {
          recentlyUsedSecuredClip = clipData;
        }
        clipboard.writeText(clipData);
        var window = remote.getCurrentWindow();
        window.hide();
      });
    }
  }
}

loadClips(valueSet.default);
loadCategories(valueSet.categories);
onClickEvent();

$(".clipTooltip").css('cursor', 'pointer');
// $("a.active").css({'color':'rebeccapurple', 'font-weight':'bold'})

document.addEventListener("keydown", keyDownTextField, false);

function keyDownTextField(e) {
  var keyCode = e.keyCode;
  console.log(keyCode);
  var window = remote.getCurrentWindow();
  if (keyCode == 27) {
    // window.close();
    console.log("Hide");
    window.hide();
  }
  if (keyCode == 192) {
    window.close();
  }
  var isRequestForRecentClip = $('#recentClipContainer:visible').length;
  if (keyCode == 82) {
    if (isRequestForRecentClip) {
      reloadRecordedClips();
    }
    recentClipListToggle();
  }
  if (keyCode >= 48 && keyCode <= 57) {
    var divId = "resultClip"
    if (isRequestForRecentClip) {
      divId = "recentResultClip";
    }
    var field = $.find("#" + divId + (keyCode - 48));
    if (field && field[0] && field[0].value) {
      clipboard.writeText(field[0].value);
      window.hide();
    }
  }
  if (!isRequestForRecentClip && ((keyCode >= 65 && keyCode <= 72) || (keyCode >= 97 && keyCode <= 104))) {
    if (keyCode >= 65 && keyCode <= 72) {
      keyCode = keyCode + 32;
    }
    var categoryList;
    var categoryName = 'a>#category' + String.fromCharCode(keyCode);
    if (valueSet && (categoryList = valueSet[$(categoryName).text()])) {
      $('.categoryItem').removeClass("active");
      $(categoryName).parent().addClass("active");
      $('div#clipboardColumn1').html("");
      $('div#clipboardColumn2').html("");
      loadClips(categoryList);
      onClickEvent();
      $(".clipTooltip").css('cursor', 'pointer');
    }
  }
}

var categoriesByClassName = document.getElementsByClassName("categoryItem");
if (categoriesByClassName) {
  for (var i = 0; i < categoriesByClassName.length; i++) {
    categoriesByClassName[i].addEventListener("click", function() {
      var clickedElement = this.getElementsByTagName("text")[0];
      $('.categoryItem').removeClass("active");
      $(clickedElement.id).parent().addClass("active");
      $('div#clipboardColumn1').html("");
      $('div#clipboardColumn2').html("");
      loadClips(valueSet[clickedElement.textContent]);
      onClickEvent();
      $(".clipTooltip").css('cursor', 'pointer');
    });
  }
}

$('#draggable').css({
  'bottom': 0,
  'position': 'fixed',
  'text-align': 'center',
  'width': '100%'
});

// $('#draggable').draggable();

var gearOnClick = function() {
  $('div').toggle();
  $('div').slideToggle('slow', 'swing')
  var window = remote.getCurrentWindow();
  window.loadURL('file://' + __dirname + '/clipConfig.html')
    // $('div').toggle();
}

var recentClipListToggle = function() {
  $('#recentClipContainer').toggle();
  //$('#toggleRecordedClips')
}
var cronJobRegister = function() {
  var rule = new cron.RecurrenceRule();
  rule.second = [0, 10, 20, 30, 40, 50];
  var sam = 0;
  cron.scheduleJob(rule, function() {

    console.log(clipHistory);

    var clipText = clipboard.readText();
    if (clipText != recentlyUsedSecuredClip && clipHistory[0] != clipText) {
      var clipIndex = clipHistory.indexOf(clipText);
      if (clipIndex != -1) {
        clipHistory.splice(clipIndex, 1);
      } else if (clipHistory.length > 9) {
        clipHistory.pop();
      }
      clipHistory.unshift(clipText);
      reloadRecordedClips();
    }
  });
}

var reloadRecordedClips = function() {
  $("div#recentClipList").empty();
  $.each(clipHistory, function(index, value) {
    var recordedValue = {}
    recordedValue.index = (index + 1) % 10;
    recordedValue.clipValue = value;
    recordedValue.clipDescription = value;
    var html = Mustache.to_html(recordedClipTemplate, recordedValue);
    $("div#recentClipList").append(html);
  })
}

var setHelpContent = function() {
  var helpContent = valueSet.helpContent;
  if (!helpContent) {
    var filePath = __dirname + '/sample.json';
    var valueSet_temp = jetpack.read(filePath, 'json');
    if (valueSet_temp) {
      helpContent = valueSet_temp.helpContent;
    }
  }
  if (helpContent) {
    $("#clipHelpInfo #clipHelpData > p").html(helpContent);
  }
}

$('#configGear')[0].addEventListener("click", gearOnClick);
$('#toggleRecordedClips').off('click').on('click', recentClipListToggle);
cronJobRegister();
setHelpContent();
// console.log("registered everything");
