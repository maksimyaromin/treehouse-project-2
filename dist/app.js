//import source from "./source/students.json";
{
  /* Simple realization of float placeholder. In real life project
     you would surely like to analyze whether the field has a value from the start.
     But I consider it needless for our example.
  */
  var activePlaceholder = function activePlaceholder(element) {
    var action = function action() {
      if (element.val()) {
        element.addClass("fill");
      } else {
        element.removeClass("fill");
      }
    };

    element.on("blur clear-search-field", action);
  };
  /* Array realization logics encapsulated in jQuery-extension.
     i.e. the task is realized as a simple jQuery-plugin.
  */


  $.fn.listItems = function (options) {
    // Default settings
    var defaultOptions = {
      total: 10,
      enabledSearchBox: true,
      searchPlaceholder: "Start entering name or email",
      noData: "<div class=\"no-students\">\n                    <span>Sorry, no princes here</span>\n                </div>"
    };
    options = Object.assign({}, defaultOptions, options); // Some global for plugin variables 

    var context = this;
    var pagerContext = null;
    var listContext = context.find("ul");
    var noData = $(options.noData);
    var hasPager = false;
    var source = context.find(options.itemSelector);
    /* Application status. Let's pay some respect to React, as far as after long practice with it 
       my hands automatically long to realize logics in that way.
    */

    var state = {
      page: 0,
      oldPage: 0,
      source: source,
      total: 0,
      totalPages: 0
    };
    /* To make it more simple some plugin helper methods encapsulated into separate name space. 
    */

    var API = {
      /* Search field mapping. In my example I decided not to make a search button (hope, is not a
         too big violation of task conditions). I made a simple autocomplete here.
      */
      buildSearchBox: function buildSearchBox() {
        var _this = this;

        if (!this.hasSource()) {
          return;
        }

        var searchBox = $("<div class=\"search-box\">\n                        <form action=\"#\" class=\"search-box__form\">\n                            <div class=\"search-box__input\">\n                                <input type=\"search\" name=\"search\" id=\"search\" />\n                                <span class=\"active-placeholder\">".concat(options.searchPlaceholder, "</span>\n                            </div>\n                        </form>\n                    </div>"));
        context.before(searchBox);
        var search = searchBox.find("[type=\"search\"], [type=\"text\"]");
        activePlaceholder(search); // Just in case it is better to disable form submission on Enter button pressing

        searchBox.find("form").on("keyup keypress", function (e) {
          var keyCode = e.keyCode || e.which;

          if (keyCode === 13) {
            e.preventDefault();
            return false;
          }
        });
        /* Search logics. On input event expiration if a certain value entered 
            then we start searching for  matching among names and e-mails. If the value is empty then  
            a source list is displaying. Of course in real life project you might want to limit search start with
            a certain quantity of symbols or call frequency by using kind of debounce method.  But
            I didn't implement it here. By the way I am aware of input event doesn't work in old version IE and
            there exist onpropertychange to resolve it, but we shouldn't focus on IE8 in our 2018. 
            IMPORTANT: filter searches by  letter combination entered (I just consider it to be more interesting)
        */

        search.on("input", function (e) {
          var value = $(e.target).val();

          if (value) {
            var result = source.filter(function (index, element) {
              element = $(element);
              var name = element.find("[class*=\"name\"]").text().trim();
              var email = element.find("[class*=\"email\"]").text().trim();
              var pattern = new RegExp(value, "i");
              return pattern.test(name) || pattern.test(email);
            });
            var newState = {
              source: result,
              page: 0
            };
            /*Save selected page to return to it when a user cleans a search field 
            */

            if (state.page) {
              newState.oldPage = state.page;
            }

            state = Object.assign({}, state, newState);

            _this.build();
          } else {
            state = Object.assign({}, state, {
              source: source,
              page: state.oldPage
            });

            _this.build();
          }
        });
      },

      /* Build pagination in case of need (i.e.the data array is more than for one page).
         Build is based on object current state 
      */
      buildPager: function buildPager() {
        var pager = "<div class=\"pager-box\">\n                        <ol class=\"pager\">[pages]</ol>\n                        <div class=\"pager__range-mark\">\n                            <span class=\"range\"></span>\n                            <span>out of</span>\n                            <span class=\"count\">".concat(state.total, "</span>\n                        </div>\n                    </div>");
        var pages = "";

        for (var i = 0; i < state.totalPages; i++) {
          pages += "<li class=\"page".concat(i === state.page ? " state_active" : "", "\" data-page=\"").concat(i, "\">\n                            ").concat(i + 1, "\n                        </li>");
        }

        pager = pager.replace(/\[pages\]/i, pages);
        context.after(pager);
        pagerContext = $(".pager-box");
      },

      /* Deleting programmatically created elements from DOM and cleaning global variables 
      before list rebuild
      */
      clear: function clear() {
        if (hasPager && pagerContext) {
          pagerContext.remove();
          hasPager = false;
          pagerContext = null;
        }
      },
      // Hide all items before control was builded
      hideItems: function hideItems() {
        source.remove();
      },
      // Show items on selected page
      showItems: function showItems() {
        var lastIndex = state.total - 1;
        var startIndex = state.page * options.total;
        var endIndex = startIndex + options.total - 1;

        if (endIndex > lastIndex) {
          endIndex = lastIndex;
        }

        for (var i = startIndex; i <= endIndex; i++) {
          listContext.append(state.source[i]);
        }

        if (hasPager) {
          var markRange = pagerContext.find(".range");
          markRange.text("".concat(startIndex + 1, " - ").concat(endIndex + 1));
        }
      },
      // Add possible events for the list (i.e. page transitions)
      bindListEvents: function bindListEvents() {
        var _this2 = this;

        if (hasPager) {
          var pages = pagerContext.find(".page");
          pages.click(function (e) {
            pages.removeClass("state_active");
            var page = $(e.target).closest("li");
            page.addClass("state_active");
            state = Object.assign({}, state, {
              page: page.data("page")
            });

            _this2.hideItems();

            _this2.showItems();
          });
        }
      },

      /* Does a state have any elements to display? Here I dodged a bit. The method is called twice:
         each time when a new list is building and when search field is being depicted. Search field 
         is displaying only once, that is why the method will return true only if set of element  is more than null.
      */
      hasSource: function hasSource() {
        return state.source.length;
      },
      // Call all needed methods and display list
      build: function build() {
        this.clear();

        if (!this.hasSource()) {
          listContext.hide();
          return noData.appendTo(context);
        } else {
          noData.remove();
          listContext.show();
        }

        this.hideItems();
        var listSize = state.source.length;
        var pagesCount = Math.ceil(listSize / options.total);
        state = Object.assign({}, state, {
          total: listSize,
          totalPages: pagesCount
        });

        if (state.totalPages > 1) {
          this.buildPager();
          hasPager = true;
        } else {
          hasPager = false;
        }

        this.showItems();
        this.bindListEvents();
      }
    };
    /* Display list at application start and if search field is enabled
    */

    var init = function init() {
      API.build();

      if (options.enabledSearchBox) {
        API.buildSearchBox();
      }
    };

    init();
  };

  $(document).ready(function () {
    $("#year").text(new Date().getFullYear());
    $(".students").listItems({
      itemSelector: ".students__item"
    });
  });
}