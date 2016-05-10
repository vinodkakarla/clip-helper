var jetpack = require('fs-jetpack');
$ = jQuery = require('jquery');
var Mustache = require('mustache');
// var clipboard = require('clipboard');
var remote = require('remote');
var homeDirectory = process.env.HOME || process.env.USERPROFILE;
// require('bootstrap');

function keyDownTextField(e) {
  var keyCode = e.keyCode;
  //console.log(keyCode);
  var window = remote.getCurrentWindow();
  if (keyCode == 27) {
    navigate2MainPage();
  }
  if (keyCode == 192) {
    window.close();
  }
}

var navigate2MainPage = function() {
  var window = remote.getCurrentWindow();
  window.loadUrl('file://' + __dirname + '/index.html');
}

var loadCategories = function(values) {
  if (values) {
    $.each(values, function(index, value) {
      var valueEntry = {
        "categoryName": value
      };
      var categoryTemplate = $('#categoryTabTemplate').html();
      var html = Mustache.to_html(categoryTemplate, valueEntry);
      $('div#tabularMenu').append(html);
    });
  }
  $('div#tabularMenu').parent().append("<button id='addClipCategory' data-toggle='tooltip' class='glyphicon glyphicon-plus btn-success' style='margin-top: 15%;'/>");
};

var clipNode = $('#clipNode').html();

var loadClips = function(values) {
  var clipContainer = $('#clipContainer').html();
  var clipContainerHtml = Mustache.to_html(clipContainer);
  var containerNode = $(clipContainerHtml);
  if (values) {
    $.each(values, function(index, valueEntry) {
      valueEntry.index = index;
      var html = Mustache.to_html(clipNode, valueEntry);
      containerNode.append(html);
    });
  }
  $('div#clipTabContainer').append(containerNode[0].outerHTML);
};

var clipEditOnClick = function() {
  $("div.clipBox").addClass("disabled");
  var parentClipBox = $(this).parent().parent().parent("div.clipBox");
  parentClipBox.removeClass("disabled").addClass("editable");
  parentClipBox.find("div.clipInfo").css("display", "none");
  var categoryTemplate = $('#clipEditNode').html();
  var clipData = {};
  clipData.displayName = parentClipBox.find("div.displayName").text();
  clipData.description = parentClipBox.find("div.description").text();
  clipData.storedValue = parentClipBox.find("div.storedValue").text();
  if (clipData.storedValue) {
    clipData.isSecured = false;
  } else {
    clipData.isSecured = true;
    clipData.storedValue = parentClipBox.find("input.secured").val();
  }
  parentClipBox.append(Mustache.to_html(categoryTemplate, clipData));
  $("button#addClip").css("display","none");
  registerEditClipActions();
}

var clipDeleteOnClick = function() {
  $(this).closest("div.clipBox").remove();
}

var onToggleSecuredCheckBox = function() {
  if ($("input#secureCheckBox").is(":checked")) {
    $("input#editClipStoredValue").attr('type', 'password');
  } else {
    $("input#editClipStoredValue").attr('type', 'text');
  }
}

var addClipCategory = function() {
  $("div#tabularMenu").append("<div id='addClipCategoryField'><input placeholder='Category Name'><button name='ok' id='saveClipCategory'>Okie</button></div>");
  $("button#saveClipCategory").off('click').on('click', function() {
    var categoryEntry = {};
    categoryEntry.categoryName = $("div#addClipCategoryField > input:first").val();
    var categoryTemplate = $('#categoryTabTemplate').html();
    var html = Mustache.to_html(categoryTemplate, categoryEntry);
    $("div#addClipCategoryField").remove();
    $('div#tabularMenu').append(html);
  });
}

var addClipAction = function() {
  var clipContainer = $("div.kakarla-tab-content.active");
  var defaultMap = {
    "displayName": "",
    "description": "",
    "isSecured": false,
    "storedValue": ""
  };
  var categoryTemplate = $('#clipEditNode').html();
  $("div.clipBox").addClass("disabled");
  clipContainer.append("<div class='list-group-item clipBox editable'>" + Mustache.to_html(categoryTemplate, defaultMap) + "</div>");
  $("button#addClip").css("display","none");
  registerEditClipActions();
};

var registerEditClipActions = function() {
  $("div#clipEditNode button.saveClip").off("click").on("click", function() {
    var editableClipBox = $(this).parent().parent();
    var clipData = {};
    clipData.displayName = editableClipBox.find("input#editClipDisplayName").val();
    clipData.description = editableClipBox.find("input#editClipDescription").val();
    clipData.storedValue = editableClipBox.find("input#editClipStoredValue").val();
    clipData.isSecured = editableClipBox.find("input#secureCheckBox").is(":checked");
    var html = Mustache.to_html(clipNode, clipData);
    editableClipBox.parent().html($(html).html());
    $("div.clipBox").removeClass("editable");
    $("div.clipBox").removeClass("disabled");
    $("button#addClip").css("display","block");
    registerAllEvents();
  });
  $("div#clipEditNode button.removeClip").off("click").on("click", function() {
    $("div.clipBox").removeClass("disabled");
    $("div.clipBox").removeClass("editable");
    var editNode = $(this).closest("div#clipEditNode")
    if(editNode.siblings().length == 0) {
      $(this).closest("div.clipBox").remove();
    } else {
      editNode.siblings().css( "display", "block" );
      editNode.remove();
    }
    $("button#addClip").css("display","block");
  });
  $('input#secureCheckBox').off("click").on("click", onToggleSecuredCheckBox);
}

var saveClipManagerChanges = function() {
  var clipsData = {}
  var categories = [];
  $("#tabularMenu >a").each(function(index) {
    categories.push($(this).text().trim());
  });
  clipsData.categories = categories;
  $("div#clipTabContainer > div.kakarla-tab-content").each(function(index) {
    var clipList = [];
    $(this).find("div.clipBox").each(function() {
      var clip = {};
      clip.displayName = $(this).find("div.displayName").text();
      clip.description = $(this).find("div.description").text();
      var securedTag = $(this).find("input.secured");
      if (securedTag.val()) {
        clip.isSecured = true;
        clip.storedValue = securedTag.val();
      } else {
        clip.isSecured = false;
        clip.storedValue = $(this).find("div.storedValue").text();
      }
      clipList.push(clip);
    });
    clipsData[categories[index]] = clipList;
  });
  jetpack.write(homeDirectory + '/.clipManager', clipsData);
  navigate2MainPage();
}

var init = function() {
  var valueSet = jetpack.read(homeDirectory + '/.clipManager', 'json');
  loadCategories(valueSet.categories);
  if (valueSet && valueSet.categories) {
    $.each(valueSet.categories, function(index, value) {
      loadClips(valueSet[value]);
    });
  }
  $('div#clipTabContainer').append("<button id='addClip' data-toggle='tooltip' class='glyphicon glyphicon-plus btn-success'/>");
  $("#tabularMenu>a:first").addClass("active")
  $("div.kakarla-tab div.kakarla-tab-content:first").addClass("active");
  $("div.kakarla-tab-menu>div.list-group>a").click(function(e) {
    e.preventDefault();
    $(this).siblings('a.active').removeClass("active");
    $(this).addClass("active");
    var index = $(this).index();
    $("div.kakarla-tab div.kakarla-tab-content").removeClass("active");
    $("div.kakarla-tab div.kakarla-tab-content").eq(index).addClass("active");
  });
}

var registerAllEvents = function(masterReset) {
  masterReset = masterReset || true;
  $("button.editClip").off("click").on("click", clipEditOnClick);
  $("button.deleteClip").off("click").on("click", clipDeleteOnClick);
  $("div#configButtons > a#saveClipChanges").off("click").on("click", saveClipManagerChanges);
  $("div#configButtons > a#cancelClipChanges").off("click").on("click", navigate2MainPage);
  $("button#addClip").off("click").on("click", addClipAction);
  $("button#addClipCategory").off("click").on("click", addClipCategory);
}

document.addEventListener("keydown", keyDownTextField, false);
init();
registerAllEvents();
// $("button.editClip").click(clipEditOnClick);
// $("button.deleteClip").click(clipDeleteOnClick);
// $("div#configButtons > a#saveClipChanges").click(saveClipManagerChanges);
// $("button#addClip").click(addClipAction);
// $("button#addClipCategory").click(addClipCategory);
